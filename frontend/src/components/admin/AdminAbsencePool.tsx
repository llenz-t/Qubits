/**
 * Admin's "Just Absent Students" tab (formerly "Absence Pool"): the
 * automation engine's queue of student+course pairs that have crossed
 * the 3-absence threshold and haven't yet been notified at their
 * current absence count (GET /api/admin/absence-pool). Each row has an
 * editable pre-filled message and its own Send button; "Send All" fires
 * every row's message in parallel via the same per-row send path.
 */
import { useState, useEffect } from 'react';
import { Fire, PaperPlaneTilt } from '@phosphor-icons/react';

interface PoolEntry {
  studentid: string;
  studentname: string;
  sectioncode: string;
  moduleid: string;
  modulename: string;
  absentcount: number;
}

// One pool row is a (student, course) pair, not just a student — the same
// student can appear once per course they're behind in.
function poolKey(studentid: string, moduleid: string) {
  return `${studentid}_${moduleid}`;
}

export default function AdminAbsencePool() {
  const [pool, setPool] = useState<PoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Map<string, string>>(new Map());
  const [sending, setSending] = useState<Set<string>>(new Set());
  const [sendingAll, setSendingAll] = useState(false);
  const [sendAllError, setSendAllError] = useState('');

  useEffect(() => {
    loadPool();
  }, []);

  async function loadPool() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/absence-pool');
      const data = await res.json();
      setPool(data);

      // Pre-fill default messages
      const defaultMessages = new Map<string, string>();
      for (const entry of data) {
        const key = `${entry.studentid}_${entry.moduleid}`;
        defaultMessages.set(key, `${entry.studentname} has been marked Absent ${entry.absentcount} times in ${entry.modulename}. Please ensure regular attendance going forward.`);
      }
      setMessages(defaultMessages);
    } catch (err) {
      console.error('Failed to load absence pool:', err);
    } finally {
      setLoading(false);
    }
  }

  // Posts one row's message. Returns success/failure instead of throwing
  // so both handleSend (one row) and handleSendAll (every row via
  // Promise.allSettled) can react without a try/catch at each call site.
  async function sendOne(entry: PoolEntry): Promise<boolean> {
    const key = poolKey(entry.studentid, entry.moduleid);
    const messageText = (messages.get(key) || '').trim();
    if (!messageText) return false;

    try {
      const res = await fetch('/api/admin/absence-pool/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: entry.studentid,
          moduleId: entry.moduleid,
          messageText,
          absentCountAtSend: entry.absentcount
        })
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to send message:', err);
      return false;
    }
  }

  // Optimistic update after a successful send: the row is done, so drop
  // it from the pool and forget its draft message rather than reloading.
  function removeFromPool(key: string) {
    setPool(prev => prev.filter(e => poolKey(e.studentid, e.moduleid) !== key));
    setMessages(prev => {
      const updated = new Map(prev);
      updated.delete(key);
      return updated;
    });
  }

  async function handleSend(entry: PoolEntry) {
    const key = poolKey(entry.studentid, entry.moduleid);
    setSending(prev => new Set(prev).add(key));
    const ok = await sendOne(entry);
    if (ok) removeFromPool(key);
    setSending(prev => {
      const updated = new Set(prev);
      updated.delete(key);
      return updated;
    });
  }

  // Sends every row with a non-empty message in parallel. Rows without
  // text are skipped rather than blocking the whole batch. Successes are
  // removed as they land; failures stay in the pool so they can be
  // retried (individually or via Send All again).
  async function handleSendAll() {
    const sendable = pool.filter(e => (messages.get(poolKey(e.studentid, e.moduleid)) || '').trim());
    if (sendable.length === 0) return;

    setSendAllError('');
    setSendingAll(true);
    setSending(prev => {
      const updated = new Set(prev);
      sendable.forEach(e => updated.add(poolKey(e.studentid, e.moduleid)));
      return updated;
    });

    const results = await Promise.allSettled(sendable.map(sendOne));

    let failedCount = 0;
    results.forEach((result, i) => {
      const key = poolKey(sendable[i].studentid, sendable[i].moduleid);
      if (result.status === 'fulfilled' && result.value) {
        removeFromPool(key);
      } else {
        failedCount += 1;
      }
      setSending(prev => {
        const updated = new Set(prev);
        updated.delete(key);
        return updated;
      });
    });

    setSendAllError(failedCount > 0 ? `${failedCount} message${failedCount > 1 ? 's' : ''} failed to send — try again.` : '');
    setSendingAll(false);
  }

  function updateMessage(studentId: string, moduleId: string, text: string) {
    const key = poolKey(studentId, moduleId);
    setMessages(prev => new Map(prev).set(key, text));
  }

  if (loading) {
    return <div style={{padding: '2rem', textAlign: 'center', color: '#64748b'}}>Loading absence pool...</div>;
  }

  return (
    <div style={{backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0'}}>
      <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem'}}>
        <h2 style={{fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <Fire size={20} weight="regular" color="#ef4444" /> Absence Pool
        </h2>
        {pool.length > 0 && (
          <button
            onClick={handleSendAll}
            disabled={sendingAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: sendingAll ? '#fca5a5' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: sendingAll ? 'not-allowed' : 'pointer'
            }}
          >
            <PaperPlaneTilt size={16} weight="fill" />
            {sendingAll ? 'Sending…' : `Send All (${pool.length})`}
          </button>
        )}
      </div>
      <p style={{fontSize: '0.875rem', color: '#64748b', marginBottom: sendAllError ? '0.75rem' : '1.5rem'}}>
        Students with 3+ absences who haven't been notified yet at their current absence level
      </p>
      {sendAllError && (
        <p style={{fontSize: '0.8125rem', color: '#dc2626', fontWeight: '500', marginBottom: '1.5rem'}}>
          {sendAllError}
        </p>
      )}

      {pool.length === 0 ? (
        <div style={{textAlign: 'center', padding: '2rem', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '0.5rem'}}>
          No students currently flagged
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {pool.map(entry => {
            const key = `${entry.studentid}_${entry.moduleid}`;
            const messageText = messages.get(key) || '';
            const isSending = sending.has(key);

            return (
              <div key={key} style={{padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca'}}>
                <div style={{display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap'}}>
                  <div style={{flex: '1 1 200px'}}>
                    <div style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.125rem'}}>Student</div>
                    <div style={{fontWeight: '600', color: '#0f172a'}}>{entry.studentname}</div>
                    <div style={{fontSize: '0.8125rem', color: '#64748b'}}>{entry.studentid} • {entry.sectioncode}</div>
                  </div>
                  <div style={{flex: '1 1 200px'}}>
                    <div style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.125rem'}}>Module</div>
                    <div style={{fontWeight: '600', color: '#0f172a'}}>{entry.modulename}</div>
                  </div>
                  <div style={{flex: '0 0 auto'}}>
                    <div style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.125rem'}}>Absences</div>
                    <div style={{fontSize: '1.5rem', fontWeight: '700', color: '#dc2626'}}>{entry.absentcount}</div>
                  </div>
                </div>

                <textarea
                  value={messageText}
                  onChange={e => updateMessage(entry.studentid, entry.moduleid, e.target.value)}
                  disabled={isSending}
                  style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.9375rem', minHeight: '4rem', marginBottom: '0.5rem', resize: 'vertical'}}
                />

                <button
                  onClick={() => handleSend(entry)}
                  disabled={isSending || !messageText.trim()}
                  style={{padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: '500', cursor: isSending || !messageText.trim() ? 'not-allowed' : 'pointer', opacity: isSending || !messageText.trim() ? 0.5 : 1, fontSize: '0.875rem'}}
                >
                  {isSending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
