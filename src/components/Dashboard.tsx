import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  ShieldCheck,
  ArrowLeft,
  ChevronDown,
  Check,
  Search,
  Bell,
  Mail,
} from 'lucide-react';
import {
  STUDENT_PROFILE,
  MISSED_CLASSES,
  ModuleAttendance,
  IT_DEGREES,
  DEGREE_CURRICULA,
  AI_CURRICULUM,
} from '../data/attendanceData';
import { Admin } from './Admin';
import { StudentsManager } from './StudentsManager';
import { ExcelManager } from './ExcelManager';
import { DailyAttendanceUpload } from './attendance/DailyAttendanceUpload';
import { AdminVerificationWorkbench } from './attendance/AdminVerificationWorkbench';
import { OverallAttendanceDonut, LtwBarChart, WeeklyTrendLineChart } from './attendance/AttendanceCharts';
import { AbsenceJustificationForm } from './attendance/AbsenceJustificationForm';
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import { MissedSessionOption } from '../types/aaa';

type AdminSubView = 'courses' | 'students' | 'excel' | 'attendance' | 'verify';

interface DashboardProps {
  onBack: () => void;
  role?: 'student' | 'admin';
}

export const Dashboard: React.FC<DashboardProps> = ({ onBack, role = 'student' }) => {
  const isAdmin = role === 'admin';
  const [activeNav, setActiveNav] = useState<'dashboard' | 'admin'>('dashboard');
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('courses');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [isJustificationOpen, setIsJustificationOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [curricula, setCurricula] = useState<
    Record<string, Record<'Year 1' | 'Year 2' | 'Year 3', ModuleAttendance[]>>
  >(() => {
    const saved = localStorage.getItem('attendease_curricula_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEGREE_CURRICULA;
      }
    }
    return DEGREE_CURRICULA;
  });

  const [activeDegreeId, setActiveDegreeId] = useState<string>(() => {
    return localStorage.getItem('attendease_degree_id_v5') || 'multimedia';
  });

  const [activeYear, setActiveYear] = useState<'Year 1' | 'Year 2' | 'Year 3'>(() => {
    return (
      (localStorage.getItem('attendease_year_v5') as
        | 'Year 1'
        | 'Year 2'
        | 'Year 3') || 'Year 1'
    );
  });

  const activeDegree =
    IT_DEGREES.find((d) => d.id === activeDegreeId) || IT_DEGREES[0];

  const modules: ModuleAttendance[] =
    curricula[activeDegreeId]?.[activeYear] ||
    curricula['multimedia']?.[activeYear] ||
    AI_CURRICULUM['Year 2'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectActiveDegreeYear = (
    degId: string,
    yr: 'Year 1' | 'Year 2' | 'Year 3'
  ) => {
    setActiveDegreeId(degId);
    setActiveYear(yr);
    localStorage.setItem('attendease_degree_id_v5', degId);
    localStorage.setItem('attendease_year_v5', yr);
    setSelectedModuleId('all');
  };

  const handleUpdateCourse = (
    degreeId: string,
    year: 'Year 1' | 'Year 2' | 'Year 3',
    updated: ModuleAttendance
  ) => {
    setCurricula((prev) => {
      const list = prev[degreeId]?.[year] || [];
      const nextList = list.map((m) => (m.id === updated.id ? updated : m));
      const next = {
        ...prev,
        [degreeId]: {
          ...prev[degreeId],
          [year]: nextList,
        },
      };
      localStorage.setItem('attendease_curricula_v5', JSON.stringify(next));
      return next;
    });
  };

  const handleAddCourse = (
    degreeId: string,
    year: 'Year 1' | 'Year 2' | 'Year 3',
    newMod: ModuleAttendance
  ) => {
    setCurricula((prev) => {
      const list = prev[degreeId]?.[year] || [];
      const next = {
        ...prev,
        [degreeId]: {
          ...prev[degreeId],
          [year]: [...list, newMod],
        },
      };
      localStorage.setItem('attendease_curricula_v5', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteCourse = (
    degreeId: string,
    year: 'Year 1' | 'Year 2' | 'Year 3',
    id: string
  ) => {
    setCurricula((prev) => {
      const list = prev[degreeId]?.[year] || [];
      const next = {
        ...prev,
        [degreeId]: {
          ...prev[degreeId],
          [year]: list.filter((m) => m.id !== id),
        },
      };
      localStorage.setItem('attendease_curricula_v5', JSON.stringify(next));
      return next;
    });
    if (selectedModuleId === id) {
      setSelectedModuleId('all');
    }
  };

  const handleResetCurricula = () => {
    setCurricula(DEGREE_CURRICULA);
    setActiveDegreeId('multimedia');
    setActiveYear('Year 1');
    localStorage.removeItem('attendease_curricula_v5');
    localStorage.setItem('attendease_degree_id_v5', 'multimedia');
    localStorage.setItem('attendease_year_v5', 'Year 1');
    setSelectedModuleId('all');
  };

  const handleSaveCurriculum = (
    degreeId: string,
    newCurriculum: Record<'Year 1' | 'Year 2' | 'Year 3', ModuleAttendance[]>
  ) => {
    setCurricula((prev) => {
      const next = {
        ...prev,
        [degreeId]: newCurriculum,
      };
      localStorage.setItem('attendease_curricula_v5', JSON.stringify(next));
      return next;
    });
  };

  const handleSaveMultipleCurricula = (
    newCurricula: Record<string, Record<'Year 1' | 'Year 2' | 'Year 3', ModuleAttendance[]>>
  ) => {
    setCurricula((prev) => {
      const next = {
        ...prev,
        ...newCurricula,
      };
      localStorage.setItem('attendease_curricula_v5', JSON.stringify(next));
      return next;
    });
  };

  const totalCredits = modules.reduce(
    (acc, mod) => acc + (Number(mod.credits) || 0),
    0
  );

  const selectedModule = modules.find((m) => m.id === selectedModuleId);

  const currentCredits = selectedModule ? selectedModule.credits : totalCredits;

  const totalRequired = selectedModule
    ? selectedModule.totalSessions
    : modules.reduce((acc, m) => acc + (Number(m.totalSessions) || 0), 0);

  const totalAttended = selectedModule
    ? selectedModule.attendedSessions
    : modules.reduce((acc, m) => acc + (Number(m.attendedSessions) || 0), 0);

  const totalMissed = selectedModule
    ? selectedModule.missedSessions
    : modules.reduce((acc, m) => acc + (Number(m.missedSessions) || 0), 0);

  const maxAllowance = Math.floor(totalRequired * 0.2); // 20% limit
  const canMissRemaining = Math.max(0, maxAllowance - totalMissed);

  const allowanceUsedPercent =
    maxAllowance > 0 ? Math.min(100, (totalMissed / maxAllowance) * 100) : 0;

  // Lecture, tutorial, and workshop have same weightage (1/3 each)
  const weightedAttendanceRate = selectedModule
    ? (
        (selectedModule.lectureRate +
          selectedModule.tutorialRate +
          selectedModule.workshopRate) /
        3
      ).toFixed(1)
    : totalCredits > 0
    ? (
        modules.reduce((acc, mod) => {
          const modEqualRate =
            (mod.lectureRate + mod.tutorialRate + mod.workshopRate) / 3;
          return acc + modEqualRate * (mod.credits / totalCredits);
        }, 0)
      ).toFixed(1)
    : '0.0';

  const attendedPercent = Number(weightedAttendanceRate);

  const filteredMissedClasses = MISSED_CLASSES.map((item) => {
    const matchingMod = modules.find(
      (m) => m.code === item.moduleCode || m.id === item.moduleCode
    );
    return {
      ...item,
      moduleName: matchingMod ? matchingMod.name : item.moduleName,
    };
  }).filter((item) => {
    if (selectedModuleId === 'all') return true;
    return (
      item.moduleCode === selectedModuleId ||
      (selectedModule && item.moduleCode === selectedModule.code)
    );
  });

  const selectedLabel = selectedModule ? selectedModule.name : 'All';

  // AAA Scholarship: live data when a real Supabase project/backend is
  // configured (see .env.example), otherwise derived from the same mock
  // curriculum the rest of this dashboard already uses.
  const { data: aaaData, weeklyTrend } = useStudentDashboard(null, modules);

  const missedSessionOptions: MissedSessionOption[] = filteredMissedClasses.map((item) => ({
    sessionId: item.id,
    label: `${item.moduleName} · ${item.type} · ${item.date}`,
  }));

  return (
    <div className="h-screen w-full bg-white text-neutral-900 font-sans select-none flex flex-col lg:flex-row antialiased overflow-hidden">
      
      {/* Deep Forest Pine Green Sidebar */}
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

            <nav className="space-y-1.5">
              <div className="px-3.5 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200/50">
                Student Panel
              </div>

              <button
                id="sidebar-nav-dashboard"
                onClick={() => {
                  setActiveNav('dashboard');
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                  activeNav === 'dashboard'
                    ? 'bg-white/15 text-white'
                    : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutDashboard
                  size={18}
                  className={activeNav === 'dashboard' ? 'text-[#22c55e]' : ''}
                />
                <span>Dashboard</span>
              </button>

              <button
                id="sidebar-nav-missed"
                onClick={() => {
                  setActiveNav('dashboard');
                  const el = document.getElementById('missed-classes-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-emerald-100/70 hover:bg-white/5 hover:text-white font-medium text-sm transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <CheckSquare size={18} />
                  <span>Missed</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                  {totalMissed}
                </span>
              </button>

              {isAdmin && (
                <>
                  <div className="px-3.5 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-200/50">
                    Admin
                  </div>

                  <button
                    id="sidebar-nav-admin"
                    onClick={() => setActiveNav('admin')}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                      activeNav === 'admin'
                        ? 'bg-white/15 text-white'
                        : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <ShieldCheck
                      size={18}
                      className={activeNav === 'admin' ? 'text-[#22c55e]' : ''}
                    />
                    <span>Admin</span>
                  </button>
                </>
              )}

              {isAdmin && activeNav === 'admin' && (
                <div className="pl-6 space-y-1 pt-1">
                  <button
                    id="sidebar-subnav-courses"
                    onClick={() => setAdminSubView('courses')}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      adminSubView === 'courses'
                        ? 'bg-[#22c55e] text-neutral-900 shadow-xs'
                        : 'text-emerald-200/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>Courses</span>
                  </button>

                  <button
                    id="sidebar-subnav-students"
                    onClick={() => setAdminSubView('students')}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      adminSubView === 'students'
                        ? 'bg-[#22c55e] text-neutral-900 shadow-xs'
                        : 'text-emerald-200/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>Students</span>
                  </button>

                  <button
                    id="sidebar-subnav-excel"
                    onClick={() => setAdminSubView('excel')}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      adminSubView === 'excel'
                        ? 'bg-[#22c55e] text-neutral-900 shadow-xs'
                        : 'text-emerald-200/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>Excel</span>
                  </button>

                  <button
                    id="sidebar-subnav-attendance"
                    onClick={() => setAdminSubView('attendance')}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      adminSubView === 'attendance'
                        ? 'bg-[#22c55e] text-neutral-900 shadow-xs'
                        : 'text-emerald-200/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>Attendance</span>
                  </button>

                  <button
                    id="sidebar-subnav-verify"
                    onClick={() => setAdminSubView('verify')}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      adminSubView === 'verify'
                        ? 'bg-[#22c55e] text-neutral-900 shadow-xs'
                        : 'text-emerald-200/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>Verify Absences</span>
                  </button>
                </div>
              )}
            </nav>
          </div>

          {/* Bottom Area with Profile */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <img
                src={STUDENT_PROFILE.avatar}
                alt="Profile"
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

        {isAdmin && activeNav === 'admin' ? (
          adminSubView === 'courses' ? (
            <Admin
              activeDegreeId={activeDegreeId}
              activeYear={activeYear}
              onSelectActiveDegreeYear={handleSelectActiveDegreeYear}
              curricula={curricula}
              onUpdateCourse={handleUpdateCourse}
              onAddCourse={handleAddCourse}
              onDeleteCourse={handleDeleteCourse}
              onResetCurricula={handleResetCurricula}
              onSwitchSubView={setAdminSubView}
            />
          ) : adminSubView === 'students' ? (
            <StudentsManager
              activeDegreeId={activeDegreeId}
              activeYear={activeYear}
              onSelectActiveDegreeYear={handleSelectActiveDegreeYear}
              onSwitchSubView={setAdminSubView}
            />
          ) : adminSubView === 'excel' ? (
            <ExcelManager
              activeDegreeId={activeDegreeId}
              curricula={curricula}
              onSaveCurriculum={handleSaveCurriculum}
              onSaveMultipleCurricula={handleSaveMultipleCurricula}
              onSwitchSubView={setAdminSubView}
            />
          ) : adminSubView === 'attendance' ? (
            <div className="flex-1 p-5 sm:p-7 overflow-y-auto bg-white">
              <DailyAttendanceUpload />
            </div>
          ) : (
            <div className="flex-1 p-5 sm:p-7 overflow-y-auto bg-white">
              <AdminVerificationWorkbench />
            </div>
          )
        ) : (
        /* Main Clean Content Canvas */
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto bg-white flex flex-col gap-6">
          
          {/* Top Bar with Dropdown & Actions */}
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-1">
            <div className="relative inline-flex items-center gap-3" ref={dropdownRef}>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                Attendance
              </h1>

              <button
                id="module-dropdown-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-sm font-bold text-neutral-800 transition-colors cursor-pointer"
              >
                <span className="max-w-[180px] sm:max-w-xs truncate">{selectedLabel}</span>
                <ChevronDown
                  size={16}
                  className={`text-neutral-500 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div
                  id="module-dropdown-menu"
                  className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl border border-neutral-200 p-0 overflow-hidden divide-y divide-neutral-100 z-50 shadow-xl"
                >
                  <button
                    onClick={() => {
                      setSelectedModuleId('all');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors cursor-pointer text-left ${
                      selectedModuleId === 'all'
                        ? 'bg-[#0c3830] text-white'
                        : 'text-neutral-800 hover:bg-neutral-50'
                    }`}
                  >
                    <span>All ({totalCredits} Credits)</span>
                    {selectedModuleId === 'all' && <Check size={16} />}
                  </button>

                  {modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => {
                        setSelectedModuleId(module.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors cursor-pointer text-left ${
                        selectedModuleId === module.id
                          ? 'bg-[#0c3830] text-white'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex flex-col items-start min-w-0 pr-2">
                        <span className="truncate text-sm font-bold">{module.name}</span>
                        <span className={`text-xs font-medium ${selectedModuleId === module.id ? 'text-emerald-200' : 'text-neutral-400'}`}>
                          {module.credits} Credits
                        </span>
                      </div>
                      {selectedModuleId === module.id && <Check size={16} className="shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-56">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                <input
                  type="text"
                  className="w-full pl-4 pr-9 py-1.5 bg-neutral-100 rounded-full text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-300 font-medium"
                />
              </div>

              <button className="p-2 rounded-full bg-neutral-100 text-neutral-600 hover:text-black transition-colors">
                <Bell size={16} />
              </button>

              <button className="p-2 rounded-full bg-neutral-100 text-neutral-600 hover:text-black transition-colors">
                <Mail size={16} />
              </button>
            </div>
          </header>

          {/* Year Selector */}
          <div className="inline-flex items-stretch p-1 bg-neutral-100 rounded-xl self-start">
            {(['Year 1', 'Year 2', 'Year 3'] as const).map((yr) => {
              const isYrSelected = yr === activeYear;
              return (
                <button
                  key={yr}
                  id={`dashboard-year-${yr.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => handleSelectActiveDegreeYear(activeDegreeId, yr)}
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

          {/* Top Row: Forest Green Metric Card + Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Forest Green Main Card with Credit-Weighted Attendance */}
            <div className="md:col-span-6 bg-[#0c3830] text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
              <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute -right-16 -bottom-16 w-60 h-60 rounded-full border border-white/5 pointer-events-none" />

              <div className="flex justify-between items-start relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Attendance
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/15 text-emerald-200">
                  {weightedAttendanceRate}%
                </span>
              </div>

              <div className="my-2 relative z-10">
                <div className="text-4xl sm:text-5xl font-bold tracking-tight">
                  {totalAttended} <span className="text-2xl text-emerald-300/80 font-semibold">/ {totalRequired}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-emerald-200/80 relative z-10">
                <span>{currentCredits} Credits</span>
                <span>{totalRequired - totalAttended - totalMissed} Upcoming</span>
              </div>
            </div>

            {/* Quick Stat Counters */}
            <div className="md:col-span-6 grid grid-cols-3 gap-3">
              <div className="bg-neutral-50/70 rounded-2xl p-4 border border-neutral-200 flex flex-col justify-between min-h-[130px]">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Credits
                </span>
                <div className="text-3xl font-bold text-neutral-900">
                  {currentCredits}
                </div>
                <span className="text-xs font-semibold text-neutral-400">
                  {selectedModule ? 'Module' : 'Total'}
                </span>
              </div>

              <div className="bg-neutral-50/70 rounded-2xl p-4 border border-neutral-200 flex flex-col justify-between min-h-[130px]">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Missed
                </span>
                <div className="text-3xl font-bold text-red-600">
                  {totalMissed}
                </div>
                <span className="text-xs font-semibold text-red-500">
                  {((totalMissed / totalRequired) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="bg-neutral-50/70 rounded-2xl p-4 border border-neutral-200 flex flex-col justify-between min-h-[130px]">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Can Miss
                </span>
                <div className="text-3xl font-bold text-[#0c3830]">
                  {canMissRemaining}
                </div>
                <span className="text-xs font-semibold text-neutral-500">
                  20% Limit
                </span>
              </div>
            </div>
          </div>

          {/* Clean Progress Bar Section */}
          <div className="border border-neutral-200 rounded-2xl p-4 sm:p-5 bg-neutral-50/40 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-neutral-900 font-bold text-base">Attendance</span>
                <span className="text-neutral-900 font-mono font-bold text-sm sm:text-base">
                  {attendedPercent.toFixed(1)}%
                </span>
              </div>

              <div className="w-full h-4 bg-neutral-200/80 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#22c55e] rounded-full transition-all duration-300"
                  style={{ width: `${attendedPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 pt-0.5">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-neutral-900 font-bold text-base">Absence Allowance</span>
                <span className="text-neutral-600 font-mono">
                  {totalMissed} <span className="text-neutral-400">/ {maxAllowance} Max</span>
                </span>
              </div>

              <div className="w-full h-2.5 bg-neutral-200/80 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    totalMissed >= maxAllowance
                      ? 'bg-red-600'
                      : totalMissed > maxAllowance * 0.7
                      ? 'bg-orange-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${allowanceUsedPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Attendance Overview */}
          {aaaData && (
            <div className="border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Attendance Overview</h2>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsJustificationOpen(true)}
                    className="px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer shrink-0"
                  >
                    Request Excused Absence
                  </button>
                </div>
              </div>

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

          {isJustificationOpen && (
            <AbsenceJustificationForm
              studentId={null}
              missedSessions={missedSessionOptions}
              onClose={() => setIsJustificationOpen(false)}
            />
          )}

          {/* Bottom Grid: Modules Breakdown (left, 7 cols) & Missed Classes (right, 5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1 items-start">
            
            {/* Modules List with Year 2 Subjects & Exact Credits (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  Modules
                </h2>
                <span className="text-xs font-bold text-neutral-400">
                  {modules.length} Total
                </span>
              </div>

              <div className="space-y-3">
                {modules.map((module) => {
                  const rate = Math.round(
                    (module.lectureRate + module.tutorialRate + module.workshopRate) / 3
                  );
                  const isAnySelected = selectedModuleId !== 'all';
                  const isSelected = selectedModuleId === module.id;

                  return (
                    <div
                      key={module.id}
                      onClick={() => setSelectedModuleId(isSelected ? 'all' : module.id)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer space-y-3 ${
                        isSelected
                          ? 'border-[#0c3830] bg-[#f2f7f5] opacity-100 shadow-xs'
                          : isAnySelected
                          ? 'border-neutral-200 bg-neutral-50/50 opacity-35 hover:opacity-75'
                          : 'border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100/80 opacity-100'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                          <span className="font-bold text-base sm:text-lg text-neutral-900 tracking-tight">
                            {module.name}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200 shrink-0">
                            {module.credits} Credits
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 sm:self-center">
                          <span className="text-xs font-semibold text-neutral-400 font-mono">
                            {module.attendedSessions}/{module.totalSessions}
                          </span>
                          <span className="text-base sm:text-lg font-bold text-[#0c3830] font-mono">
                            {rate}%
                          </span>
                        </div>
                      </div>

                      {/* Component breakdown left-aligned with vertical lines */}
                      <div className="flex items-center justify-start gap-4 sm:gap-6 pt-2.5 border-t border-neutral-200/60 text-xs text-neutral-600">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-500 font-medium">Lecture</span>
                          <span className="font-bold text-neutral-900">{module.lectureRate}%</span>
                        </div>
                        <div className="w-px h-3.5 bg-neutral-300" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-500 font-medium">Tutorial</span>
                          <span className="font-bold text-neutral-900">{module.tutorialRate}%</span>
                        </div>
                        <div className="w-px h-3.5 bg-neutral-300" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-500 font-medium">Workshop</span>
                          <span className="font-bold text-neutral-900">{module.workshopRate}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Missed Classes List (5 cols) */}
            <div id="missed-classes-section" className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  Missed
                </h2>
                <span className="text-xs font-bold text-neutral-400">
                  {filteredMissedClasses.length} Total
                </span>
              </div>

              {filteredMissedClasses.length === 0 ? (
                <div className="p-5 text-center text-sm font-bold text-emerald-700 bg-neutral-50 rounded-2xl border border-neutral-200">
                  No missed classes
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100 bg-white">
                  {filteredMissedClasses.map((session) => (
                    <div
                      key={session.id}
                      className="p-3.5 hover:bg-neutral-50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-neutral-900 block truncate">
                          {session.moduleName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium mt-0.5">
                          <span>{session.date}</span>
                          <span>·</span>
                          <span>{session.time}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200">
                          {session.type}
                        </span>
                        <span className="text-xs font-bold text-red-500 mt-1">
                          Absent
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
