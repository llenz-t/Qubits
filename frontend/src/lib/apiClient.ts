/**
 * Thin fetch wrapper around the Express backend. One function per REST
 * endpoint, grouped by portal (student / parent / admin). Nothing here
 * holds state — callers (components) own loading/error state themselves.
 */
import type { Student, StudentDashboard, ParentDashboard, Justification } from '../types/canonical';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Normalizes every endpoint's error shape: a non-2xx response throws with
// the backend's `error` message (or the raw status text) instead of the
// caller having to check `response.ok` everywhere.
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// Student endpoints
export async function searchStudents(name: string): Promise<Student[]> {
  if (name.length < 2) return [];
  const response = await fetch(`${API_BASE}/api/students/search?name=${encodeURIComponent(name)}`);
  return handleResponse<Student[]>(response);
}

export async function getStudentDashboard(studentId: string): Promise<StudentDashboard> {
  const response = await fetch(`${API_BASE}/api/students/${studentId}/dashboard`);
  return handleResponse<StudentDashboard>(response);
}

export async function submitJustification(studentId: string, reason: string, file: File, occurrenceId?: string): Promise<Justification> {
  const formData = new FormData();
  formData.append('reason', reason);
  formData.append('file', file);
  if (occurrenceId) formData.append('occurrenceId', occurrenceId);

  const response = await fetch(`${API_BASE}/api/students/${studentId}/justifications`, {
    method: 'POST',
    body: formData
  });
  return handleResponse<Justification>(response);
}

export async function getStudentJustifications(studentId: string): Promise<Justification[]> {
  const response = await fetch(`${API_BASE}/api/students/${studentId}/justifications`);
  return handleResponse<Justification[]>(response);
}

// Parent endpoints
export async function parentLookup(phone: string): Promise<ParentDashboard> {
  const response = await fetch(`${API_BASE}/api/parents/lookup?phone=${encodeURIComponent(phone)}`);
  return handleResponse<ParentDashboard>(response);
}

// Admin endpoints
export async function getAdminStudents(filters?: { programmename?: string; year?: string; section?: string; search?: string }): Promise<any[]> {
  const params = new URLSearchParams(filters as Record<string, string>);
  const response = await fetch(`${API_BASE}/api/admin/students?${params}`);
  return handleResponse<any[]>(response);
}

export async function getAdminCourses(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/admin/courses`);
  return handleResponse<any[]>(response);
}

export async function updateCourse(offeringId: string, updates: { credits?: number; semester?: string; totalclassespersemester?: number }): Promise<any> {
  const response = await fetch(`${API_BASE}/api/admin/courses/${offeringId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return handleResponse<any>(response);
}

export async function getAdminJustifications(status?: string): Promise<any[]> {
  const url = status ? `${API_BASE}/api/admin/justifications?status=${status}` : `${API_BASE}/api/admin/justifications`;
  const response = await fetch(url);
  return handleResponse<any[]>(response);
}

export async function reviewJustification(justificationId: string, review: { status: string; reviewedBy: string; adminComment: string }): Promise<any> {
  const response = await fetch(`${API_BASE}/api/admin/justifications/${justificationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review)
  });
  return handleResponse<any>(response);
}

export async function bulkDeductClasses(filters: { deductAmount: number; programmename?: string; year?: string }): Promise<{ updated: number }> {
  const response = await fetch(`${API_BASE}/api/admin/courses/bulk-deduct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters)
  });
  return handleResponse<{ updated: number }>(response);
}