import { getAccessToken } from './supabaseClient';
import type {
  AttendanceUploadReport,
  PendingJustification,
  StudentDashboardResponse,
  WeeklyTrendPoint,
} from '../types/aaa';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson && body?.error ? body.error : `Request to ${path} failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return body as T;
}

export function fetchStudentDashboard(studentId: string): Promise<StudentDashboardResponse> {
  return request<StudentDashboardResponse>(`/students/${studentId}/dashboard`);
}

export function fetchWeeklyTrend(studentId: string, moduleId?: string): Promise<WeeklyTrendPoint[]> {
  const qs = moduleId ? `?moduleId=${encodeURIComponent(moduleId)}` : '';
  return request<WeeklyTrendPoint[]>(`/students/${studentId}/weekly-trend${qs}`);
}

export function uploadAttendanceExcel(file: File): Promise<AttendanceUploadReport> {
  const formData = new FormData();
  formData.append('file', file);
  return request<AttendanceUploadReport>('/attendance/upload', { method: 'POST', body: formData });
}

export function cancelSession(sessionId: string, reason: string) {
  return request(`/sessions/${sessionId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function fetchPendingJustifications(): Promise<PendingJustification[]> {
  return request<
    Array<{
      id: string;
      reason: string;
      proof_status: PendingJustification['proofStatus'];
      created_at: string;
      signedUrl: string | null;
      students: { id: string; roll_number: string; full_name: string };
      course_sessions: {
        id: string;
        scheduled_date: string;
        session_type: PendingJustification['session']['sessionType'];
        modules: { code: string; name: string };
      };
    }>
  >('/justifications/pending').then((rows) =>
    rows.map((r) => ({
      id: r.id,
      reason: r.reason,
      proofStatus: r.proof_status,
      createdAt: r.created_at,
      signedUrl: r.signedUrl,
      student: {
        id: r.students.id,
        rollNumber: r.students.roll_number,
        fullName: r.students.full_name,
      },
      session: {
        id: r.course_sessions.id,
        scheduledDate: r.course_sessions.scheduled_date,
        sessionType: r.course_sessions.session_type,
        moduleCode: r.course_sessions.modules.code,
        moduleName: r.course_sessions.modules.name,
      },
    }))
  );
}

export function approveJustification(id: string, notes?: string) {
  return request(`/justifications/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export function rejectJustification(id: string, notes?: string) {
  return request(`/justifications/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export function submitJustificationViaBackend(sessionId: string, reason: string, proof: File) {
  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('reason', reason);
  formData.append('proof', proof);
  return request('/justifications', { method: 'POST', body: formData });
}
