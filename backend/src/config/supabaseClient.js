'use strict';

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  // Fail loudly at boot rather than surfacing confusing errors on the first request.
  // eslint-disable-next-line no-console
  console.error(
    '[supabaseClient] Missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY. ' +
      'Copy backend/.env.example to backend/.env and fill in your Supabase project credentials.'
  );
  process.exit(1);
}

// Service-role client: bypasses Row Level Security. Only ever used AFTER this
// server has independently verified the caller's identity/role (see
// middleware/auth.js) - never expose this key or this client to the frontend.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Anon client: used only to validate a bearer token via supabase.auth.getUser(token).
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = { supabaseAdmin, supabaseAnon };
