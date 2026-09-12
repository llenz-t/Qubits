'use strict';

const { supabaseAdmin, supabaseAnon } = require('../config/supabaseClient');

/**
 * Reads "Authorization: Bearer <token>", verifies it against Supabase Auth,
 * and attaches { id, email } as req.user. Also resolves whether the caller
 * is an admin (admins table) or a student (students table) and attaches
 * req.isAdmin / req.studentId accordingly.
 *
 * This is deliberately simple for an MVP: real production hardening would add
 * token caching and rate limiting, but every request is still independently
 * verified against Supabase - nothing here trusts the client.
 */
async function attachIdentity(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      req.user = null;
      req.isAdmin = false;
      req.studentId = null;
      return next();
    }

    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data?.user) {
      req.user = null;
      req.isAdmin = false;
      req.studentId = null;
      return next();
    }

    req.user = { id: data.user.id, email: data.user.email };

    const [{ data: adminRow }, { data: studentRow }] = await Promise.all([
      supabaseAdmin.from('admins').select('user_id').eq('user_id', data.user.id).maybeSingle(),
      supabaseAdmin.from('students').select('id').eq('user_id', data.user.id).maybeSingle(),
    ]);

    req.isAdmin = Boolean(adminRow);
    req.studentId = studentRow ? studentRow.id : null;
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  return next();
}

/**
 * Allows the request through only if the caller is an admin OR the caller is
 * the student identified by req.params[studentIdParam]. Use for
 * student-scoped read endpoints (dashboard, weekly trend, own justifications).
 */
function requireSelfOrAdmin(studentIdParam) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const targetId = req.params[studentIdParam];
    if (req.isAdmin || req.studentId === targetId) {
      return next();
    }
    return res.status(403).json({ error: 'Not authorized to view this student' });
  };
}

module.exports = { attachIdentity, requireAuth, requireAdmin, requireSelfOrAdmin };
