import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  BookOpen,
  CalendarX2,
  Filter,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  GraduationCap,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Lock,
  Home,
  UploadCloud,
  Phone,
  LogIn,
  LogOut,
  KeyRound,
  UserCircle,
} from 'lucide-react';
import { PortalSecurityAuthModal } from './auth/PortalSecurityAuthModal';
import { StudentLoginModal } from './auth/StudentLoginModal';
import { CanonicalStudent } from '../types/canonical';
import { WelcomeView } from './welcome/WelcomeView';
import {
  STUDENT_PROFILE,
  MISSED_CLASSES,
  ModuleAttendance,
  IT_DEGREES,
  DEGREE_CURRICULA,
  AI_CURRICULUM,
} from '../data/attendanceData';
import { ISLINGTON_STUDENTS_LIST, StudentWithAttendance } from '../data/islingtonStudents';
import { PerspectiveSwitcher, PortalPerspective } from './perspectives/PerspectiveSwitcher';
import { StudentPerspective } from './perspectives/StudentPerspective';
import { ParentPerspective } from './perspectives/ParentPerspective';
import { AdminPerspective } from './perspectives/AdminPerspective';
import { useCanonicalStore } from '../hooks/useCanonicalStore';
import { Admin } from './Admin';
import { StudentsManager } from './StudentsManager';
import { ExcelManager } from './ExcelManager';
import { DailyAttendanceUpload } from './attendance/DailyAttendanceUpload';
import { AdminVerificationWorkbench } from './attendance/AdminVerificationWorkbench';

type AdminSubView = 'courses' | 'students' | 'excel' | 'attendance' | 'verify';

interface DashboardProps {
  initialStudentId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ initialStudentId }) => {
  const [currentPerspective, setCurrentPerspective] = useState<PortalPerspective>('welcome');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId ||
      (typeof window !== 'undefined' &&
        localStorage.getItem('attendease_logged_in_student_id')) ||
      'student-user-ai25'
  );
  const [isStudentLoginOpen, setIsStudentLoginOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  const [studentSubTab, setStudentSubTab] = useState<
    'dashboard' | 'slips' | 'contact-ssd' | 'missed' | 'timetable' | 'policy' | 'notices'
  >('dashboard');

  // Security Authentication for Portal Transitions
  const [isParentAuthenticated, setIsParentAuthenticated] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [parentVerifiedPhone, setParentVerifiedPhone] = useState<string>('');
  const [securityModal, setSecurityModal] = useState<{
    isOpen: boolean;
    targetRole: 'parent' | 'admin';
  }>({
    isOpen: false,
    targetRole: 'parent',
  });

  const handleSelectWelcome = () => {
    setActiveNav('dashboard');
    setCurrentPerspective('welcome');
  };

  const handleSelectStudentPanel = () => {
    setActiveNav('dashboard');
    setCurrentPerspective('student');
  };

  const handleSelectParentView = () => {
    if (isParentAuthenticated) {
      setActiveNav('dashboard');
      setCurrentPerspective('parent');
    } else {
      setSecurityModal({ isOpen: true, targetRole: 'parent' });
    }
  };

  const handleSelectAdminHub = () => {
    if (isAdminAuthenticated) {
      setActiveNav('dashboard');
      setCurrentPerspective('admin');
    } else {
      setSecurityModal({ isOpen: true, targetRole: 'admin' });
    }
  };

  const handleSecuritySuccess = (verifiedPhone?: string) => {
    if (securityModal.targetRole === 'parent') {
      setIsParentAuthenticated(true);
      if (verifiedPhone) setParentVerifiedPhone(verifiedPhone);
      setCurrentPerspective('parent');
      setActiveNav('dashboard');
    } else {
      setIsAdminAuthenticated(true);
      setCurrentPerspective('admin');
      setActiveNav('dashboard');
    }
    setSecurityModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleFullLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('attendease_logged_in_student_id');
      localStorage.removeItem('attendease_logged_in_email');
      localStorage.removeItem('attendease_logged_in_roll');
    }
    setIsParentAuthenticated(false);
    setParentVerifiedPhone('');
    setIsAdminAuthenticated(false);
    setIsStudentLoginOpen(false);
    setActiveNav('dashboard');
    setCurrentPerspective('welcome');
  };

  const handleLockPortal = (roleToLock: 'parent' | 'admin') => {
    if (roleToLock === 'parent') {
      setIsParentAuthenticated(false);
      setParentVerifiedPhone('');
    } else {
      setIsAdminAuthenticated(false);
    }
    setCurrentPerspective('student');
    setActiveNav('dashboard');
  };

  const currentRole =
    currentPerspective === 'admin' ? 'ADMIN' : currentPerspective === 'parent' ? 'PARENT' : 'STUDENT';
  const { students: canonicalStudents, currentStudent: currentCanonicalStudent } = useCanonicalStore(
    currentRole,
    selectedStudentId
  );

  const [studentsList, setStudentsList] = useState<StudentWithAttendance[]>(ISLINGTON_STUDENTS_LIST);
  const currentStudent = currentCanonicalStudent || studentsList[0];

  const [activeNav, setActiveNav] = useState<'dashboard' | 'admin'>('dashboard');
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('courses');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [moduleFilter, setModuleFilter] = useState<'all' | 'high' | 'safe' | 'risk'>('all');
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

  const totalTakenPlace = totalAttended + totalMissed;
  const remainingClasses = Math.max(0, totalRequired - totalTakenPlace);
  const classesHeldPercent =
    totalRequired > 0
      ? Math.min(100, Math.round((totalTakenPlace / totalRequired) * 100))
      : 0;
  const attendanceRateToDate =
    totalTakenPlace > 0
      ? ((totalAttended / totalTakenPlace) * 100).toFixed(1)
      : '100.0';

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

  // Search & Filter for modules
  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.code.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const rate = Math.round(
        (mod.lectureRate + mod.tutorialRate + mod.workshopRate) / 3
      );

      if (moduleFilter === 'high') return rate >= 90;
      if (moduleFilter === 'safe') return rate >= 85 && rate < 90;
      if (moduleFilter === 'risk') return rate < 85;

      return true;
    });
  }, [modules, searchQuery, moduleFilter]);

  const filteredMissedClasses = useMemo(() => {
    return MISSED_CLASSES.map((item) => {
      const matchingMod = modules.find(
        (m) => m.code === item.moduleCode || m.id === item.moduleCode
      );
      return {
        ...item,
        moduleName: matchingMod ? matchingMod.name : item.moduleName,
      };
    }).filter((item) => {
      const matchesModule =
        selectedModuleId === 'all' ||
        item.moduleCode === selectedModuleId ||
        (selectedModule && item.moduleCode === selectedModule.code);

      const matchesSearch =
        searchQuery.trim() === '' ||
        item.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.moduleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.date.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesModule && matchesSearch;
    });
  }, [modules, selectedModuleId, selectedModule, searchQuery]);

  const selectedLabel = selectedModule ? selectedModule.name : 'All Modules';

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans select-none flex flex-col lg:flex-row antialiased">
      
      {/* Deep Forest Pine Green Sidebar matching ClassPulse */}
      <aside className="w-full lg:w-72 bg-[#0c3830] text-white p-5 sm:p-6 flex flex-col justify-between shrink-0 lg:h-screen lg:sticky lg:top-0 border-r border-[#092923] shadow-lg z-20">
        <div className="space-y-6">
          {/* Logo & Exit button matching screenshot */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-0.5 text-[#22c55e] text-xl font-black select-none">
                ••
              </span>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white block leading-tight">
                  ClassPulse
                </span>
                <span className="text-[10px] font-semibold text-emerald-300/80 tracking-wider uppercase">
                  Islington College
                </span>
              </div>
            </div>

            <button
              id="sidebar-logout-top-btn"
              onClick={handleFullLogout}
              className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200/80 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              title="Sign Out / Change Student"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* CAMPUS PORTALS: Student Panel, Parent View, SSD Admin Hub at first */}
          <nav className="space-y-1.5">
            <div className="text-[10px] font-bold text-emerald-300/70 uppercase tracking-wider px-3 pb-1">
              CAMPUS PORTALS
            </div>

            {/* 1. Student Panel */}
            <div>
              <button
                id="sidebar-nav-student-panel"
                onClick={handleSelectStudentPanel}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                  currentPerspective === 'student' && activeNav === 'dashboard'
                    ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                    : 'text-emerald-100/75 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap
                    size={16}
                    className={currentPerspective === 'student' ? 'text-[#22c55e]' : ''}
                  />
                  <span>Student Panel</span>
                </div>
                {currentPerspective === 'student' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                )}
              </button>

              {/* Student Panel Internal Views */}
              {currentPerspective === 'student' && (
                <div className="mt-1 ml-3.5 pl-3 border-l border-emerald-500/30 space-y-0.5 py-1">
                  <button
                    id="sidebar-nav-dashboard"
                    onClick={() => {
                      setActiveNav('dashboard');
                      setStudentSubTab('dashboard');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                      studentSubTab === 'dashboard'
                        ? 'bg-emerald-500/20 text-white font-bold'
                        : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <LayoutDashboard size={14} />
                      <span>Dashboard</span>
                    </div>
                  </button>

                  <button
                    id="sidebar-nav-slips"
                    onClick={() => {
                      setActiveNav('dashboard');
                      setStudentSubTab('slips');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                      studentSubTab === 'slips'
                        ? 'bg-emerald-500/20 text-white font-bold'
                        : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UploadCloud size={14} />
                      <span>Upload Slips</span>
                    </div>
                  </button>

                  <button
                    id="sidebar-nav-contact-ssd"
                    onClick={() => {
                      setActiveNav('dashboard');
                      setStudentSubTab('contact-ssd');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                      studentSubTab === 'contact-ssd'
                        ? 'bg-emerald-500/20 text-white font-bold'
                        : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      <span>Contact SSD</span>
                    </div>
                  </button>

                  <button
                    id="sidebar-nav-missed"
                    onClick={() => {
                      setActiveNav('dashboard');
                      setStudentSubTab('missed');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                      studentSubTab === 'missed'
                        ? 'bg-emerald-500/20 text-white font-bold'
                        : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare size={14} />
                      <span>Missed</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#e11d48] text-white">
                      12
                    </span>
                  </button>

                  <button
                    id="sidebar-nav-timetable"
                    onClick={() => {
                      setActiveNav('dashboard');
                      setStudentSubTab('timetable');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                      studentSubTab === 'timetable'
                        ? 'bg-emerald-500/20 text-white font-bold'
                        : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>Class Timetable</span>
                    </div>
                  </button>

                  <button
                    id="sidebar-nav-policy"
                    onClick={() => {
                      setActiveNav('dashboard');
                      setStudentSubTab('policy');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                      studentSubTab === 'policy'
                        ? 'bg-emerald-500/20 text-white font-bold'
                        : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} />
                      <span>Attendance & Policy</span>
                    </div>
                  </button>

                  <button
                    id="sidebar-nav-notices"
                    onClick={() => {
                      setActiveNav('dashboard');
                      setStudentSubTab('notices');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                      studentSubTab === 'notices'
                        ? 'bg-emerald-500/20 text-white font-bold'
                        : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Bell size={14} />
                      <span>College Notices</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Parent View */}
            <button
              id="sidebar-nav-parent"
              onClick={handleSelectParentView}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                currentPerspective === 'parent'
                  ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                  : 'text-emerald-100/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users
                  size={16}
                  className={currentPerspective === 'parent' ? 'text-[#22c55e]' : ''}
                />
                <span>Parent View</span>
              </div>
              <div className="flex items-center gap-1.5">
                {!isParentAuthenticated ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-200/70 bg-white/10 px-2 py-0.5 rounded-md">
                    <Lock size={10} />
                    <span>College OTP</span>
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                )}
              </div>
            </button>

            {/* 3. SSD Admin Hub */}
            <button
              id="sidebar-nav-admin"
              onClick={handleSelectAdminHub}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                currentPerspective === 'admin'
                  ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                  : 'text-emerald-100/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck
                  size={16}
                  className={currentPerspective === 'admin' ? 'text-[#22c55e]' : ''}
                />
                <span>SSD Admin Hub</span>
              </div>
              <div className="flex items-center gap-1.5">
                {!isAdminAuthenticated ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-200/70 bg-white/10 px-2 py-0.5 rounded-md">
                    <Lock size={10} />
                    <span>Staff PIN</span>
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                )}
              </div>
            </button>

            {/* If in Admin view, display tools */}
            {currentPerspective === 'admin' && (
              <div className="pt-2 pb-1 border-t border-white/10 mt-2 space-y-1">
                <div className="text-[10px] font-bold text-emerald-300/70 uppercase tracking-wider px-3 pb-1">
                  ADMIN TOOLS
                </div>

                <button
                  onClick={() => {
                    setActiveNav('admin');
                    setAdminSubView('courses');
                  }}
                  className={`w-full flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeNav === 'admin' && adminSubView === 'courses'
                      ? 'bg-[#22c55e] text-neutral-900 font-bold shadow-sm'
                      : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Curricula Editor
                </button>

                <button
                  onClick={() => {
                    setActiveNav('admin');
                    setAdminSubView('students');
                  }}
                  className={`w-full flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeNav === 'admin' && adminSubView === 'students'
                      ? 'bg-[#22c55e] text-neutral-900 font-bold shadow-sm'
                      : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Student Database
                </button>

                <button
                  onClick={() => {
                    setActiveNav('admin');
                    setAdminSubView('excel');
                  }}
                  className={`w-full flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeNav === 'admin' && adminSubView === 'excel'
                      ? 'bg-[#22c55e] text-neutral-900 font-bold shadow-sm'
                      : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Excel Sync
                </button>

                <button
                  onClick={() => {
                    setActiveNav('admin');
                    setAdminSubView('attendance');
                  }}
                  className={`w-full flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeNav === 'admin' && adminSubView === 'attendance'
                      ? 'bg-[#22c55e] text-neutral-900 font-bold shadow-sm'
                      : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Daily Attendance Upload
                </button>

                <button
                  onClick={() => {
                    setActiveNav('admin');
                    setAdminSubView('verify');
                  }}
                  className={`w-full flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeNav === 'admin' && adminSubView === 'verify'
                      ? 'bg-[#22c55e] text-neutral-900 font-bold shadow-sm'
                      : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Verify Medical Slips
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Active Student Profile Card & Account Switcher */}
        <div className="pt-4 border-t border-white/10 mt-6 space-y-2.5">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-[#22c55e] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {currentCanonicalStudent.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="font-bold text-sm text-white truncate">
                {currentCanonicalStudent.fullName}
              </div>
              <div className="text-[11px] text-emerald-200/70 truncate mt-0.5">
                {currentCanonicalStudent.email}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5 flex items-center gap-1.5">
                <span>{currentCanonicalStudent.rollNumber}</span>
                <span className="text-emerald-500/60">·</span>
                <span className="text-emerald-200/80">{currentCanonicalStudent.year}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="sidebar-switch-student-btn"
              onClick={() => setIsStudentLoginOpen(true)}
              className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Login with another College Email & ID"
            >
              <LogIn size={13} className="text-emerald-300" />
              <span>Switch Student</span>
            </button>

            <button
              id="sidebar-logout-btn"
              onClick={handleFullLogout}
              className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:border-rose-500/30 text-emerald-100/80 hover:text-rose-200 border border-white/5 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Sign Out of Portal"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      {activeNav === 'admin' ? (
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
          <div className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto bg-[#f8fafc]">
            <DailyAttendanceUpload />
          </div>
        ) : (
          <div className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto bg-[#f8fafc]">
            <AdminVerificationWorkbench />
          </div>
        )
      ) : (
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] flex flex-col">
          <div className="flex-1 p-6 sm:p-8 lg:p-10">
            {/* Top Student Session & Quick Switch Bar */}
            <div className="mb-6 bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0c3830] text-emerald-300 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  IC
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                      Islington College Student Portal
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      Active Student
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="font-bold text-slate-800">
                      {currentCanonicalStudent.fullName}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] border border-emerald-100">
                      {currentCanonicalStudent.rollNumber}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-medium">
                      {currentCanonicalStudent.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  id="header-switch-student-btn"
                  onClick={() => setIsStudentLoginOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Sign in with your College Email & ID"
                >
                  <LogIn size={13} className="text-emerald-700" />
                  <span>Login with College Email & ID</span>
                </button>

                <button
                  id="header-signout-btn"
                  onClick={handleFullLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Session Clearance & Lock Banner for Parent View */}
            {currentPerspective === 'parent' && (
              <div className="mb-5 bg-white border border-emerald-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>Authenticated Guardian Portal</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span>Viewing attendance status for {currentCanonicalStudent.fullName} ({currentCanonicalStudent.rollNumber})</span>
                      {parentVerifiedPhone && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Verified Mobile: {parentVerifiedPhone} (College System OTP)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleLockPortal('parent')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Lock size={12} />
                  <span>Lock & Return to Student Panel</span>
                </button>
              </div>
            )}

            {/* Session Clearance & Lock Banner for SSD Admin Hub */}
            {currentPerspective === 'admin' && (
              <div className="mb-5 bg-slate-900 text-white border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>SSD Administrative Clearance Active</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Attendance records, medical verification & academic routine governance
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleLockPortal('admin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Lock size={12} />
                  <span>Lock & Return to Student Panel</span>
                </button>
              </div>
            )}

            {currentPerspective === 'welcome' && (
              <WelcomeView
                onSelectPerspective={(p) => {
                  if (p === 'student') {
                    setIsStudentLoginOpen(true);
                  } else if (p === 'parent') {
                    handleSelectParentView();
                  } else if (p === 'admin') {
                    handleSelectAdminHub();
                  }
                }}
                isParentAuthenticated={isParentAuthenticated}
                isAdminAuthenticated={isAdminAuthenticated}
              />
            )}

            {currentPerspective === 'student' && (
              <StudentPerspective
                student={currentCanonicalStudent}
                activeSubTab={studentSubTab}
                onSubTabChange={setStudentSubTab}
              />
            )}

            {currentPerspective === 'parent' && (
              <ParentPerspective
                student={currentCanonicalStudent}
                verifiedPhone={parentVerifiedPhone}
              />
            )}

            {currentPerspective === 'admin' && (
              <AdminPerspective
                students={canonicalStudents}
                onSelectStudentForReview={(id) => {
                  setSelectedStudentId(id);
                  setCurrentPerspective('student');
                }}
                onOpenAdminManager={(sub) => {
                  setActiveNav('admin');
                  setAdminSubView(sub);
                }}
              />
            )}
          </div>
        </main>
      )}

      {/* Portal Transition Security Authentication Modal */}
      <PortalSecurityAuthModal
        isOpen={securityModal.isOpen}
        targetRole={securityModal.targetRole}
        student={currentCanonicalStudent}
        onSuccess={handleSecuritySuccess}
        onClose={() => setSecurityModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Student Login with College Email & ID Modal */}
      <StudentLoginModal
        isOpen={isStudentLoginOpen}
        onClose={() => setIsStudentLoginOpen(false)}
        onLoginSuccess={(student) => {
          setSelectedStudentId(student.id);
          setCurrentPerspective('student');
          setIsStudentLoginOpen(false);
        }}
      />
    </div>
  );
};
