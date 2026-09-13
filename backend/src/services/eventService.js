/** CRUD for college-wide events shown on the Information tab/page (create + delete are admin-only, enforced by the frontend only — there's no auth check here). */
const supabase = require('../config/supabaseClient');

async function listEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('postedat', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function createEvent(event) {
  const eventId = `EVT-${Date.now()}`;
  const { data, error } = await supabase
    .from('events')
    .insert({ eventid: eventId, ...event, postedat: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteEvent(eventId) {
  const { error } = await supabase.from('events').delete().eq('eventid', eventId);
  if (error) throw error;
}

module.exports = { listEvents, createEvent, deleteEvent };
