/**
 * Shared TypeScript types mirroring the JSON shapes the Express backend
 * returns. Field names are lowercase (studentid, moduleid, ...) because
 * they pass straight through from Postgres/Supabase column names.
 */

export interface Student {
  studentid: string;
  studentname: string;
  sectioncode?: string;
  programmename?: string;
  year?: number;
  email?: string;
}

export interface OverallAttendance {
  totalHeld: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  attendancePercent: number;
}

export interface Course {
  moduleid: string;
  modulename?: string;
  credits?: number;
  semester?: string;
  totalclassespersemester?: number;
  totalsessions: number;
  present: number;
  late: number;
  absentraw: number;
  totaleffectiveabsent: number;
  attendancepercent: string;
}

export interface StudentDashboard {
  student: Student;
  overall: OverallAttendance;
  courses: Course[];
}

export interface ParentInfo {
  parentname: string;
  relationtostudent: string;
}

export interface ParentDashboard extends StudentDashboard {
  parent: ParentInfo;
}

export interface Justification {
  justificationid: number;
  studentid: string;
  studentname?: string;
  occurrenceid?: number;
  reason: string;
  fileurl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedat: string;
  reviewedby?: string;
  reviewedat?: string;
  admincomment?: string;
}