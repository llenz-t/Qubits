/**
 * Lets a student upload a supporting file + reason for an absence, and
 * lists their past submissions with admin review status/comments.
 * Posts to POST /api/students/:id/justifications (multipart, backend
 * stores the file and creates a Pending row for admin review).
 */
import { useState, useEffect, type FormEvent } from 'react';
import { FileText, Paperclip } from '@phosphor-icons/react';
import { submitJustification, getStudentJustifications } from '../../lib/apiClient';
import type { Justification } from '../../types/canonical';
import StatusBadge from '../shared/StatusBadge';

interface JustificationFormProps {
  studentId: string;
}

export default function JustificationForm({ studentId }: JustificationFormProps) {
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [justifications, setJustifications] = useState<Justification[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadJustifications();
  }, [studentId]);

  async function loadJustifications() {
    try {
      const data = await getStudentJustifications(studentId);
      setJustifications(data);
    } catch (err) {
      console.error('Failed to load justifications:', err);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!reason.trim() || !file) {
      setError('Please provide a reason and upload a file');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await submitJustification(studentId, reason, file);
      setReason('');
      setFile(null);
      await loadJustifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Submit Form Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem'}}>
          Submit Absence Justification
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#334155',
              marginBottom: '0.5rem'
            }}>
              Reason for Absence
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Explain why you were absent..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#334155',
              marginBottom: '0.5rem'
            }}>
              Supporting Document
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.docx"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9375rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                backgroundColor: '#f8fafc',
                cursor: 'pointer'
              }}
            />
            <p style={{fontSize: '0.8125rem', color: '#64748b', marginTop: '0.5rem'}}>
              PDF, JPG, PNG, WEBP, or DOCX (max 5MB)
            </p>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              color: '#991b1b',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              backgroundColor: submitting ? '#94a3b8' : '#3b82f6',
              color: 'white',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              if (!submitting) e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Justification'}
          </button>
        </form>
      </div>

      {/* Submissions History */}
      <div>
        <h4 style={{fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem'}}>
          Submission History
        </h4>
        {justifications.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <FileText size={40} weight="light" color="#cbd5e1" style={{marginBottom: '1rem'}} />
            <p style={{color: '#64748b', fontSize: '0.9375rem'}}>No justifications submitted yet</p>
          </div>
        ) : (
          <div style={{display: 'grid', gap: '1rem'}}>
            {justifications.map((j) => (
              <div
                key={j.justificationid}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#64748b', fontWeight: '500'}}>
                    {new Date(j.submittedat).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <StatusBadge status={j.status} />
                </div>
                <p style={{color: '#0f172a', marginBottom: '1rem', lineHeight: '1.6'}}>{j.reason}</p>
                {j.fileurl && (
                  <a
                    href={j.fileurl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#3b82f6',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textDecoration: 'none',
                      marginBottom: j.admincomment ? '1rem' : '0'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    <Paperclip size={14} weight="bold" /> View Attachment
                  </a>
                )}
                {j.admincomment && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{fontSize: '0.8125rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem'}}>
                      Admin Comment
                    </div>
                    <p style={{fontSize: '0.9375rem', color: '#334155', lineHeight: '1.6'}}>
                      {j.admincomment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}