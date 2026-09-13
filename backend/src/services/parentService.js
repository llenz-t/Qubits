/**
 * Backs the parent portal's phone-number "login". There's no dedicated
 * lookup index or format validation — phone numbers are compared as
 * digits-only so formatting differences (dashes, spaces, +977, etc.)
 * between what's stored and what's typed don't cause false negatives.
 */
const supabase = require('../config/supabaseClient');

function normalizePhone(phone) {
  return phone.replace(/\D/g, '');
}

// Loads every parent and compares normalized numbers client-side rather
// than filtering in SQL, since Postgres can't easily strip formatting
// from a stored column in a single .eq() filter. Fine at this data scale.
async function findParentByPhone(phone) {
  const normalized = normalizePhone(phone);
  const { data, error } = await supabase.from('parents').select('parentid, parentname, relationtostudent, studentid, contactnumber');
  if (error) throw error;
  return (data || []).find(p => normalizePhone(p.contactnumber) === normalized);
}

module.exports = { findParentByPhone };
