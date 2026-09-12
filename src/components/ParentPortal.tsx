import React, { useState } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import {
  STUDENT_PROFILE,
  IT_DEGREES,
  DEGREE_CURRICULA,
  AI_CURRICULUM,
  ModuleAttendance,
} from '../data/attendanceData';
import { OverallAttendanceDonut, LtwBarChart, WeeklyTrendLineChart } from './attendance/AttendanceCharts';
import { useStudentDashboard } from '../hooks/useStudentDashboard';

interface ParentPortalProps {
  onBack: () => void;
}

/**
 * Parent Portal - a strictly read-only view for a parent/guardian.
 *
 * Deliberately has no admin nav, no course/roster editing, and no absence
 * justification form: parents can only view their student's results and
 * attendance reports (aggregate donut, weekly momentum, L-T-W breakdown)
 * plus a per-module summary table.
 */
export const ParentPortal: React.FC<ParentPortalProps> = ({ onBack }) => {
  const [activeYear, setActiveYear] = useState<'Year 1' | 'Year 2' | 'Year 3'>(
    STUDENT_PROFILE.year
  );

  const activeDegree =
    IT_DEGREES.find((d) => d.id === STUDENT_PROFILE.degreeId) || IT_DEGREES[0];

  const modules: ModuleAttendance[] =
    DEGREE_CURRICULA[STUDENT_PROFILE.degreeId]?.[activeYear] || AI_CURRICULUM['Year 2'];

  const { data: aaaData, weeklyTrend } = useStudentDashboard(null, modules);

  return (
    <div className="h-screen w-full bg-white text-neutral-900 font-sans select-none flex flex-col lg:flex-row antialiased overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-[#0c3830] text-white p-5 flex flex-col justify-between shrink-0 lg:h-screen lg:sticky lg:top-0 overflow-hidden border-r border-[#092923]">
        <div>
          <div className="flex items-center justify-between mb-8 px-1">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <span className="w-2 h-4 bg-[#22c55e] rounded-full" />
                <span className="w-2 h-3 bg-[#eab308] rounded-full" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                ClassPulse
              </span>
            </div>

            <button
              onClick={onBack}
              className="p-1 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white transition-colors cursor-pointer"
              title="Exit"
            >
              <ArrowLeft size={16} />
            </button>
          </div>

          <div className="px-3.5 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200/50">
            Parent Portal
          </div>

          <div
            id="parent-nav-dashboard"
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-bold text-sm bg-white/15 text-white"
          >
            <Eye size={18} className="text-[#22c55e]" />
            <span>Dashboard</span>
          </div>

          <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-white/5 text-[11px] leading-snug text-emerald-100/70">
            Read-only access. Results and reports for your student only - no editing or absence requests.
          </div>
        </div>

        {/* Bottom Area: read-only student info */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={STUDENT_PROFILE.avatar}
              alt="Student"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border-2 border-[#22c55e]"
            />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="font-bold text-sm text-white truncate">{STUDENT_PROFILE.name}</div>
              <div className="text-[11px] text-emerald-200/70 truncate">{activeDegree.award}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-5 sm:p-7 overflow-y-auto bg-white flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Parent Portal
            </h1>
            <p className="text-sm text-neutral-500 font-medium mt-0.5">
              Viewing results for <span className="font-bold text-neutral-800">{STUDENT_PROFILE.name}</span> &middot; {STUDENT_PROFILE.id}
            </p>
          </div>
        </header>

        {/* Year Selector */}
        <div className="inline-flex items-stretch p-1 bg-neutral-100 rounded-xl self-start">
          {(['Year 1', 'Year 2', 'Year 3'] as const).map((yr) => {
            const isYrSelected = yr === activeYear;
            return (
              <button
                key={yr}
                id={`parent-year-${yr.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setActiveYear(yr)}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isYrSelected
                    ? 'bg-[#0c3830] text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                }`}
              >
                {yr}
              </button>
            );
          })}
        </div>

        {/* Attendance Overview: aggregate donut / weekly momentum / L-T-W - read only */}
        {aaaData && (
          <div className="border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Attendance Overview</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="border border-neutral-100 rounded-xl p-3">
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Attendance Aggregate (Year)</div>
                <OverallAttendanceDonut rate={aaaData.overall.attendanceRate} zone={aaaData.overall.scholarshipZone} showZoneLabel={false} />
              </div>
              <div className="border border-neutral-100 rounded-xl p-3">
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Lecture / Tutorial / Workshop</div>
                <LtwBarChart rates={aaaData.overall.ltw} />
              </div>
              <div className="border border-neutral-100 rounded-xl p-3">
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Weekly Momentum</div>
                <WeeklyTrendLineChart points={weeklyTrend} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="text-lg font-bold text-neutral-900">{aaaData.overall.presentCount}</div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Present</div>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="text-lg font-bold text-rose-600">{aaaData.overall.absentCount}</div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Missed</div>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="text-lg font-bold text-sky-600">{aaaData.overall.excusedCount}</div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Excused</div>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="text-lg font-bold text-neutral-500">{aaaData.overall.canceledCount}</div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Canceled</div>
              </div>
            </div>
          </div>
        )}

        {/* Per-module report table - read only */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Module Report</h2>
            <span className="text-xs font-bold text-neutral-400">{modules.length} Total</span>
          </div>

          <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold select-none">
                    <th className="px-4 py-2.5 border-r border-neutral-200">Module</th>
                    <th className="px-4 py-2.5 border-r border-neutral-200 w-24 text-center">Credits</th>
                    <th className="px-4 py-2.5 border-r border-neutral-200 w-28 text-center">Attended</th>
                    <th className="px-4 py-2.5 w-24 text-center">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {modules.map((module) => {
                    const rate = Math.round(
                      (module.lectureRate + module.tutorialRate + module.workshopRate) / 3
                    );
                    return (
                      <tr key={module.id} className="bg-white">
                        <td className="px-4 py-2.5 border-r border-neutral-100 font-semibold text-neutral-900">
                          {module.name}
                        </td>
                        <td className="px-4 py-2.5 border-r border-neutral-100 text-center text-neutral-700">
                          {module.credits}
                        </td>
                        <td className="px-4 py-2.5 border-r border-neutral-100 text-center font-mono text-neutral-500">
                          {module.attendedSessions}/{module.totalSessions}
                        </td>
                        <td className="px-4 py-2.5 text-center font-bold text-[#0c3830]">
                          {rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
