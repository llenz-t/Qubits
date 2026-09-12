/**
 * Canonical Attendance Calculation Engine
 * 
 * Rules:
 * - Versioned policy: 80% regulatory threshold (London Met & Islington College)
 * - 95% AAA Scholarship (Academics, Attitude, Attendance)
 * - Explanatory breakdown with strict separation between historical calculations and projections.
 */

import {
  AttendancePolicy,
  AttendanceRecord,
  AttendanceStatus,
  CanonicalStudent,
  ModuleRecord,
  ScheduledSession,
} from '../types/canonical';

export const DEFAULT_ISLINGTON_POLICY: AttendancePolicy = {
  version: '2026.1-SSD-OFFICIAL',
  institutionalName: 'Islington College / London Metropolitan University',
  regulatoryThreshold: 80.0,
  aaaScholarshipThreshold: 95.0,
  cautionThreshold: 85.0,
  maxAbsenceAllowanceRate: 0.20,
  lateCountsAsAttended: true,
  leftEarlyCountsAsAttended: false,
  authorizedAbsenceExcluded: false, // Counts as approved attended event with verification
  minimumSessionsBeforeWarning: 5,
};

export interface CalculatedAttendanceMetrics {
  eligibleSessions: number;
  attendedSessions: number;
  missedSessions: number;
  lateSessions: number;
  authorizedAbsences: number;
  exemptSessions: number;
  cancelledSessions: number;
  attendancePercentage: number; // 0.0 to 100.0
  thresholdReference: number; // 80.0
  percentagePointDifference: number; // e.g. -3.2 or +6.5
  isEligibleForExams: boolean;
  isAAAScholarshipContender: boolean;
  isCautionaryZone: boolean;
  isDebarredRisk: boolean;
  totalPlannedSessions: number;
  maxAbsenceAllowance: number;
  remainingAbsenceBuffer: number;
  recoverySessionsNeededFor80: number;
  recoverySessionsNeededForAAA: number;
}

/**
 * Checks if a status counts as an attended session under current policy
 */
export function isStatusAttended(status: AttendanceStatus, policy: AttendancePolicy): boolean {
  switch (status) {
    case 'PRESENT':
      return true;
    case 'LATE':
      return policy.lateCountsAsAttended;
    case 'LEFT_EARLY':
      return policy.leftEarlyCountsAsAttended;
    case 'AUTHORISED_ABSENCE':
      return true; // Institutional medical/official waiver
    case 'EXEMPT':
    case 'ABSENT':
    case 'NOTIFIED_ABSENCE':
    case 'PENDING':
    case 'CANCELLED':
    default:
      return false;
  }
}

/**
 * Checks if a session should be included in the denominator (eligible scheduled sessions)
 */
export function isSessionEligible(status: AttendanceStatus, isSessionCancelled: boolean, policy: AttendancePolicy): boolean {
  if (isSessionCancelled || status === 'CANCELLED') {
    return false; // Excluded from denominator
  }
  if (status === 'EXEMPT') {
    return false; // Officially exempt from denominator
  }
  if (status === 'AUTHORISED_ABSENCE' && policy.authorizedAbsenceExcluded) {
    return false;
  }
  return true;
}

/**
 * Computes official attendance metrics for a student across all enrolled modules
 */
export function calculateStudentAttendanceMetrics(
  student: CanonicalStudent,
  policy: AttendancePolicy = DEFAULT_ISLINGTON_POLICY
): CalculatedAttendanceMetrics {
  let eligibleSessions = 0;
  let attendedSessions = 0;
  let missedSessions = 0;
  let lateSessions = 0;
  let authorizedAbsences = 0;
  let exemptSessions = 0;
  let cancelledSessions = 0;

  student.scheduledSessions.forEach((session) => {
    const record = student.attendanceRecords[session.id];
    const status: AttendanceStatus = record ? record.status : 'PENDING';

    if (session.isCancelled || status === 'CANCELLED') {
      cancelledSessions++;
      return;
    }

    if (status === 'EXEMPT') {
      exemptSessions++;
      return;
    }

    if (status === 'LATE') lateSessions++;
    if (status === 'AUTHORISED_ABSENCE') authorizedAbsences++;

    const eligible = isSessionEligible(status, !!session.isCancelled, policy);
    if (!eligible) return;

    eligibleSessions++;

    const attended = isStatusAttended(status, policy);
    if (attended) {
      attendedSessions++;
    } else if (status !== 'PENDING') {
      missedSessions++;
    }
  });

  // Calculate percentage: strictly rounded to 1 decimal place
  const attendancePercentage =
    eligibleSessions > 0
      ? Math.round((attendedSessions / eligibleSessions) * 1000) / 10
      : 100.0;

  const thresholdReference = policy.regulatoryThreshold;
  const percentagePointDifference =
    Math.round((attendancePercentage - thresholdReference) * 10) / 10;

  const isEligibleForExams = attendancePercentage >= policy.regulatoryThreshold;
  const isAAAScholarshipContender = attendancePercentage >= policy.aaaScholarshipThreshold;
  const isCautionaryZone =
    attendancePercentage >= policy.regulatoryThreshold &&
    attendancePercentage < policy.cautionThreshold;
  const isDebarredRisk = attendancePercentage < policy.regulatoryThreshold;

  // 20% absence allowance
  const totalPlannedSessions = student.scheduledSessions.length;
  const maxAbsenceAllowance = Math.floor(totalPlannedSessions * policy.maxAbsenceAllowanceRate);
  const remainingAbsenceBuffer = Math.max(0, maxAbsenceAllowance - missedSessions);

  // Recovery forecasting: how many consecutive future eligible sessions must be attended
  // Formula: (attended + x) / (eligible + x) >= target/100
  const recoverySessionsNeededFor80 = calculateRecoveryNeeded(
    eligibleSessions,
    attendedSessions,
    policy.regulatoryThreshold
  );

  const recoverySessionsNeededForAAA = calculateRecoveryNeeded(
    eligibleSessions,
    attendedSessions,
    policy.aaaScholarshipThreshold
  );

  return {
    eligibleSessions,
    attendedSessions,
    missedSessions,
    lateSessions,
    authorizedAbsences,
    exemptSessions,
    cancelledSessions,
    attendancePercentage,
    thresholdReference,
    percentagePointDifference,
    isEligibleForExams,
    isAAAScholarshipContender,
    isCautionaryZone,
    isDebarredRisk,
    totalPlannedSessions,
    maxAbsenceAllowance,
    remainingAbsenceBuffer,
    recoverySessionsNeededFor80,
    recoverySessionsNeededForAAA,
  };
}

/**
 * Calculates recovery classes needed to reach a target threshold
 */
export function calculateRecoveryNeeded(
  eligibleHeld: number,
  attended: number,
  targetPercentage: number
): number {
  if (eligibleHeld <= 0) return 0;
  const currentPct = (attended / eligibleHeld) * 100;
  if (currentPct >= targetPercentage) return 0;

  const targetDecimal = targetPercentage / 100;
  const numerator = targetDecimal * eligibleHeld - attended;
  const denominator = 1 - targetDecimal;
  if (denominator <= 0) return 0;

  const needed = Math.ceil(numerator / denominator);
  return Math.max(0, needed);
}

/**
 * Calculates module-level attendance breakdown
 */
export function calculateModuleMetrics(
  student: CanonicalStudent,
  module: ModuleRecord,
  policy: AttendancePolicy = DEFAULT_ISLINGTON_POLICY
) {
  const moduleSessions = student.scheduledSessions.filter((s) => s.moduleId === module.id);
  let held = 0;
  let attended = 0;
  let missed = 0;

  moduleSessions.forEach((s) => {
    const rec = student.attendanceRecords[s.id];
    const status: AttendanceStatus = rec ? rec.status : 'PENDING';
    if (!isSessionEligible(status, !!s.isCancelled, policy)) return;

    held++;
    if (isStatusAttended(status, policy)) {
      attended++;
    } else if (status !== 'PENDING') {
      missed++;
    }
  });

  const rate = held > 0 ? Math.round((attended / held) * 1000) / 10 : 100.0;
  const isBelow = rate < policy.regulatoryThreshold;

  return {
    totalSessions: moduleSessions.length,
    held,
    attended,
    missed,
    rate,
    isBelow,
  };
}
