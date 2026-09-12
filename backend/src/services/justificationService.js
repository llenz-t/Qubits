'use strict';

const PROOF_BUCKET = 'absence-proofs';

class JustificationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'JustificationError';
    this.status = status;
  }
}

/**
 * Server-mediated path for submitting an absence justification: uploads the
 * PDF to the private `absence-proofs` bucket under `<studentId>/<...>` and
 * inserts the absence_justifications row. This mirrors what the frontend
 * form does directly against Supabase (see src/components/attendance/
 * AbsenceJustificationForm.tsx) - kept here too so a non-browser client
 * (or a future mobile app) has an HTTP endpoint that doesn't need a Supabase
 * client SDK at all.
 */
async function submitJustification(supabaseAdmin, { studentId, sessionId, reason, pdfBuffer, pdfOriginalName }) {
  if (!studentId || !sessionId || !reason || !pdfBuffer) {
    throw new JustificationError('studentId, sessionId, reason and a PDF file are all required');
  }

  const safeName = String(pdfOriginalName || 'proof.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${studentId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(PROOF_BUCKET)
    .upload(path, pdfBuffer, { contentType: 'application/pdf', upsert: false });

  if (uploadError) {
    throw new JustificationError(`Failed to upload proof PDF: ${uploadError.message}`, 502);
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('absence_justifications')
    .insert({
      student_id: studentId,
      session_id: sessionId,
      reason,
      pdf_proof_url: path,
      proof_status: 'PENDING',
    })
    .select()
    .single();

  if (insertError) {
    // Roll back the uploaded file so we don't leak orphaned storage objects.
    await supabaseAdmin.storage.from(PROOF_BUCKET).remove([path]);
    if (insertError.code === '23505') {
      throw new JustificationError('A justification for this session has already been submitted.', 409);
    }
    throw new JustificationError(`Failed to save justification: ${insertError.message}`, 502);
  }

  return inserted;
}

async function listPendingJustifications(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from('absence_justifications')
    .select(
      `id, reason, pdf_proof_url, proof_status, created_at,
       students ( id, roll_number, full_name ),
       course_sessions ( id, scheduled_date, session_type, modules ( code, name ) )`
    )
    .eq('proof_status', 'PENDING')
    .order('created_at', { ascending: true });

  if (error) {
    throw new JustificationError(`Failed to load pending justifications: ${error.message}`, 502);
  }

  // Sign each PDF URL for the "View PDF Proof" action (bucket is private).
  const withSignedUrls = await Promise.all(
    data.map(async (row) => {
      if (!row.pdf_proof_url) return { ...row, signedUrl: null };
      const { data: signed } = await supabaseAdmin.storage
        .from(PROOF_BUCKET)
        .createSignedUrl(row.pdf_proof_url, 60 * 10); // 10 minutes
      return { ...row, signedUrl: signed?.signedUrl || null };
    })
  );

  return withSignedUrls;
}

module.exports = { JustificationError, submitJustification, listPendingJustifications, PROOF_BUCKET };
