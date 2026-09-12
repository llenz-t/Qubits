import React, { useEffect, useState, useCallback } from 'react';
import { FileCheck2, FileX2, ExternalLink, Loader2, Inbox } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { approveJustification, fetchPendingJustifications, rejectJustification } from '../../lib/apiClient';
import { PendingJustification } from '../../types/aaa';

const DEMO_ROWS: PendingJustification[] = [
  {
    id: 'demo-1',
    reason: 'Hospital visit - attached medical certificate',
    proofStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    signedUrl: null,
    student: { id: 'demo-student-1', rollNumber: 'NP03CS4S24014', fullName: 'Aarav Sharma' },
    session: {
      id: 'demo-session-1',
      scheduledDate: '2026-09-08',
      sessionType: 'WORKSHOP',
      moduleCode: 'CC5051NI',
      moduleName: 'Databases',
    },
  },
  {
    id: 'demo-2',
    reason: 'Family emergency - out of Kathmandu',
    proofStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    signedUrl: null,
    student: { id: 'demo-student-2', rollNumber: 'NP03CS4S24022', fullName: 'Priya Thapa' },
    session: {
      id: 'demo-session-2',
      scheduledDate: '2026-09-09',
      sessionType: 'LECTURE',
      moduleCode: 'CS5002NI',
      moduleName: 'Software Engineering',
    },
  },
];

export const AdminVerificationWorkbench: React.FC = () => {
  const [rows, setRows] = useState<PendingJustification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (isSupabaseConfigured) {
      try {
        const live = await fetchPendingJustifications();
        setRows(live);
        setIsLive(true);
        setLoading(false);
        return;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pending justifications');
      }
    }
    setRows(DEMO_ROWS);
    setIsLive(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDecision = async (id: string, decision: 'approve' | 'reject') => {
    setBusyId(id);
    const previous = rows;
    setRows((prev) => prev.filter((r) => r.id !== id)); // optimistic removal

    try {
      if (isLive) {
        if (decision === 'approve') await approveJustification(id);
        else await rejectJustification(id);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 400)); // demo mode
      }
    } catch (err) {
      setRows(previous); // revert on failure
      setError(err instanceof Error ? err.message : `Failed to ${decision} justification`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Absence Verification</h2>
        <span className="text-xs font-bold text-neutral-400">{rows.length} Pending</span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-neutral-400 text-sm font-semibold">
          <Loader2 size={16} className="animate-spin" />
          <span>Loading...</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 p-10 text-neutral-400 border border-dashed border-neutral-200 rounded-2xl">
          <Inbox size={28} />
          <span className="text-sm font-semibold">No pending absence requests</span>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-700 font-semibold">
                  <th className="px-4 py-2.5 border-r border-neutral-200">Student</th>
                  <th className="px-4 py-2.5 border-r border-neutral-200">Session</th>
                  <th className="px-4 py-2.5 border-r border-neutral-200">Reason</th>
                  <th className="px-4 py-2.5 border-r border-neutral-200 w-24">Proof</th>
                  <th className="px-4 py-2.5 w-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-4 py-3 border-r border-neutral-100">
                      <div className="font-semibold text-neutral-900">{r.student.fullName}</div>
                      <div className="font-mono text-[11px] text-neutral-500">{r.student.rollNumber}</div>
                    </td>
                    <td className="px-4 py-3 border-r border-neutral-100">
                      <div className="font-semibold text-neutral-800">{r.session.moduleName}</div>
                      <div className="text-[11px] text-neutral-500">
                        {r.session.sessionType} &middot; {r.session.scheduledDate}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-neutral-100 max-w-xs">
                      <span className="text-neutral-700">{r.reason}</span>
                    </td>
                    <td className="px-4 py-3 border-r border-neutral-100">
                      {r.signedUrl ? (
                        <a
                          href={r.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#0c3830] font-bold hover:underline"
                        >
                          <span>View</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-neutral-400 italic">demo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => handleDecision(r.id, 'approve')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <FileCheck2 size={13} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => handleDecision(r.id, 'reject')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <FileX2 size={13} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
