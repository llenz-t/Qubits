/**
 * Canonical Domain Model for Islington College Student Services Platform
 * 
 * One shared data model, one business-logic layer, one source of truth.
 * Consumed by: Admin, Student, Parent perspectives.
 */

export type Role = 'ADMIN' | 'STUDENT' | 'PARENT';

// Supported Attendance Event States (Extensible State Machine)
export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'LEFT_EARLY'
  | 'AUTHORISED_ABSENCE'
  | 'NOTIFIED_ABSENCE'
  | 'EXEMPT'
  | 'PENDING'
  | 'CANCELLED';

export type SessionType = 'Lecture' | 'Tutorial' | 'Workshop' | 'Lab';

export type AcademicStanding =
  | 'GOOD_STANDING'
  | 'ACADEMIC_WARNING'
  | 'REFERRAL'
  | 'DEBARRED';

export type CaseStatus =
  | 'NEW'
  | 'IN_REVIEW'
  | 'AWAITING_STUDENT'
  | 'AWAITING_STAFF'
  | 'RESOLVED'
  | 'CLOSED';

export type CasePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type CaseCategory =
  | 'Attendance Appeal & Medical Waiver'
  | 'Academic Advisory & Extenuating Circumstances'
  | 'Fee Clearance & Exam Slip'
  | 'Mental Wellbeing & Student Counseling'
  | 'General Student Services Inquiry';

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED';

export type NoticeAudience =
  | 'ALL'
  | 'STUDENTS'
  | 'PARENTS'
  | 'SPECIFIC_PROGRAMME';

export interface AttendancePolicy {
  version: string;
  institutionalName: string;
  regulatoryThreshold: number; // 80.0%
  aaaScholarshipThreshold: number; // 95.0%
  cautionThreshold: number; // 85.0%
  maxAbsenceAllowanceRate: number; // 0.20 (20%)
  lateCountsAsAttended: boolean;
  leftEarlyCountsAsAttended: boolean;
  authorizedAbsenceExcluded: boolean; // if true, removed from denominator; if false, treated as attended
  minimumSessionsBeforeWarning: number;
}

export interface ScheduledSession {
  id: string;
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  sessionType: SessionType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  lecturer: string;
  isCancelled?: boolean;
  cancellationReason?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  status: AttendanceStatus;
  markedAt: string;
  markedBy: string;
  source: 'BIOMETRIC_SCANNER' | 'LECTURER_PORTAL' | 'SSD_ADMIN_OVERRIDE' | 'JUSTIFICATION_APPROVED';
  reason?: string;
  isCorrected?: boolean;
  auditTrail?: AttendanceAuditEntry[];
}

export interface AttendanceAuditEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  justificationReason: string;
}

export interface PlagiarismSourceMatch {
  id: string;
  sourceTitle: string;
  sourceType: 'Internet' | 'Student Paper' | 'Journal' | 'AI / LLM Model' | 'GitHub Repository';
  similarityPercentage: number;
  urlOrCitation?: string;
  matchedExcerptSnippet?: string;
  studentOriginalSnippet?: string;
}

export interface GuardianNotificationLog {
  id: string;
  channel: 'SMS' | 'EMAIL' | 'PORTAL_ALERT' | 'POSTAL_NOTICE';
  recipient: string; // e.g. "+977-9801239876" or "ramesh.sharma@gmail.com"
  dispatchedAt: string;
  deliveredAt?: string;
  status: 'DELIVERED' | 'SENT' | 'PENDING' | 'READ';
  subject: string;
  messagePreview: string;
  carrierMessageId: string;
}

export interface PlagiarismReport {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  moduleCode: string;
  moduleName: string;
  submittedAt: string;
  turnitinSimilarityScore: number; // e.g. 48
  aiGeneratedScore?: number; // e.g. 35
  allowedThreshold: number; // e.g. 15
  status: 'CLEARED' | 'SUSPECTED' | 'INVESTIGATION_OPENED' | 'FAILED_PLAGIARISM' | 'UNDER_APPEAL';
  penaltyVerdict?: string; // e.g. 'Awarded 0% (Fail) under London Met Academic Reg 16'
  investigationDate?: string;
  panelChair?: string; // e.g. 'Academic Misconduct Panel - London Met Board'
  matchedSources: PlagiarismSourceMatch[];
  guardianNotifications: GuardianNotificationLog[];
  appealDeadline?: string;
  digitalReceiptId: string;
  canAppeal: boolean;
}

export interface AssessmentComponent {
  id: string;
  moduleId: string;
  title: string;
  type: 'Coursework' | 'Examination' | 'Project' | 'In-Class Test';
  weightPercentage: number;
  dueDate: string;
  status: 'UPCOMING' | 'SUBMITTED' | 'MARKED';
  score?: number; // 0-100
  maxScore: number;
  grade?: string; // 'First Class', 'Upper Second', etc.
  feedback?: string;
  submittedAt?: string;
  turnitinReport?: PlagiarismReport;
}

export interface ModuleRecord {
  id: string;
  code: string;
  name: string;
  credits: number;
  term: 'Semester 1' | 'Semester 2' | 'Year-Long';
  moduleLeader: string;
  totalConducted: number;
  attendedSessions: number;
  missedSessions: number;
  lectureRate: number;
  tutorialRate: number;
  workshopRate: number;
  assessments: AssessmentComponent[];
  currentMark?: number;
  currentGrade?: string;
}

export interface SupportCaseMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  message: string;
  timestamp: string;
  isInternalStaffOnly?: boolean; // Strictly hidden from Student and Parent!
  attachmentName?: string;
}

export interface SupportCase {
  id: string;
  ticketNumber: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  category: CaseCategory;
  subject: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedStaff: string;
  createdAt: string;
  updatedAt: string;
  internalStaffNotes: string; // Strictly role-isolated: Visible ONLY to ADMIN!
  messages: SupportCaseMessage[];
  relatedSessionId?: string;
}

export interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  appointmentType: 'Academic Advisory' | 'Attendance Hearing' | 'Counseling' | 'Disciplinary Review';
  date: string;
  timeSlot: string;
  staffMember: string;
  location: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface CollegeNotice {
  id: string;
  title: string;
  category: 'SSD Urgent Notice' | 'Academic Milestone' | 'Exam Board' | 'Campus Life';
  summary: string;
  content: string;
  targetAudience: NoticeAudience;
  programmeTarget?: string;
  publishedAt: string;
  author: string;
  isPinned?: boolean;
  priority: 'NORMAL' | 'URGENT' | 'CRITICAL';
}

export interface PlatformNotification {
  id: string;
  targetRole: Role;
  studentId?: string;
  type: 'ATTENDANCE_WARNING' | 'ASSESSMENT_DUE' | 'CASE_UPDATE' | 'COLLEGE_ANNOUNCEMENT';
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  linkAction?: string;
}

export interface CanonicalStudent {
  id: string;
  rollNumber: string;
  fullName: string;
  email: string;
  phone: string;
  degreeName: string;
  award: string;
  year: 'Year 1' | 'Year 2' | 'Year 3';
  academicPeriod: string; // e.g. 'Autumn 2026'
  academicStanding: AcademicStanding;
  gpa: number; // e.g. 3.65
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  modules: ModuleRecord[];
  scheduledSessions: ScheduledSession[];
  attendanceRecords: Record<string, AttendanceRecord>; // sessionId -> AttendanceRecord
  supportCases: SupportCase[];
  appointments: Appointment[];
  plagiarismReports?: PlagiarismReport[];
}
