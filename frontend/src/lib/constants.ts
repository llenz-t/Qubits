/**
 * Shared attendance formulas and thresholds — the single source of truth
 * so the student, parent, and admin views can't drift out of sync.
 */

// Single source of truth for attendance threshold
export const ATTENDANCE_GOOD_THRESHOLD = 85;

export function getAttendanceStatus(percent: number): 'Good' | 'Warning' {
  return percent >= ATTENDANCE_GOOD_THRESHOLD ? 'Good' : 'Warning';
}

// A "late" only counts as 67% attendance credit (3 lates = 1 missed class).
// A "very late" would count as 50% credit (2 very-lates = 1 missed class), but
// today's data only tracks "late" — anything later than that is already
// recorded as an absence upstream, so no separate handling is needed here.
export const LATE_CREDIT = 2 / 3;

export function weightedAttendancePercent(present: number, late: number, totalHeld: number): number {
  if (!totalHeld) return 0;
  return ((present + late * LATE_CREDIT) / totalHeld) * 100;
}