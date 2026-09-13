/**
 * Handles the student's absence-justification upload (file goes to
 * Supabase Storage, a Pending row goes to the `justifications` table)
 * and the admin's review of it. File URLs are never stored/returned as
 * permanent public links — createDownloadUrl mints a short-lived (5min)
 * signed URL per request instead.
 */
const supabase = require('../config/supabaseClient');

async function uploadJustification(studentId, file, reason, occurrenceId) {
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
  const storagePath = `${studentId}/${Date.now()}-${safeName}`;
  const { error: storageError } = await supabase.storage.from('justification-files').upload(storagePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false
  });
  if (storageError) throw storageError;

  // Generate justificationid (required, no database default)
  const justificationId = `JUST-${Date.now()}`;

  const { data, error } = await supabase.from('justifications').insert({
    justificationid: justificationId,
    studentid: studentId,
    occurrenceid: occurrenceId || null,
    reason: reason || '',
    fileurl: storagePath,
    status: 'Pending',
    submittedat: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

async function listJustifications() {
  const { data: students, error: studentError } = await supabase.from('students').select('studentid, studentname');
  if (studentError) throw studentError;
  const results = [];
  for (const student of students || []) {
    const { data, error } = await supabase.storage.from('justification-files').list(student.studentid, { sortBy: { column: 'created_at', order: 'desc' } });
    if (error) throw error;
    results.push(...(data || []).map(file => ({ ...file, studentId: student.studentid, studentName: student.studentname, path: `${student.studentid}/${file.name}` })));
  }
  return results;
}

// Mints a temporary signed URL (5 min) for a private storage object —
// used instead of a public bucket so uploaded medical certificates
// etc. aren't guessable/world-readable.
async function createDownloadUrl(path) {
  const { data, error } = await supabase.storage.from('justification-files').createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}

async function getStudentJustifications(studentId) {
  const { data, error } = await supabase.from('justifications').select('*').eq('studentid', studentId).order('submittedat', { ascending: false });
  if (error) throw error;
  const withUrls = await Promise.all((data || []).map(async j => ({
    ...j,
    fileurl: j.fileurl ? await createDownloadUrl(j.fileurl) : null
  })));
  return withUrls;
}

async function listAdminJustifications(status) {
  let query = supabase.from('justifications').select('*, students(studentname)').order('submittedat', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  const withUrls = await Promise.all((data || []).map(async j => ({
    ...j,
    studentname: j.students?.studentname,
    fileurl: j.fileurl ? await createDownloadUrl(j.fileurl) : null
  })));
  return withUrls;
}

async function reviewJustification(justificationId, review) {
  const { data, error } = await supabase.from('justifications').update({
    status: review.status,
    reviewedby: review.reviewedBy,
    admincomment: review.adminComment,
    reviewedat: new Date().toISOString()
  }).eq('justificationid', justificationId).select().single();
  if (error) throw error;
  return data;
}

module.exports = { uploadJustification, listJustifications, createDownloadUrl, getStudentJustifications, listAdminJustifications, reviewJustification };