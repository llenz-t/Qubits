'use strict';

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin;
let supabaseAnon;

if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY) {
  // Service-role client: bypasses Row Level Security. Only ever used AFTER this
  // server has independently verified the caller's identity/role (see
  // middleware/auth.js) - never expose this key or this client to the frontend.
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Anon client: used only to validate a bearer token via supabase.auth.getUser(token).
  supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} else {
  // Graceful in-memory fallback for development and demo mode when Supabase is not connected.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabaseClient] Missing SUPABASE credentials - using in-memory mock client. ' +
      'Data will be ephemeral.'
  );

  const mockJustifications = [
    {
      id: 'just-mock-1',
      student_id: 'demo-student-1',
      session_id: 'demo-session-1',
      reason: 'Hospital visit - attached medical certificate',
      pdf_proof_url: 'demo-student-1/medical-cert.pdf',
      proof_status: 'PENDING',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      students: { id: 'demo-student-1', roll_number: 'NP03CS4S24014', full_name: 'Aarav Sharma' },
      course_sessions: {
        id: 'demo-session-1',
        scheduled_date: '2026-09-08',
        session_type: 'WORKSHOP',
        modules: { code: 'CC5051NI', name: 'Databases' },
      },
    },
    {
      id: 'just-mock-2',
      student_id: 'demo-student-2',
      session_id: 'demo-session-2',
      reason: 'Family emergency - out of Kathmandu',
      pdf_proof_url: 'demo-student-2/emergency-note.pdf',
      proof_status: 'PENDING',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      students: { id: 'demo-student-2', roll_number: 'NP03CS4S24022', full_name: 'Priya Thapa' },
      course_sessions: {
        id: 'demo-session-2',
        scheduled_date: '2026-09-09',
        session_type: 'LECTURE',
        modules: { code: 'CS5002NI', name: 'Software Engineering' },
      },
    },
  ];

  const inMemoryFiles = new Map();

  supabaseAnon = {
    auth: {
      getUser: async (_token) => ({
        data: { user: { id: 'demo-user-id', email: 'demo@attendease.edu' } },
        error: null,
      }),
    },
  };

  supabaseAdmin = {
    from: (table) => ({
      select: (_cols) => ({
        eq: (field, val) => ({
          maybeSingle: async () => {
            if (table === 'admins') return { data: { user_id: val }, error: null };
            if (table === 'students') return { data: { id: 'demo-student-id' }, error: null };
            return { data: null, error: null };
          },
          order: async () => ({
            data: mockJustifications.filter((j) => (j[field] ?? j.proof_status) === val),
            error: null,
          }),
        }),
        order: async () => ({ data: mockJustifications, error: null }),
      }),
      insert: (row) => {
        const item = {
          id: 'just-' + Date.now(),
          created_at: new Date().toISOString(),
          proof_status: 'PENDING',
          students: { id: row.student_id, roll_number: 'NP03CS4S24099', full_name: 'Enrolled Student' },
          course_sessions: {
            id: row.session_id,
            scheduled_date: new Date().toISOString().slice(0, 10),
            session_type: 'WORKSHOP',
            modules: { code: 'CC5051NI', name: 'Databases' },
          },
          ...row,
        };
        mockJustifications.unshift(item);
        return {
          select: () => ({
            single: async () => ({ data: item, error: null }),
          }),
        };
      },
    }),
    rpc: async (fnName, params) => {
      if (fnName === 'fn_import_attendance_batch') {
        const count = params?.p_rows?.length || 0;
        return { data: { inserted: count, updated: 0, errors: [] }, error: null };
      }
      if (fnName === 'fn_cancel_session') {
        return { data: { id: params?.p_session_id, canceled: true, reason: params?.p_reason }, error: null };
      }
      if (fnName === 'fn_uncancel_session') {
        return { data: { id: params?.p_session_id, canceled: false }, error: null };
      }
      if (fnName === 'fn_approve_justification') {
        const found = mockJustifications.find((j) => j.id === params?.p_justification_id);
        if (found) found.proof_status = 'APPROVED';
        return { data: { id: params?.p_justification_id, proof_status: 'APPROVED' }, error: null };
      }
      if (fnName === 'fn_reject_justification') {
        const found = mockJustifications.find((j) => j.id === params?.p_justification_id);
        if (found) found.proof_status = 'REJECTED';
        return { data: { id: params?.p_justification_id, proof_status: 'REJECTED' }, error: null };
      }
      if (fnName === 'fn_get_student_dashboard') {
        return {
          data: {
            student: {
              id: params?.p_student_id || 'demo-student',
              rollNumber: 'NP03CS4S24014',
              fullName: 'Aarav Sharma',
              degreeId: 'ai',
              year: 2,
              intakeBatch: 'Batch 32',
            },
            overall: {
              attendanceRate: 88.5,
              scholarshipZone: 'PLATINUM',
              adjustedTotal: 48,
              scheduledTotal: 48,
              attendedTotal: 43,
              presentCount: 42,
              excusedCount: 1,
              absentCount: 5,
              canceledCount: 0,
              ltw: { lectureRate: 92, tutorialRate: 85, workshopRate: 88 },
            },
            modules: [],
          },
          error: null,
        };
      }
      if (fnName === 'fn_get_weekly_trend') {
        return {
          data: [
            { week_start: '2026-07-20', attendance_rate: 85 },
            { week_start: '2026-07-27', attendance_rate: 90 },
            { week_start: '2026-08-03', attendance_rate: 88 },
            { week_start: '2026-08-10', attendance_rate: 89 },
          ],
          error: null,
        };
      }
      return { data: {}, error: null };
    },
    storage: {
      from: (_bucket) => ({
        upload: async (filePath, buffer) => {
          inMemoryFiles.set(filePath, buffer);
          return { data: { path: filePath }, error: null };
        },
        remove: async (paths) => {
          for (const p of paths) inMemoryFiles.delete(p);
          return { data: {}, error: null };
        },
        createSignedUrl: async (_path, _expiresIn) => ({
          data: { signedUrl: '#' },
          error: null,
        }),
      }),
    },
  };
}

module.exports = { supabaseAdmin, supabaseAnon };
