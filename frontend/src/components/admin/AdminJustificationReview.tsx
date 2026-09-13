/**
 * Admin's "Justifications" tab: a status-filtered queue of student
 * absence-justification submissions with one-click Approve/Reject.
 * Note: `reviewedBy` is hardcoded to 'Admin' — there's no multi-admin
 * identity in this demo.
 */
import { useState, useEffect } from 'react';
import { FileText, Paperclip } from '@phosphor-icons/react';
import { getAdminJustifications, reviewJustification } from '../../lib/apiClient';
import type { Justification } from '../../types/canonical';
import StatusBadge from '../shared/StatusBadge';

export default function AdminJustificationReview() {
  const [justifications, setJustifications] = useState<Justification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [reviewing, setReviewing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadJustifications();
  }, [statusFilter]);

  async function loadJustifications() {
    setLoading(true);
    try {
      const data = await getAdminJustifications(statusFilter);
      setJustifications(data);
    } catch (error) {
      console.error('Failed to load justifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(justificationId: number, status: 'Approved' | 'Rejected') {
    setReviewing(prev => ({ ...prev, [justificationId]: true }));
    try {
      await reviewJustification(justificationId.toString(), {
        status,
        reviewedBy: 'Admin',
        adminComment: ''
      });
      loadJustifications();
    } catch (error) {
      alert('Failed to review: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setReviewing(prev => ({ ...prev, [justificationId]: false }));
    }
  }

  return (
    <div style={{backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0'}}>
      <div style={{padding: '1.5rem', borderBottom: '1px solid #e2e8f0'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'}}>
          <div>
            <h2 style={{fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem'}}>Justification Review</h2>
            <p style={{fontSize: '0.875rem', color: '#64748b'}}>Review student absence justifications</p>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: '#64748b', marginBottom: '0.375rem'}}>
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '140px'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="">All</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{padding: '3rem', textAlign: 'center', color: '#64748b'}}>Loading justifications...</div>
      ) : justifications.length === 0 ? (
        <div style={{padding: '3rem', textAlign: 'center'}}>
          <FileText size={40} weight="light" color="#cbd5e1" style={{marginBottom: '1rem'}} />
          <p style={{color: '#64748b', fontSize: '0.9375rem'}}>No justifications found</p>
        </div>
      ) : (
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Student</th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Date</th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Reason</th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>File</th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Status</th>
                <th style={{padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {justifications.map((j, index) => (
                <tr
                  key={j.justificationid}
                  style={{
                    borderBottom: index < justifications.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{padding: '1rem', fontSize: '0.875rem', color: '#0f172a', fontWeight: '600'}}>
                    {j.studentname}
                  </td>
                  <td style={{padding: '1rem', fontSize: '0.875rem', color: '#64748b'}}>
                    {new Date(j.submittedat).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{padding: '1rem', fontSize: '0.875rem', color: '#0f172a', maxWidth: '300px'}}>
                    <div style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }} title={j.reason}>
                      {j.reason}
                    </div>
                  </td>
                  <td style={{padding: '1rem', fontSize: '0.875rem'}}>
                    {j.fileurl ? (
                      <a
                        href={j.fileurl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#059669',
                          textDecoration: 'none',
                          fontWeight: '500',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        <Paperclip size={14} weight="bold" /> View
                      </a>
                    ) : (
                      <span style={{color: '#cbd5e1'}}>—</span>
                    )}
                  </td>
                  <td style={{padding: '1rem', fontSize: '0.875rem'}}>
                    <StatusBadge status={j.status} />
                  </td>
                  <td style={{padding: '1rem', fontSize: '0.875rem'}}>
                    {j.status === 'Pending' ? (
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          onClick={() => handleReview(j.justificationid, 'Approved')}
                          disabled={reviewing[j.justificationid]}
                          style={{
                            padding: '0.375rem 0.75rem',
                            backgroundColor: reviewing[j.justificationid] ? '#94a3b8' : '#059669',
                            color: 'white',
                            fontSize: '0.875rem',
                            borderRadius: '0.375rem',
                            border: 'none',
                            cursor: reviewing[j.justificationid] ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            opacity: reviewing[j.justificationid] ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!reviewing[j.justificationid]) e.currentTarget.style.backgroundColor = '#047857';
                          }}
                          onMouseLeave={(e) => {
                            if (!reviewing[j.justificationid]) e.currentTarget.style.backgroundColor = '#059669';
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(j.justificationid, 'Rejected')}
                          disabled={reviewing[j.justificationid]}
                          style={{
                            padding: '0.375rem 0.75rem',
                            backgroundColor: reviewing[j.justificationid] ? '#94a3b8' : '#dc2626',
                            color: 'white',
                            fontSize: '0.875rem',
                            borderRadius: '0.375rem',
                            border: 'none',
                            cursor: reviewing[j.justificationid] ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            opacity: reviewing[j.justificationid] ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!reviewing[j.justificationid]) e.currentTarget.style.backgroundColor = '#b91c1c';
                          }}
                          onMouseLeave={(e) => {
                            if (!reviewing[j.justificationid]) e.currentTarget.style.backgroundColor = '#dc2626';
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500'}}>Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}