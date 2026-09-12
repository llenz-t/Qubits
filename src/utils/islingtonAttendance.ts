/**
 * Canonical Islington College & London Metropolitan University Attendance Calculation Engine
 * 
 * Rules:
 * - Minimum Attendance Threshold: 80.0% (Mandatory for Exam Clearance / Assessment Submission)
 * - AAA Scholarship (Academics, Attitude, Attendance): >= 95.0%
 * - Warning Zone: 80.0% - 84.9% (Automated SSD Notification Triggered)
 * - Critical / Debarment Zone: < 80.0% (Debarred from first-sit assessments; requires SSD appeal)
 * - Absence Allowance: Maximum 20% absence across scheduled module sessions
 */

export interface IslingtonModule {
  id: string;
  code: string;
  name: string;
  term: string;
  credits: number;
  totalSessions: number;
  attendedSessions: number;
  missedSessions: number;
  lectureRate: number;
  tutorialRate: number;
  workshopRate: number;
}

export type AttendanceTier = 'AAA_CANDIDATE' | 'GOOD_STANDING' | 'SSD_WARNING' | 'CRITICAL_DEBARRED';

export interface AttendanceTierInfo {
  tier: AttendanceTier;
  label: string;
  shortLabel: string;
  description: string;
  colorHex: string;
  bgHex: string;
  borderHex: string;
  badgeClass: string;
  examEligible: boolean;
}

export interface StudentProfile {
  id: string;
  rollNumber: string;
  fullName: string;
  email: string;
  phone: string;
  degreeName: string;
  award: string;
  year: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
}

/**
 * Calculates single module attendance percentage based on component breakdown
 */
export function calculateModuleRate(module: IslingtonModule): number {
  if (module.lectureRate !== undefined && module.tutorialRate !== undefined && module.workshopRate !== undefined) {
    return Math.round((module.lectureRate + module.tutorialRate + module.workshopRate) / 3);
  }
  const held = module.attendedSessions + module.missedSessions;
  if (held <= 0) return 100;
  return Math.round((module.attendedSessions / held) * 100);
}

/**
 * Calculates Islington Credit-Weighted Overall Attendance Percentage
 * Formula: Σ (Module Rate * Module Credits) / Σ (Module Credits)
 */
export function calculateWeightedAttendance(modules: IslingtonModule[]): number {
  if (!modules || modules.length === 0) return 0;
  let totalCredits = 0;
  let weightedSum = 0;

  for (const m of modules) {
    const credits = m.credits || 15;
    const rate = calculateModuleRate(m);
    weightedSum += rate * credits;
    totalCredits += credits;
  }

  if (totalCredits === 0) return 0;
  return Math.round((weightedSum / totalCredits) * 10) / 10;
}

/**
 * Calculates Islington 20% absence allowance and buffer
 */
export function calculateAbsenceAllowance(totalRequired: number, totalMissed: number) {
  const maxAllowance = Math.floor(totalRequired * 0.20);
  const remainingCanMiss = Math.max(0, maxAllowance - totalMissed);
  const isOverLimit = totalMissed > maxAllowance;
  const excessAbsences = isOverLimit ? totalMissed - maxAllowance : 0;
  const allowanceUsedPercent = maxAllowance > 0 ? Math.min(100, Math.round((totalMissed / maxAllowance) * 100)) : 0;

  return {
    maxAllowance,
    remainingCanMiss,
    isOverLimit,
    excessAbsences,
    allowanceUsedPercent,
  };
}

/**
 * Calculates consecutive classes needed to recover to 80.0% threshold
 * Formula: (Attended + X) / (Held + X) >= 0.80
 * => X >= 4 * Held - 5 * Attended
 */
export function calculateRecoveryClassesNeeded(held: number, attended: number, targetPercentage = 80): number {
  if (held <= 0) return 0;
  const currentPct = (attended / held) * 100;
  if (currentPct >= targetPercentage) return 0;

  const targetDecimal = targetPercentage / 100;
  // (attended + x) / (held + x) = targetDecimal
  // attended + x = targetDecimal * held + targetDecimal * x
  // x * (1 - targetDecimal) = targetDecimal * held - attended
  // x = (targetDecimal * held - attended) / (1 - targetDecimal)
  const numerator = targetDecimal * held - attended;
  const denominator = 1 - targetDecimal;
  const needed = Math.ceil(numerator / denominator);

  return Math.max(0, needed);
}

/**
 * Returns Islington institutional tier and styling info
 */
export function getAttendanceTier(rate: number): AttendanceTierInfo {
  if (rate >= 95.0) {
    return {
      tier: 'AAA_CANDIDATE',
      label: 'AAA Scholarship Candidate',
      shortLabel: 'AAA Track',
      description: 'Exemplary attendance. Fully eligible for AAA Scholarship and exams.',
      colorHex: '#15803d', // green-700
      bgHex: '#f0fdf4', // green-50
      borderHex: '#86efac', // green-300
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      examEligible: true,
    };
  }
  if (rate >= 85.0) {
    return {
      tier: 'GOOD_STANDING',
      label: 'Good Academic Standing',
      shortLabel: 'Good Standing',
      description: 'Satisfies Islington College & London Met requirements. Clear for exams.',
      colorHex: '#0c3830', // Islington Forest
      bgHex: '#f2f7f5',
      borderHex: '#6ee7b7',
      badgeClass: 'bg-[#0c3830]/10 text-[#0c3830] border-[#0c3830]/20',
      examEligible: true,
    };
  }
  if (rate >= 80.0) {
    return {
      tier: 'SSD_WARNING',
      label: 'SSD Cautionary Warning',
      shortLabel: 'Caution (80-84%)',
      description: 'Borderline attendance. Approaching the 80% minimum threshold. SSD warning active.',
      colorHex: '#b45309', // amber-700
      bgHex: '#fffbeb', // amber-50
      borderHex: '#fcd34d', // amber-300
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-300',
      examEligible: true,
    };
  }
  return {
    tier: 'CRITICAL_DEBARRED',
    label: 'Critical - Debarment Risk',
    shortLabel: 'Debarred (<80%)',
    description: 'Attendance has dropped below the 80% mandatory threshold. Debarred from exams unless medical appeal is approved by SSD.',
    colorHex: '#be123c', // rose-700
    bgHex: '#fff1f2', // rose-50
    borderHex: '#fda4af', // rose-300
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-300',
    examEligible: false,
  };
}
