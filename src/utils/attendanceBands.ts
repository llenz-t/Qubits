/**
 * Attendance band classification and early-warning alert content.
 *
 * This app already computes three flags per student in
 * canonicalAttendanceEngine.ts (isDebarredRisk, isCautionaryZone,
 * isAAAScholarshipContender). This module combines them into one ordered
 * "band" and decides when a band CHANGE is worth an alert - the fix for
 * "Low attendance identified too late": today `correctAttendance()` in
 * canonicalStore.ts sends the same generic message on every correction,
 * even when attendance improves. This module is the pure, testable
 * decision logic that replaces that.
 *
 * Bands, worst to best:
 *   DEBARRED      < 80%   (below the regulatory threshold)
 *   CAUTIONARY    80-85%  (above the line, but close)
 *   STANDARD      85-95%  (safe, not scholarship-contending)
 *   AAA_CONTENDER >= 95%  (scholarship eligible)
 */

export type AttendanceBand = 'AAA_CONTENDER' | 'STANDARD' | 'CAUTIONARY' | 'DEBARRED';

export const BAND_SEVERITY: Record<AttendanceBand, number> = {
  AAA_CONTENDER: 0,
  STANDARD: 1,
  CAUTIONARY: 2,
  DEBARRED: 3,
};

export function bandFromMetrics(m: {
  isDebarredRisk: boolean;
  isCautionaryZone: boolean;
  isAAAScholarshipContender: boolean;
}): AttendanceBand {
  if (m.isDebarredRisk) return 'DEBARRED';
  if (m.isCautionaryZone) return 'CAUTIONARY';
  if (m.isAAAScholarshipContender) return 'AAA_CONTENDER';
  return 'STANDARD';
}

export interface AttendanceBandAlert {
  targetRole: 'STUDENT' | 'PARENT' | 'ADMIN';
  title: string;
  body: string;
}

/**
 * Decides which alerts (if any) should fire for a band transition.
 *
 * Fires only when the band gets strictly WORSE - never on improvement,
 * never when the band stays the same. Losing AAA-scholarship eligibility
 * alone (AAA_CONTENDER -> STANDARD) is not treated as a danger zone, since
 * it's a scholarship-opportunity change, not a regulatory risk.
 */
export function buildAttendanceBandAlerts(params: {
  studentName: string;
  rollNumber: string;
  oldBand: AttendanceBand;
  newBand: AttendanceBand;
  newPercentage: number;
}): AttendanceBandAlert[] {
  const { studentName, rollNumber, oldBand, newBand, newPercentage } = params;

  if (BAND_SEVERITY[newBand] <= BAND_SEVERITY[oldBand]) return [];
  if (newBand === 'STANDARD') return [];

  const pct = newPercentage.toFixed(1);

  if (newBand === 'CAUTIONARY') {
    return [
      {
        targetRole: 'STUDENT',
        title: 'Attendance moved to the Cautionary zone',
        body: `Your attendance has moved into the Cautionary zone (${pct}%). Try to attend your upcoming sessions to stay safely above the 80% regulatory line.`,
      },
      {
        targetRole: 'PARENT',
        title: 'Attendance moved to the Cautionary zone',
        body: `${studentName}'s attendance has moved into the Cautionary zone (${pct}%). A few more attended sessions will bring this back to a safe standing.`,
      },
    ];
  }

  // newBand === 'DEBARRED'
  return [
    {
      targetRole: 'STUDENT',
      title: 'Attendance below the 80% regulatory threshold',
      body: `Your attendance has dropped to ${pct}%, below the 80% regulatory threshold. This needs attention soon - Student Services will be in touch to help you get back on track.`,
    },
    {
      targetRole: 'PARENT',
      title: 'Attendance below the 80% regulatory threshold',
      body: `${studentName}'s attendance has dropped to ${pct}%, below the 80% regulatory threshold. Student Services is reviewing this case.`,
    },
    {
      targetRole: 'ADMIN',
      title: `Debarment risk: ${studentName} (${rollNumber})`,
      body: `${studentName} (${rollNumber}) has crossed below the 80% regulatory threshold (${pct}%). Review required.`,
    },
  ];
}
