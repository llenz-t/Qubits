/**
 * One component, three call sites: student/parent dashboards render it
 * read-only (via `showOnlyMessages` / `showOnlyEvents`, one on each
 * dashboard section), admin renders it full (both sections, plus the
 * create/delete event controls gated on `isAdmin`). `apiBase` picks
 * which portal's message-read endpoint to hit; events are always
 * fetched from the shared `/api/admin/events` list.
 */
import { useState, useEffect } from 'react';
import { CalendarDots, Warning, Trash } from '@phosphor-icons/react';

interface Event {
  eventid: string;
  title: string;
  description: string;
  eventdate?: string;
  postedat: string;
}

interface ImportantMessage {
  messageid: string;
  modulename: string;
  messagetext: string;
  absentcountatsend: number;
  sentat: string;
  acknowledged: boolean;
}

interface InformationPageProps {
  studentId?: string;
  isAdmin?: boolean;
  apiBase: string;
  showOnlyMessages?: boolean;
  showOnlyEvents?: boolean;
}

export default function InformationPage({ studentId, isAdmin, apiBase, showOnlyMessages, showOnlyEvents }: InformationPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [messages, setMessages] = useState<ImportantMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', eventdate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [studentId]);

  async function loadData() {
    setLoading(true);
    try {
      const eventsRes = await fetch('/api/admin/events');
      const eventsData = await eventsRes.json();
      setEvents(eventsData);

      if (studentId) {
        const messagesRes = await fetch(`${apiBase}/messages`);
        const messagesData = await messagesRes.json();
        setMessages(messagesData);
      }
    } catch (err) {
      console.error('Failed to load information:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEvent.title.trim(),
          description: newEvent.description.trim() || null,
          eventdate: newEvent.eventdate || null
        })
      });
      if (res.ok) {
        setNewEvent({ title: '', description: '', eventdate: '' });
        loadData();
      }
    } catch (err) {
      console.error('Failed to create event:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  }

  async function markAsRead(messageId: string) {
    try {
      await fetch(`${apiBase}/messages/${messageId}/read`, { method: 'PATCH' });
      setMessages(prev => prev.map(m => m.messageid === messageId ? { ...m, acknowledged: true } : m));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }

  function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  if (loading) {
    return <div style={{padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px'}}>Loading information...</div>;
  }

  // Messages are per-student (there's nothing to show without a studentId,
  // e.g. on the admin's Information tab), events are global to the college.
  const shouldShowMessages = !showOnlyEvents && studentId;
  const shouldShowEvents = !showOnlyMessages;

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
      {/* IMPORTANT MESSAGES SECTION */}
      {shouldShowMessages && (
        <div style={{backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <Warning size={24} weight="fill" color="#f59e0b" />
            <h2 style={{fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0}}>
              Important Messages
            </h2>
          </div>

          {messages.length === 0 ? (
            <p style={{color: '#94a3b8', textAlign: 'center', padding: '24px', fontSize: '14px'}}>No important messages</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {messages.map(msg => (
                <div key={msg.messageid} style={{
                  padding: '16px',
                  backgroundColor: msg.acknowledged ? '#f8fafc' : '#fffbeb',
                  borderRadius: '10px',
                  border: `1px solid ${msg.acknowledged ? '#e2e8f0' : '#fcd34d'}`
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px'}}>
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: '700', color: '#0f172a', marginBottom: '6px', fontSize: '14px'}}>{msg.modulename}</div>
                      <p style={{fontSize: '14px', color: '#475569', marginBottom: '8px', lineHeight: 1.5}}>{msg.messagetext}</p>
                      <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: '500'}}>
                        Sent {timeAgo(msg.sentat)}
                      </div>
                    </div>
                    {!msg.acknowledged && apiBase.includes('/students/') && (
                      <button
                        onClick={() => markAsRead(msg.messageid)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#059669',
                          backgroundColor: 'white',
                          border: '1px solid #059669',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#059669';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#059669';
                        }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EVENTS SECTION */}
      {shouldShowEvents && (
        <div style={{backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <CalendarDots size={24} weight="fill" color="#3b82f6" />
            <h2 style={{fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0}}>
              Events
            </h2>
          </div>

          {isAdmin && (
            <form onSubmit={handleCreateEvent} style={{marginBottom: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
              <input
                type="text"
                placeholder="Event title"
                value={newEvent.title}
                onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
                disabled={submitting}
              />
              <textarea
                placeholder="Description (optional)"
                value={newEvent.description}
                onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                disabled={submitting}
              />
              <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                <input
                  type="date"
                  value={newEvent.eventdate}
                  onChange={e => setNewEvent(prev => ({ ...prev, eventdate: e.target.value }))}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={!newEvent.title.trim() || submitting}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: submitting || !newEvent.title.trim() ? '#cbd5e1' : '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: submitting || !newEvent.title.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting && newEvent.title.trim()) {
                      e.currentTarget.style.backgroundColor = '#047857';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting && newEvent.title.trim()) {
                      e.currentTarget.style.backgroundColor = '#059669';
                    }
                  }}
                >
                  {submitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          )}

          {events.length === 0 ? (
            <p style={{color: '#94a3b8', textAlign: 'center', padding: '24px', fontSize: '14px'}}>No events posted yet</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {events.map(event => (
                <div key={event.eventid} style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px'}}>
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: '700', color: '#0f172a', marginBottom: '6px', fontSize: '15px'}}>{event.title}</div>
                      {event.description && <p style={{fontSize: '14px', color: '#64748b', marginBottom: '8px', lineHeight: 1.5}}>{event.description}</p>}
                      <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: '500'}}>
                        {event.eventdate && (
                          <span style={{marginRight: '12px'}}>
                            <CalendarDots size={14} weight="fill" style={{display: 'inline', marginRight: '4px', verticalAlign: 'middle'}} />
                            {new Date(event.eventdate).toLocaleDateString()}
                          </span>
                        )}
                        <span>Posted {timeAgo(event.postedat)}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteEvent(event.eventid)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#dc2626',
                          backgroundColor: 'white',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                      >
                        <Trash size={14} weight="bold" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
