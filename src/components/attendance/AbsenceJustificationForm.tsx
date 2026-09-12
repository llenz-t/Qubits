import React, { useState, useRef } from 'react';
import { FileText, UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { MissedSessionOption } from '../../types/aaa';

const PROOF_BUCKET = 'absence-proofs';
const MAX_PDF_BYTES = 5 * 1024 * 1024;

interface AbsenceJustificationFormProps {
  studentId: string | null;
  missedSessions: MissedSessionOption[];
  onClose: () => void;
  onSubmitted?: () => void;
}

export const AbsenceJustificationForm: React.FC<AbsenceJustificationFormProps> = ({
  studentId,
  missedSessions,
  onClose,
  onSubmitted,
}) => {
  const [sessionId, setSessionId] = useState<string>(missedSessions[0]?.sessionId || '');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (candidate: File) => {
    if (candidate.type !== 'application/pdf' && !candidate.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Only PDF files are accepted as proof.');
      return;
    }
    if (candidate.size > MAX_PDF_BYTES) {
      setErrorMsg('File is too large - the limit is 5MB.');
      return;
    }
    setErrorMsg(null);
    setFile(candidate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !reason.trim() || !file) {
      setErrorMsg('Please choose a session, enter a reason, and attach a PDF.');
      return;
    }

    setStatus('submitting');
    setErrorMsg(null);

    try {
      if (isSupabaseConfigured && supabase && studentId) {
        // Directive-specified path: upload straight to Supabase Storage, then
        // insert the absence_justifications row from the browser.
        const path = `${studentId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from(PROOF_BUCKET)
          .upload(path, file, { contentType: 'application/pdf', upsert: false });
        if (uploadError) throw new Error(uploadError.message);

        const { error: insertError } = await supabase.from('absence_justifications').insert({
          student_id: studentId,
          session_id: sessionId,
          reason: reason.trim(),
          pdf_proof_url: path,
          proof_status: 'PENDING',
        });
        if (insertError) throw new Error(insertError.message);
      } else {
        // Demo mode: no Supabase project configured yet. Simulate the round
        // trip so the form is fully clickable/testable out of the box.
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setStatus('success');
      onSubmitted?.();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit justification.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#0c3830]" />
            <h3 className="font-bold text-neutral-900 text-base">Absence Justification</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {status === 'success' ? (
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <CheckCircle2 size={40} className="text-emerald-600" />
            <div className="font-bold text-neutral-900">Submitted for review</div>
            <p className="text-sm text-neutral-500">
              An administrator will review your proof and update this session's status.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#0c3830] text-white hover:bg-[#092923] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Missed Session</label>
              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
              >
                {missedSessions.length === 0 && <option value="">No missed sessions found</option>}
                {missedSessions.map((s) => (
                  <option key={s.sessionId} value={s.sessionId}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={3}
                placeholder="e.g. Hospital visit on this date, see attached medical certificate"
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0c3830] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Proof (PDF, max 5MB)</label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  isDragging ? 'border-[#0c3830] bg-emerald-50/50' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
                />
                <div className="flex flex-col items-center gap-1.5">
                  <UploadCloud size={22} className="text-neutral-500" />
                  <span className="text-sm font-semibold text-neutral-800">
                    {file ? file.name : 'Drop PDF here or click to browse'}
                  </span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#0c3830] text-white hover:bg-[#092923] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
