import { useEffect, useState, useCallback } from 'react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { fetchStudentDashboard, fetchWeeklyTrend } from '../lib/apiClient';
import { ModuleAttendance } from '../data/attendanceData';
import { StudentDashboardResponse, WeeklyTrendPoint, zoneFromRate } from '../types/aaa';

/**
 * Builds a StudentDashboardResponse-shaped object straight from the existing
 * client-side mock curriculum (src/data/attendanceData.ts), so the new AAA
 * Scholarship UI renders something meaningful even before a real Supabase
 * project + backend are wired up - consistent with how the rest of this
 * prototype already works without a backend.
 */
function buildDemoDashboard(modules: ModuleAttendance[], studentId: string): StudentDashboardResponse {
  const totalCredits = modules.reduce((acc, m) => acc + m.credits, 0) || 1;
  const weightedRate = modules.reduce((acc, m) => {
    const modRate = (m.lectureRate + m.tutorialRate + m.workshopRate) / 3;
    return acc + modRate * (m.credits / totalCredits);
  }, 0);
  const overallRate = Number(weightedRate.toFixed(1));

  const scheduledTotal = modules.reduce((acc, m) => acc + m.totalSessions, 0);
  const attendedTotal = modules.reduce((acc, m) => acc + m.attendedSessions, 0);
  const absentTotal = modules.reduce((acc, m) => acc + m.missedSessions, 0);

  const avg = (key: 'lectureRate' | 'tutorialRate' | 'workshopRate') =>
    modules.length > 0
      ? Number((modules.reduce((acc, m) => acc + m[key], 0) / modules.length).toFixed(1))
      : 0;

  return {
    student: {
      id: studentId,
      rollNumber: studentId,
      fullName: 'Demo Student',
      degreeId: modules[0]?.degreeId || 'ai',
      year: 2,
      intakeBatch: 'Demo',
    },
    overall: {
      attendanceRate: overallRate,
      scholarshipZone: zoneFromRate(overallRate),
      adjustedTotal: scheduledTotal,
      scheduledTotal,
      attendedTotal,
      presentCount: attendedTotal,
      excusedCount: 0,
      absentCount: absentTotal,
      canceledCount: 0,
      ltw: {
        lectureRate: avg('lectureRate'),
        tutorialRate: avg('tutorialRate'),
        workshopRate: avg('workshopRate'),
      },
    },
    modules: modules.map((m) => ({
      moduleId: m.id,
      code: m.code,
      name: m.name,
      term: m.term === 'Year-Long' ? 'YEAR_LONG' : m.term === 'Semester 1' ? 'SEMESTER_1' : 'SEMESTER_2',
      credits: m.credits,
      lectureRate: m.lectureRate,
      tutorialRate: m.tutorialRate,
      workshopRate: m.workshopRate,
      adjustedTotal: m.totalSessions,
      attendedTotal: m.attendedSessions,
      attendanceRate: Number(((m.lectureRate + m.tutorialRate + m.workshopRate) / 3).toFixed(1)),
    })),
  };
}

/** Deterministic-looking demo trend that converges toward the real overall rate. */
function buildDemoTrend(overallRate: number): WeeklyTrendPoint[] {
  const weeks = 8;
  const points: WeeklyTrendPoint[] = [];
  const today = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 7);
    const wobble = Math.sin(i * 1.3) * 4; // gentle deterministic variation, not random noise
    const rate = Math.max(0, Math.min(100, Math.round(overallRate + wobble)));
    points.push({ weekStart: d.toISOString().slice(0, 10), attendanceRate: rate });
  }
  return points;
}

export function useStudentDashboard(studentId: string | null, fallbackModules: ModuleAttendance[]) {
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isSupabaseConfigured && studentId) {
      try {
        const [dashboard, trend] = await Promise.all([
          fetchStudentDashboard(studentId),
          fetchWeeklyTrend(studentId),
        ]);
        setData(dashboard);
        setWeeklyTrend(trend);
        setIsLive(true);
        setLoading(false);
        return;
      } catch (err) {
        // Fall through to demo data below; surface the error so the UI can
        // optionally mention it, without blocking the dashboard from rendering.
        setError(err instanceof Error ? err.message : 'Failed to load live attendance data');
      }
    }

    const demo = buildDemoDashboard(fallbackModules, studentId || 'demo-student');
    setData(demo);
    setWeeklyTrend(buildDemoTrend(demo.overall.attendanceRate));
    setIsLive(false);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, fallbackModules]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, weeklyTrend, loading, error, isLive, reload: load };
}
