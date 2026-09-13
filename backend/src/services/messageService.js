/**
 * The automated-alert half of the app: reads/acknowledges the
 * "important messages" a student sees, and builds + sends from the
 * admin absence pool — the queue of students who've crossed the
 * 3-absence threshold and haven't been notified at their current count.
 */
const supabase = require('../config/supabaseClient');

async function getStudentMessages(studentId) {
  const { data, error } = await supabase
    .from('importantmessages')
    .select('*, modules(modulename)')
    .eq('studentid', studentId)
    .order('sentat', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    messageid: row.messageid,
    modulename: row.modules?.modulename,
    messagetext: row.messagetext,
    absentcountatsend: row.absentcountatsend,
    sentat: row.sentat,
    acknowledged: row.acknowledged
  }));
}

async function markAsRead(messageId) {
  const { error } = await supabase
    .from('importantmessages')
    .update({ acknowledged: true })
    .eq('messageid', messageId);
  if (error) throw error;
}

// The pool = every (student, module) with totaleffectiveabsent >= 3
// that hasn't yet been messaged at their current absence count. Tries a
// Postgres RPC first (a single NOT EXISTS query, fast); if that
// function isn't deployed to this Supabase project, falls back to two
// plain queries plus an in-memory diff against the highest
// absentcountatsend already sent per pair — same result, more round trips.
async function getAbsencePool() {
  // ponytail: raw SQL via .rpc(), rewrite with query builder if Supabase adds NOT EXISTS sugar
  const { data, error } = await supabase.rpc('get_absence_pool');

  if (error) {
    // Fallback: client-side filter if RPC not available
    const { data: summaries, error: summaryError } = await supabase
      .from('attendancesummary')
      .select('studentid, moduleid, totaleffectiveabsent, students(studentname, sections(sectioncode)), modules(modulename)')
      .gte('totaleffectiveabsent', 3);
    if (summaryError) throw summaryError;

    const { data: messages, error: msgError } = await supabase
      .from('importantmessages')
      .select('studentid, moduleid, absentcountatsend');
    if (msgError) throw msgError;

    const msgMap = new Map();
    for (const m of messages || []) {
      const key = `${m.studentid}_${m.moduleid}`;
      const existing = msgMap.get(key);
      if (!existing || m.absentcountatsend > existing) {
        msgMap.set(key, m.absentcountatsend);
      }
    }

    return (summaries || [])
      .filter(s => {
        const key = `${s.studentid}_${s.moduleid}`;
        const lastSent = msgMap.get(key);
        return !lastSent || lastSent < s.totaleffectiveabsent;
      })
      .map(s => ({
        studentid: s.studentid,
        studentname: s.students?.studentname,
        sectioncode: s.students?.sections?.sectioncode,
        moduleid: s.moduleid,
        modulename: s.modules?.modulename,
        absentcount: s.totaleffectiveabsent
      }));
  }

  return data || [];
}

// Records one sent notification as an importantmessages row (which is
// what the student portal reads back and what future getAbsencePool
// calls compare absentCountAtSend against to avoid re-notifying at the
// same absence level).
async function sendAbsenceMessage(payload) {
  const { studentId, moduleId, messageText, absentCountAtSend } = payload;
  const messageId = `MSG-${Date.now()}`;
  const { data, error } = await supabase
    .from('importantmessages')
    .insert({
      messageid: messageId,
      studentid: studentId,
      moduleid: moduleId,
      messagetext: messageText,
      absentcountatsend: absentCountAtSend,
      sentat: new Date().toISOString(),
      acknowledged: false
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

module.exports = { getStudentMessages, markAsRead, getAbsencePool, sendAbsenceMessage };
