// Types shared by the new AAA Scholarship / daily attendance features.
// These mirror the JSON shape returned by fn_get_student_dashboard() in
// database/02_functions.sql and the backend's GET /api/students/:id/dashboard.

export type ScholarshipZone = 'GREEN' | 'YELLOW' | 'RED';

export interface LtwRates {
  lectureRate: number;
  tutorialRate: number;
  workshopRate: number;
}

export interface StudentDashboardOverall {
  attendanceRate: number;
  scholarshipZone: ScholarshipZone;
  adjustedTotal: number;
  scheduledTotal: number;
  attendedTotal: number;
  presentCount: number;
  excusedCount: number;
  absentCount: number;
  canceledCount: number;
  ltw: LtwRates;
}

export interface StudentDashboardModule {
  moduleId: string;
  code: string;
  name: string;
  term: 'SEMESTER_1' | 'SEMESTER_2' | 'YEAR_LONG';
  credits: number;
  lectureRate: number | null;
  tutorialRate: number | null;
  workshopRate: number | null;
  adjustedTotal: number;
  attendedTotal: number;
  attendanceRate: number;
}

export interface StudentDashboardResponse {
  student: {
    id: string;
    rollNumber: string;
    fullName: string;
    degreeId: string;
    year: number;
    intakeBatch: string;
  };
  overall: StudentDashboardOverall;
  modules: StudentDashboardModule[];
}

export interface WeeklyTrendPoint {
  weekStart: string; // YYYY-MM-DD
  attendanceRate: number;
}

export interface MissedSessionOption {
  sessionId: string;
  label: string; // e.g. "Databases - Workshop - Oct 24, 2026"
}

export interface PendingJustification {
  id: string;
  reason: string;
  proofStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  signedUrl: string | null;
  student: { id: string; rollNumber: string; fullName: string };
  session: {
    id: string;
    scheduledDate: string;
    sessionType: 'LECTURE' | 'TUTORIAL' | 'WORKSHOP';
    moduleCode: string;
    moduleName: string;
  };
}

export interface AttendanceUploadReport {
  totalRows: number;
  inserted: number;
  updated: number;
  errors: string[];
}

/**
 * Zone -> badge label/colour, kept in one place so every component agrees on
 * wording. Matches Section 1.2 of the master directive exactly.
 */
export const SCHOLARSHIP_ZONE_META: Record<
  ScholarshipZone,
  { label: string; color: string; bg: string; ring: string }
> = {
  GREEN: { label: 'Eligible', color: '#166534', bg: '#dcfce7', ring: '#22c55e' },
  YELLOW: { label: 'At-Risk', color: '#854d0e', bg: '#fef9c3', ring: '#eab308' },
  RED: { label: 'Disqualified', color: '#991b1b', bg: '#fee2e2', ring: '#ef4444' },
};

export function zoneFromRate(rate: number): ScholarshipZone {
  if (rate >= 80) return 'GREEN';
  if (rate >= 70) return 'YELLOW';
  return 'RED';
}
