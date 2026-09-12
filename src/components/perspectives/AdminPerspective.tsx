import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Phone,
  BookOpen,
  Filter,
  Check,
  X,
  ExternalLink,
  Edit3,
  Calendar,
  Clock,
  MessageSquare,
  History,
  FileText,
  UserCheck,
  Lock,
  Send,
  PlusCircle,
  ChevronRight,
  ArrowLeft,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import {
  CanonicalStudent,
  AttendanceStatus,
  SupportCase,
  Role,
  Appointment,
  AttendanceRecord,
} from '../../types/canonical';
import { calculateStudentAttendanceMetrics } from '../../utils/canonicalAttendanceEngine';
import { useCanonicalStore } from '../../hooks/useCanonicalStore';

interface AdminPerspectiveProps {
  students: CanonicalStudent[];
  onSelectStudentForReview: (studentId: string) => void;
  onOpenAdminManager: (subview: 'courses' | 'students' | 'excel' | 'attendance' | 'verify') => void;
}

type AdminViewMode = 'home' | 'queue' | 'students' | 'student-profile';
type StudentProfileTab =
  | 'overview'
  | 'attendance'
  | 'academics'
  | 'assessments'
  | 'schedule'
  | 'services'
  | 'communication'
  | 'audit';

export const AdminPerspective: React.FC<AdminPerspectiveProps> = ({
  students,
  onSelectStudentForReview,
  onOpenAdminManager,
}) => {
  const {
    policy,
    notices,
    correctAttendance,
    updateCaseStatus,
    addSupportCaseMessage,
    scheduleAppointment,
    createNotice,
    createSupportCase,
  } = useCanonicalStore('ADMIN');

  // Navigation state
  const [viewMode, setViewMode] = useState<AdminViewMode>('home');
  const [activeProfileStudentId, setActiveProfileStudentId] = useState<string | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<StudentProfileTab>('overview');

  // Queue filter
  const [queueFilter, setQueueFilter] = useState<'all' | 'attendance' | 'academic' | 'cases'>('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Modals
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('AUTHORISED_ABSENCE');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionSuccessMsg, setCorrectionSuccessMsg] = useState<string | null>(null);

  // Quick Action Modals
  const [showCreateCaseModal, setShowCreateCaseModal] = useState(false);
  const [newCaseStudentId, setNewCaseStudentId] = useState(students[0]?.id || '');
  const [newCaseSubject, setNewCaseSubject] = useState('');
  const [newCaseDescription, setNewCaseDescription] = useState('');
  const [newCaseCategory, setNewCaseCategory] = useState<SupportCase['category']>('Attendance Appeal & Medical Waiver');

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [aptStudentId, setAptStudentId] = useState(students[0]?.id || '');
  const [aptType, setAptType] = useState<Appointment['appointmentType']>('Attendance Hearing');
  const [aptDate, setAptDate] = useState('2026-09-14');
  const [aptTime, setAptTime] = useState('11:00 AM - 11:30 AM');
  const [aptNotes, setAptNotes] = useState('');

  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeSummary, setNoticeSummary] = useState('');
  const [noticeAudience, setNoticeAudience] = useState<'ALL' | 'STUDENTS' | 'PARENTS'>('ALL');

  // Case reply state inside profile
  const [caseStaffReply, setCaseStaffReply] = useState('');
  const [isConfidentialNote, setIsConfidentialNote] = useState(false);

  // Evaluated student metrics
  const evaluatedStudents = useMemo(() => {
    return students.map((s) => ({
      student: s,
      metrics: calculateStudentAttendanceMetrics(s, policy),
    }));
  }, [students, policy]);

  // Derived attention signals
  const criticalAttendanceStudents = useMemo(
    () => evaluatedStudents.filter((item) => item.metrics.isDebarredRisk),
    [evaluatedStudents]
  );
  const cautionAttendanceStudents = useMemo(
    () => evaluatedStudents.filter((item) => item.metrics.isCautionaryZone),
    [evaluatedStudents]
  );
  const academicDeclineStudents = useMemo(
    () => evaluatedStudents.filter((item) => (item.student.gpa || 0) < 3.0 || item.student.modules.some(m => (m.currentMark || 0) < 60)),
    [evaluatedStudents]
  );

  const allOpenCases = useMemo(() => {
    return students.flatMap((s) =>
      s.supportCases
        .filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED')
        .map((c) => ({
          ...c,
          studentName: s.fullName,
          studentRoll: s.rollNumber,
          degreeName: s.degreeName,
        }))
    );
  }, [students]);

  const totalAttentionCount =
    criticalAttendanceStudents.length +
    academicDeclineStudents.length +
    allOpenCases.length +
    2; // unread / pending confirmations

  // Active student in profile mode
  const activeStudent = useMemo(() => {
    if (!activeProfileStudentId) return null;
    return students.find((s) => s.id === activeProfileStudentId) || null;
  }, [activeProfileStudentId, students]);

  const activeStudentMetrics = useMemo(() => {
    if (!activeStudent) return null;
    return calculateStudentAttendanceMetrics(activeStudent, policy);
  }, [activeStudent, policy]);

  // Search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return evaluatedStudents.filter(({ student }) => {
      return (
        student.fullName.toLowerCase().includes(q) ||
        student.rollNumber.toLowerCase().includes(q) ||
        student.degreeName.toLowerCase().includes(q) ||
        student.modules.some((m) => m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, evaluatedStudents]);

  // Handler to open student profile
  const handleOpenStudentProfile = (studentId: string) => {
    setActiveProfileStudentId(studentId);
    setActiveProfileTab('overview');
    setViewMode('student-profile');
    setSearchQuery('');
  };

  // Handler for Attendance Correction
  const handleSaveCorrection = () => {
    if (!activeStudent || !selectedSessionId || !correctionReason.trim()) return;
    const res = correctAttendance(
      activeStudent.id,
      selectedSessionId,
      newStatus,
      correctionReason,
      'SSD Administrator'
    );
    if (res.success) {
      setCorrectionSuccessMsg('Attendance corrected and recorded in immutable audit log.');
      setTimeout(() => {
        setCorrectionSuccessMsg(null);
        setShowCorrectionModal(false);
        setCorrectionReason('');
        setSelectedSessionId('');
      }, 1400);
    }
  };

  // Handler for Case Reply inside profile
  const handleSendCaseMessage = (caseId: string) => {
    if (!caseStaffReply.trim()) return;
    addSupportCaseMessage(
      caseId,
      caseStaffReply,
      'SSD Lead Officer',
      isConfidentialNote
    );
    setCaseStaffReply('');
  };

  return (
    <div className="max-w-[1360px] mx-auto text-[#1F2933]">
      
      {/* Search Header Bar (Always present for fast search-first workflow) */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E7EC]">
        {/* Navigation Breadcrumb / View Switcher */}
        <div className="flex items-center gap-2">
          {viewMode === 'student-profile' && activeStudent ? (
            <button
              onClick={() => setViewMode('queue')}
              className="flex items-center gap-1 text-xs font-semibold text-[#123A63] hover:text-[#0B2947] cursor-pointer mr-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Queue</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-[#F2F4F7] p-1 rounded-md border border-[#E4E7EC] text-xs">
              <button
                onClick={() => setViewMode('home')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  viewMode === 'home' ? 'bg-white text-[#123A63] font-bold shadow-xs' : 'text-[#667085] hover:text-[#1F2933]'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setViewMode('queue')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  viewMode === 'queue' ? 'bg-white text-[#123A63] font-bold shadow-xs' : 'text-[#667085] hover:text-[#1F2933]'
                }`}
              >
                Attention Queue ({totalAttentionCount})
              </button>
              <button
                onClick={() => setViewMode('students')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  viewMode === 'students' ? 'bg-white text-[#123A63] font-bold shadow-xs' : 'text-[#667085] hover:text-[#1F2933]'
                }`}
              >
                Cohort Directory
              </button>
            </div>
          )}
        </div>

        {/* Global Fast Student Search */}
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          <input
            id="admin-student-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search student, ID, programme, module..."
            className="w-full bg-white border border-[#E4E7EC] rounded-md pl-9 pr-8 py-1.5 text-xs text-[#1F2933] placeholder-[#667085] focus:outline-none focus:border-[#123A63]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#1F2933]"
            >
              <X size={12} />
            </button>
          )}

          {/* Instant Search Results Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E4E7EC] rounded-md shadow-lg z-40 max-h-80 overflow-y-auto">
              <div className="p-2 text-[11px] font-semibold text-[#667085] border-b border-[#E4E7EC] bg-[#FAFAF8]">
                {searchResults.length} student{searchResults.length === 1 ? '' : 's'} matching "{searchQuery}"
              </div>
              {searchResults.length === 0 ? (
                <div className="p-4 text-xs text-[#667085] text-center">
                  No matching student found. Try searching by Roll Number (e.g. NP03CS4S24...)
                </div>
              ) : (
                searchResults.map(({ student, metrics }) => (
                  <button
                    key={student.id}
                    onClick={() => handleOpenStudentProfile(student.id)}
                    className="w-full text-left p-2.5 hover:bg-[#F2F4F7] border-b border-[#E4E7EC] last:border-b-0 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-xs text-[#1F2933]">{student.fullName}</div>
                      <div className="text-[11px] text-[#667085]">{student.rollNumber} · {student.degreeName}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${metrics.isDebarredRisk ? 'text-[#B42318]' : 'text-[#15803D]'}`}>
                        {metrics.attendancePercentage}%
                      </span>
                      <div className="text-[10px] text-[#667085]">
                        {metrics.isDebarredRisk ? 'Debarred Risk' : 'On Track'}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: ADMIN HOME (COORDINATOR DASHBOARD: ATTENTION, TODAY, RECENT, QUICK)
          ========================================================================= */}
      {viewMode === 'home' && (
        <div className="space-y-8">
          
          {/* Header Signal */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B2947]">
              Good morning, SSD Team
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
              <strong className="text-[#C62828] font-bold">{totalAttentionCount} items</strong> require administrative attention or follow-up today.
            </p>
          </div>

          {/* 1. ATTENTION AREA (Primary focus of coordinator) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#E4E7EC]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B2947]">
                Attention
              </h2>
              <button
                onClick={() => {
                  setQueueFilter('all');
                  setViewMode('queue');
                }}
                className="text-xs font-semibold text-[#123A63] hover:underline cursor-pointer"
              >
                Open Full Queue ({totalAttentionCount}) →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Attention 1: Attendance */}
              <div className="p-4 bg-white border border-[#E4E7EC] rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1F2933]">Attendance</div>
                  <div className="text-sm font-semibold text-[#C62828] mt-0.5">
                    {criticalAttendanceStudents.length} students below configured threshold (80%)
                  </div>
                  <div className="text-xs text-[#667085] mt-0.5">
                    Mandatory exam hall ticket clearance risk
                  </div>
                </div>
                <button
                  onClick={() => {
                    setQueueFilter('attendance');
                    setViewMode('queue');
                  }}
                  className="px-3 py-1.5 bg-[#F2F4F7] hover:bg-[#E4E7EC] text-[#123A63] text-xs font-semibold rounded border border-[#E4E7EC] cursor-pointer transition-colors"
                >
                  Review
                </button>
              </div>

              {/* Attention 2: Academic Decline */}
              <div className="p-4 bg-white border border-[#E4E7EC] rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1F2933]">Academic</div>
                  <div className="text-sm font-semibold text-[#B45309] mt-0.5">
                    {academicDeclineStudents.length} students with recent performance concerns
                  </div>
                  <div className="text-xs text-[#667085] mt-0.5">
                    Module marks below 60% or referral risk
                  </div>
                </div>
                <button
                  onClick={() => {
                    setQueueFilter('academic');
                    setViewMode('queue');
                  }}
                  className="px-3 py-1.5 bg-[#F2F4F7] hover:bg-[#E4E7EC] text-[#123A63] text-xs font-semibold rounded border border-[#E4E7EC] cursor-pointer transition-colors"
                >
                  Review
                </button>
              </div>

              {/* Attention 3: Student Services Cases */}
              <div className="p-4 bg-white border border-[#E4E7EC] rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1F2933]">Student Services</div>
                  <div className="text-sm font-semibold text-[#0B2947] mt-0.5">
                    {allOpenCases.length} cases waiting for action
                  </div>
                  <div className="text-xs text-[#667085] mt-0.5">
                    Medical waiver appeals & advisory requests
                  </div>
                </div>
                <button
                  onClick={() => {
                    setQueueFilter('cases');
                    setViewMode('queue');
                  }}
                  className="px-3 py-1.5 bg-[#F2F4F7] hover:bg-[#E4E7EC] text-[#123A63] text-xs font-semibold rounded border border-[#E4E7EC] cursor-pointer transition-colors"
                >
                  Open queue
                </button>
              </div>

              {/* Attention 4: Communications */}
              <div className="p-4 bg-white border border-[#E4E7EC] rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1F2933]">Communications</div>
                  <div className="text-sm font-semibold text-[#0B2947] mt-0.5">
                    2 guardian inquiries awaiting advisory response
                  </div>
                  <div className="text-xs text-[#667085] mt-0.5">
                    Consultation requests & attendance queries
                  </div>
                </div>
                <button
                  onClick={() => {
                    setQueueFilter('cases');
                    setViewMode('queue');
                  }}
                  className="px-3 py-1.5 bg-[#F2F4F7] hover:bg-[#E4E7EC] text-[#123A63] text-xs font-semibold rounded border border-[#E4E7EC] cursor-pointer transition-colors"
                >
                  Review
                </button>
              </div>

            </div>
          </section>

          {/* 2. TODAY AREA (Scheduled obligations) */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B2947] pb-1 border-b border-[#E4E7EC]">
              Today
            </h2>

            <div className="bg-white border border-[#E4E7EC] rounded-lg divide-y divide-[#E4E7EC]">
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#0B2947] bg-[#F2F4F7] px-2 py-0.5 rounded">
                    10:00
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[#1F2933]">
                      Appointment — Student Support (Priya Thapa)
                    </div>
                    <div className="text-[11px] text-[#667085]">
                      Medical waiver verification & attendance recovery plan · Room 102
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenStudentProfile('student-2')}
                  className="text-xs font-semibold text-[#123A63] hover:underline cursor-pointer"
                >
                  View student
                </button>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#0B2947] bg-[#F2F4F7] px-2 py-0.5 rounded">
                    11:30
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[#1F2933]">
                      Academic Intervention Review (Rohan Maharjan)
                    </div>
                    <div className="text-[11px] text-[#667085]">
                      Attendance 69.5% debarment hearing with Guardian · SSD Boardroom
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenStudentProfile('student-4')}
                  className="text-xs font-semibold text-[#123A63] hover:underline cursor-pointer"
                >
                  View student
                </button>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#0B2947] bg-[#F2F4F7] px-2 py-0.5 rounded">
                    14:00
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[#1F2933]">
                      Parent Communication & Progress Review
                    </div>
                    <div className="text-[11px] text-[#667085]">
                      Guardian consultation via Microsoft Teams
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="text-xs font-semibold text-[#123A63] hover:underline cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>
          </section>

          {/* 3. RECENT CHANGES (Audit trail & recent state shifts) */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B2947] pb-1 border-b border-[#E4E7EC]">
              Recent Changes
            </h2>

            <div className="bg-white border border-[#E4E7EC] rounded-lg divide-y divide-[#E4E7EC]">
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-[#F2F4F7] text-[#123A63] font-bold text-xs flex items-center justify-center">
                    AS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1F2933]">
                      Aarav Sharma
                    </div>
                    <div className="text-[11px] text-[#667085]">
                      Attendance record verified & marked PRESENT · Lecture AI5001
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-[#667085] font-mono">
                  10 minutes ago
                </span>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-[#F2F4F7] text-[#123A63] font-bold text-xs flex items-center justify-center">
                    PT
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1F2933]">
                      Priya Thapa
                    </div>
                    <div className="text-[11px] text-[#667085]">
                      Medical appeal ticket #SSD-2026-089 submitted with Norvic Hospital slip
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-[#667085] font-mono">
                  42 minutes ago
                </span>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-[#F2F4F7] text-[#123A63] font-bold text-xs flex items-center justify-center">
                    RM
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1F2933]">
                      Rohan Maharjan
                    </div>
                    <div className="text-[11px] text-[#667085]">
                      Debarment warning letter dispatched to guardian (Krishna Maharjan)
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-[#667085] font-mono">
                  2 hours ago
                </span>
              </div>
            </div>
          </section>

          {/* 4. QUICK ACTIONS */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B2947] pb-1 border-b border-[#E4E7EC]">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => {
                  const input = document.getElementById('admin-student-search-input');
                  input?.focus();
                }}
                className="p-3.5 bg-white border border-[#E4E7EC] hover:border-[#123A63] rounded-lg text-left transition-all cursor-pointer group"
              >
                <Search size={16} className="text-[#123A63] mb-1.5" />
                <div className="text-xs font-bold text-[#1F2933] group-hover:text-[#123A63]">Search student</div>
                <div className="text-[11px] text-[#667085]">Find record by name or ID</div>
              </button>

              <button
                onClick={() => setShowCreateCaseModal(true)}
                className="p-3.5 bg-white border border-[#E4E7EC] hover:border-[#123A63] rounded-lg text-left transition-all cursor-pointer group"
              >
                <MessageSquare size={16} className="text-[#123A63] mb-1.5" />
                <div className="text-xs font-bold text-[#1F2933] group-hover:text-[#123A63]">Create case</div>
                <div className="text-[11px] text-[#667085]">Log appeal or support issue</div>
              </button>

              <button
                onClick={() => setShowScheduleModal(true)}
                className="p-3.5 bg-white border border-[#E4E7EC] hover:border-[#123A63] rounded-lg text-left transition-all cursor-pointer group"
              >
                <Calendar size={16} className="text-[#123A63] mb-1.5" />
                <div className="text-xs font-bold text-[#1F2933] group-hover:text-[#123A63]">Schedule appointment</div>
                <div className="text-[11px] text-[#667085]">Set advisory hearing</div>
              </button>

              <button
                onClick={() => setShowNoticeModal(true)}
                className="p-3.5 bg-white border border-[#E4E7EC] hover:border-[#123A63] rounded-lg text-left transition-all cursor-pointer group"
              >
                <FileText size={16} className="text-[#123A63] mb-1.5" />
                <div className="text-xs font-bold text-[#1F2933] group-hover:text-[#123A63]">Publish notice</div>
                <div className="text-[11px] text-[#667085]">Post institutional update</div>
              </button>
            </div>
          </section>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: ATTENTION QUEUE (WHO, WHAT, WHY, SEVERITY, NEXT ACTION)
          ========================================================================= */}
      {viewMode === 'queue' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E7EC]">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#0B2947]">
                Attention Queue
              </h1>
              <p className="text-xs text-[#667085] mt-0.5">
                Review verified signals requiring administrative action or intervention.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-[#F2F4F7] p-1 rounded-md border border-[#E4E7EC] text-xs">
              <button
                onClick={() => setQueueFilter('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  queueFilter === 'all' ? 'bg-white text-[#123A63] font-bold shadow-xs' : 'text-[#667085]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setQueueFilter('attendance')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  queueFilter === 'attendance' ? 'bg-white text-[#123A63] font-bold shadow-xs' : 'text-[#667085]'
                }`}
              >
                Attendance ({criticalAttendanceStudents.length})
              </button>
              <button
                onClick={() => setQueueFilter('academic')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  queueFilter === 'academic' ? 'bg-white text-[#123A63] font-bold shadow-xs' : 'text-[#667085]'
                }`}
              >
                Academic ({academicDeclineStudents.length})
              </button>
              <button
                onClick={() => setQueueFilter('cases')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  queueFilter === 'cases' ? 'bg-white text-[#123A63] font-bold shadow-xs' : 'text-[#667085]'
                }`}
              >
                Cases ({allOpenCases.length})
              </button>
            </div>
          </div>

          {/* Attention Queue Items list */}
          <div className="space-y-3">
            
            {/* Critical Attendance Items */}
            {(queueFilter === 'all' || queueFilter === 'attendance') &&
              criticalAttendanceStudents.map(({ student, metrics }) => (
                <div
                  key={`att-${student.id}`}
                  className="p-4 bg-white border border-[#E4E7EC] rounded-lg hover:border-[#123A63]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1F2933]">
                        {student.fullName}
                      </span>
                      <span className="text-[11px] text-[#667085]">
                        ({student.rollNumber}) · {student.degreeName}
                      </span>
                      <span className="text-[10px] font-bold bg-[#FEE4E2] text-[#B42318] px-2 py-0.5 rounded border border-[#FECDCA]">
                        CRITICAL
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#1F2933]">
                      Attendance {metrics.attendancePercentage}% (Below 80.0% policy reference)
                    </div>

                    <div className="text-xs text-[#667085]">
                      <strong>Why:</strong> Attended {metrics.attendedSessions} of {metrics.eligibleSessions} sessions.
                      Exceeded allowable absences by {Math.abs(metrics.remainingAbsenceBuffer)} session(s). Requires {metrics.recoverySessionsNeededFor80} consecutive attended sessions to regain 80%.
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenStudentProfile(student.id)}
                      className="px-3 py-1.5 bg-[#123A63] text-white text-xs font-semibold rounded hover:bg-[#0B2947] transition-colors cursor-pointer"
                    >
                      Review student
                    </button>
                  </div>
                </div>
              ))}

            {/* Academic Concern Items */}
            {(queueFilter === 'all' || queueFilter === 'academic') &&
              academicDeclineStudents.map(({ student }) => (
                <div
                  key={`acad-${student.id}`}
                  className="p-4 bg-white border border-[#E4E7EC] rounded-lg hover:border-[#123A63]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1F2933]">
                        {student.fullName}
                      </span>
                      <span className="text-[11px] text-[#667085]">
                        ({student.rollNumber}) · {student.degreeName}
                      </span>
                      <span className="text-[10px] font-bold bg-[#FEF0C7] text-[#B45309] px-2 py-0.5 rounded border border-[#FEDF89]">
                        WARNING
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#1F2933]">
                      Academic performance decline / Referral risk
                    </div>

                    <div className="text-xs text-[#667085]">
                      <strong>Why:</strong> Current GPA {student.gpa} or coursework marks below passing grade (40%) in core modules.
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenStudentProfile(student.id)}
                      className="px-3 py-1.5 bg-[#123A63] text-white text-xs font-semibold rounded hover:bg-[#0B2947] transition-colors cursor-pointer"
                    >
                      Review student
                    </button>
                  </div>
                </div>
              ))}

            {/* Open Support Cases */}
            {(queueFilter === 'all' || queueFilter === 'cases') &&
              allOpenCases.map((c) => (
                <div
                  key={`case-${c.id}`}
                  className="p-4 bg-white border border-[#E4E7EC] rounded-lg hover:border-[#123A63]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1F2933]">
                        {c.studentName}
                      </span>
                      <span className="text-[11px] text-[#667085]">
                        ({c.studentRoll}) · Ticket #{c.ticketNumber}
                      </span>
                      <span className="text-[10px] font-bold bg-[#EFF8FF] text-[#175CD3] px-2 py-0.5 rounded border border-[#B2DDFF]">
                        {c.category}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#1F2933]">
                      {c.subject}
                    </div>

                    <div className="text-xs text-[#667085]">
                      <strong>Why:</strong> {c.description}
                      {c.messages.length > 0 && ` (${c.messages.length} message thread)`}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => {
                        const targetStudent = students.find(s => s.supportCases.some(sc => sc.id === c.id));
                        if (targetStudent) {
                          handleOpenStudentProfile(targetStudent.id);
                          setActiveProfileTab('services');
                        }
                      }}
                      className="px-3 py-1.5 bg-[#123A63] text-white text-xs font-semibold rounded hover:bg-[#0B2947] transition-colors cursor-pointer"
                    >
                      Open case
                    </button>
                  </div>
                </div>
              ))}

          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: COHORT DIRECTORY TABLE (TABLE RULE: COMPARISON, NOT CARD BLOAT)
          ========================================================================= */}
      {viewMode === 'students' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#0B2947]">
                Cohort Directory
              </h1>
              <p className="text-xs text-[#667085] mt-0.5">
                Active students registered in Islington College academic periods.
              </p>
            </div>
            <div className="text-xs text-[#667085]">
              Total Records: <strong>{students.length}</strong>
            </div>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1F2933]">
              <thead className="bg-[#FAFAF8] text-[#667085] font-semibold uppercase text-[10px] border-b border-[#E4E7EC]">
                <tr>
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Programme & Year</th>
                  <th className="px-4 py-2.5">Attendance</th>
                  <th className="px-4 py-2.5">Academic Standing</th>
                  <th className="px-4 py-2.5">Cases</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {evaluatedStudents.map(({ student, metrics }) => (
                  <tr key={student.id} className="hover:bg-[#F2F4F7]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#1F2933]">{student.fullName}</div>
                      <div className="text-[11px] text-[#667085] font-mono">{student.rollNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[#1F2933]">{student.degreeName}</div>
                      <div className="text-[11px] text-[#667085]">{student.year} · {student.academicPeriod}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${metrics.isDebarredRisk ? 'text-[#B42318]' : metrics.attendancePercentage >= 95 ? 'text-[#15803D]' : 'text-[#1F2933]'}`}>
                          {metrics.attendancePercentage}%
                        </span>
                        <span className="text-[11px] text-[#667085]">
                          ({metrics.attendedSessions}/{metrics.eligibleSessions})
                        </span>
                      </div>
                      {metrics.isDebarredRisk && (
                        <span className="text-[10px] font-bold text-[#B42318]">
                          Debarred Risk (&lt;80%)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1F2933]">{student.academicStanding}</div>
                      <div className="text-[11px] text-[#667085]">GPA {student.gpa}</div>
                    </td>
                    <td className="px-4 py-3">
                      {student.supportCases.length > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF8FF] text-[#175CD3]">
                          {student.supportCases.length} open
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#667085]">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenStudentProfile(student.id)}
                        className="px-2.5 py-1 bg-[#123A63] text-white text-xs font-semibold rounded hover:bg-[#0B2947] transition-colors cursor-pointer"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: ADMIN STUDENT PROFILE (PROGRESSIVE DISCLOSURE: HEADER, STATUS, 8 TABS)
          ========================================================================= */}
      {viewMode === 'student-profile' && activeStudent && activeStudentMetrics && (
        <div className="space-y-6">
          
          {/* Profile Header */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E7EC]">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#0B2947]">
                    {activeStudent.fullName}
                  </h1>
                  <span className="font-mono text-xs text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded border border-[#E4E7EC]">
                    {activeStudent.rollNumber}
                  </span>
                </div>
                <p className="text-xs text-[#667085] mt-1">
                  {activeStudent.degreeName} · {activeStudent.year} · {activeStudent.academicPeriod}
                </p>
              </div>

              {/* Quick Actions for this student */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedSessionId(activeStudent.scheduledSessions[0]?.id || '');
                    setShowCorrectionModal(true);
                  }}
                  className="px-3 py-1.5 bg-[#123A63] text-white text-xs font-semibold rounded hover:bg-[#0B2947] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 size={13} />
                  <span>Correct Attendance</span>
                </button>
              </div>
            </div>

            {/* Status Signals Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="p-3 bg-[#FAFAF8] rounded border border-[#E4E7EC]">
                <span className="text-[#667085] block text-[11px]">Attendance Status</span>
                <span className={`text-base font-bold block mt-0.5 ${
                  activeStudentMetrics.isDebarredRisk ? 'text-[#B42318]' : 'text-[#15803D]'
                }`}>
                  {activeStudentMetrics.attendancePercentage}% · {activeStudentMetrics.isDebarredRisk ? 'Below Reference (<80%)' : 'Good Standing'}
                </span>
                <span className="text-[11px] text-[#667085]">
                  {activeStudentMetrics.attendedSessions} of {activeStudentMetrics.eligibleSessions} sessions attended
                </span>
              </div>

              <div className="p-3 bg-[#FAFAF8] rounded border border-[#E4E7EC]">
                <span className="text-[#667085] block text-[11px]">Academic Progress</span>
                <span className="text-base font-bold text-[#1F2933] block mt-0.5">
                  GPA {activeStudent.gpa} · {activeStudent.academicStanding}
                </span>
                <span className="text-[11px] text-[#667085]">
                  {activeStudent.modules.length} active registered modules
                </span>
              </div>

              <div className="p-3 bg-[#FAFAF8] rounded border border-[#E4E7EC]">
                <span className="text-[#667085] block text-[11px]">Open Support Cases</span>
                <span className="text-base font-bold text-[#1F2933] block mt-0.5">
                  {activeStudent.supportCases.length} active ticket(s)
                </span>
                <span className="text-[11px] text-[#667085]">
                  Guardian: {activeStudent.guardianName} ({activeStudent.guardianPhone})
                </span>
              </div>
            </div>
          </div>

          {/* 8 Progressive Disclosure Tabs */}
          <div className="border-b border-[#E4E7EC] flex items-center gap-1 overflow-x-auto text-xs">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'attendance', label: 'Attendance' },
              { id: 'academics', label: 'Academics' },
              { id: 'assessments', label: 'Assessments' },
              { id: 'schedule', label: 'Schedule' },
              { id: 'services', label: `Student Services (${activeStudent.supportCases.length})` },
              { id: 'communication', label: 'Communication' },
              { id: 'audit', label: 'Audit History' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveProfileTab(t.id as StudentProfileTab)}
                className={`px-3.5 py-2 font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  activeProfileTab === t.id
                    ? 'border-[#123A63] text-[#123A63]'
                    : 'border-transparent text-[#667085] hover:text-[#1F2933]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW ("What's happening with this student?") */}
          {activeProfileTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E4E7EC] rounded-lg p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2947]">
                  What is happening with this student?
                </h3>

                <div className="text-xs text-[#1F2933] leading-relaxed space-y-2">
                  <p>
                    <strong>Summary:</strong> {activeStudent.fullName} is currently registered in{' '}
                    {activeStudent.year} of {activeStudent.degreeName}. Overall cumulative attendance is{' '}
                    <strong>{activeStudentMetrics.attendancePercentage}%</strong> across {activeStudentMetrics.eligibleSessions} conducted sessions.
                  </p>
                  {activeStudentMetrics.isDebarredRisk ? (
                    <div className="p-3 bg-[#FEE4E2] border border-[#FECDCA] rounded text-[#B42318]">
                      <strong>Debarment Alert:</strong> Attendance is currently {Math.round((80.0 - activeStudentMetrics.attendancePercentage) * 10) / 10}% below the mandatory London Met / Islington 80.0% examination hall ticket threshold. An academic intervention agreement with guardian {activeStudent.guardianName} ({activeStudent.guardianPhone}) is pending review.
                    </div>
                  ) : activeStudentMetrics.isAAAScholarshipContender ? (
                    <div className="p-3 bg-[#ECFDF3] border border-[#A6F4C5] rounded text-[#15803D]">
                      <strong>AAA Scholarship Track:</strong> Student maintains &gt;=95.0% attendance with distinction level coursework. Qualified for Islington College Academic, Attitude & Attendance honors.
                    </div>
                  ) : (
                    <div className="p-3 bg-[#F2F4F7] border border-[#E4E7EC] rounded text-[#1F2933]">
                      <strong>Normal Academic Standing:</strong> Student is on track for examination clearance with satisfactory coursework submission rates.
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#E4E7EC] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#667085] block font-medium">Primary Contact</span>
                    <span className="text-[#1F2933]">{activeStudent.email}</span>
                    <span className="text-[#667085] block font-mono mt-0.5">{activeStudent.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#667085] block font-medium">Guardian Contact</span>
                    <span className="text-[#1F2933]">{activeStudent.guardianName} ({activeStudent.guardianRelation})</span>
                    <span className="text-[#667085] block font-mono mt-0.5">{activeStudent.guardianPhone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE (Detailed session records & live correction) */}
          {activeProfileTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#667085]">
                  Detailed session attendance records for {activeStudent.fullName}
                </div>
                <button
                  onClick={() => {
                    setSelectedSessionId(activeStudent.scheduledSessions[0]?.id || '');
                    setShowCorrectionModal(true);
                  }}
                  className="px-3 py-1 bg-[#123A63] text-white text-xs font-semibold rounded hover:bg-[#0B2947] cursor-pointer"
                >
                  + Correct Session Attendance
                </button>
              </div>

              <div className="bg-white border border-[#E4E7EC] rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1F2933]">
                  <thead className="bg-[#FAFAF8] text-[#667085] font-semibold uppercase text-[10px] border-b border-[#E4E7EC]">
                    <tr>
                      <th className="px-4 py-2.5">Date & Time</th>
                      <th className="px-4 py-2.5">Module</th>
                      <th className="px-4 py-2.5">Type & Venue</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Source / Reason</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC]">
                    {activeStudent.scheduledSessions.map((sess) => {
                      const record = activeStudent.attendanceRecords[sess.id];
                      const status = record?.status || 'ABSENT';
                      return (
                        <tr key={sess.id} className="hover:bg-[#F2F4F7]/40">
                          <td className="px-4 py-2.5 font-mono text-[11px]">
                            {sess.date} · {sess.startTime} - {sess.endTime}
                          </td>
                          <td className="px-4 py-2.5 font-medium">
                            {sess.moduleCode} — {sess.moduleName}
                          </td>
                          <td className="px-4 py-2.5 text-[#667085]">
                            {sess.sessionType} · {sess.location}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              status === 'PRESENT'
                                ? 'bg-[#ECFDF3] text-[#15803D]'
                                : status === 'AUTHORISED_ABSENCE'
                                ? 'bg-[#EFF8FF] text-[#175CD3]'
                                : 'bg-[#FEE4E2] text-[#B42318]'
                            }`}>
                              {status}
                            </span>
                            {record?.isCorrected && (
                              <span className="ml-1 text-[9px] text-[#B45309] font-medium">
                                (Corrected)
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-[#667085] max-w-[200px] truncate">
                            {record?.reason || 'Routine attendance register'}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedSessionId(sess.id);
                                setNewStatus(status === 'PRESENT' ? 'AUTHORISED_ABSENCE' : 'PRESENT');
                                setShowCorrectionModal(true);
                              }}
                              className="text-xs font-semibold text-[#123A63] hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ACADEMICS */}
          {activeProfileTab === 'academics' && (
            <div className="bg-white border border-[#E4E7EC] rounded-lg divide-y divide-[#E4E7EC]">
              {activeStudent.modules.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-[#1F2933]">
                      {m.code} — {m.name}
                    </div>
                    <div className="text-[11px] text-[#667085] mt-0.5">
                      Credits: {m.credits} · Leader: {m.moduleLeader} · Term: {m.term}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#1F2933]">
                      {m.currentMark}%
                    </span>
                    <div className="text-[11px] text-[#667085]">{m.currentGrade}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: ASSESSMENTS */}
          {activeProfileTab === 'assessments' && (
            <div className="bg-white border border-[#E4E7EC] rounded-lg divide-y divide-[#E4E7EC]">
              {activeStudent.modules.flatMap(m => m.assessments.map(a => ({ ...a, moduleCode: m.code }))).map((ass) => (
                <div key={ass.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-[#1F2933]">
                      {ass.title}
                    </div>
                    <div className="text-[11px] text-[#667085] mt-0.5">
                      {ass.moduleCode} · {ass.type} · Weight: {ass.weightPercentage}% · Due: {ass.dueDate}
                    </div>
                    {ass.feedback && (
                      <div className="text-[11px] text-[#123A63] italic mt-1 bg-[#F2F4F7] p-2 rounded">
                        Feedback: "{ass.feedback}"
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {ass.score !== undefined ? (
                      <span className="text-sm font-bold text-[#15803D]">
                        {ass.score} / {ass.maxScore}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[#667085] bg-[#F2F4F7] px-2 py-0.5 rounded">
                        {ass.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: SCHEDULE */}
          {activeProfileTab === 'schedule' && (
            <div className="bg-white border border-[#E4E7EC] rounded-lg divide-y divide-[#E4E7EC]">
              {activeStudent.scheduledSessions.map((sess) => (
                <div key={sess.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#0B2947] bg-[#F2F4F7] px-2 py-0.5 rounded mr-2">
                      {sess.date} {sess.startTime}
                    </span>
                    <span className="text-xs font-semibold text-[#1F2933]">
                      {sess.moduleName} ({sess.sessionType})
                    </span>
                  </div>
                  <div className="text-xs text-[#667085]">
                    {sess.location} · {sess.lecturer}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: STUDENT SERVICES (WITH CONFIDENTIAL STAFF NOTES) */}
          {activeProfileTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#667085]">
                  Support cases & confidential internal SSD case history
                </span>
                <button
                  onClick={() => setShowCreateCaseModal(true)}
                  className="px-3 py-1 bg-[#123A63] text-white text-xs font-semibold rounded hover:bg-[#0B2947] cursor-pointer"
                >
                  + New Case
                </button>
              </div>

              {activeStudent.supportCases.length === 0 ? (
                <div className="bg-white border border-[#E4E7EC] rounded-lg p-6 text-center text-xs text-[#667085]">
                  No support cases on file for this student.
                </div>
              ) : (
                activeStudent.supportCases.map((c) => (
                  <div key={c.id} className="bg-white border border-[#E4E7EC] rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
                      <div>
                        <span className="text-xs font-bold text-[#1F2933]">
                          Ticket #{c.ticketNumber} — {c.subject}
                        </span>
                        <div className="text-[11px] text-[#667085]">
                          Category: {c.category} · Priority: {c.priority}
                        </div>
                      </div>
                      <select
                        value={c.status}
                        onChange={(e) => updateCaseStatus(c.id, e.target.value as SupportCase['status'])}
                        className="text-xs font-bold bg-[#F2F4F7] border border-[#E4E7EC] rounded px-2 py-1"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="AWAITING_STAFF">AWAITING_STAFF</option>
                        <option value="AWAITING_STUDENT">AWAITING_STUDENT</option>
                        <option value="IN_REVIEW">IN_REVIEW</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>

                    <div className="text-xs text-[#1F2933] bg-[#FAFAF8] p-3 rounded border border-[#E4E7EC]">
                      {c.description}
                    </div>

                    {/* Message Thread */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[10px] font-bold uppercase text-[#667085]">Thread History</div>
                      {c.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2.5 rounded text-xs border ${
                            msg.isInternalStaffOnly
                              ? 'bg-[#FEF0C7]/40 border-[#FEDF89] text-[#B45309]'
                              : msg.senderRole === 'ADMIN'
                              ? 'bg-[#F2F4F7] border-[#E4E7EC] text-[#1F2933]'
                              : 'bg-white border-[#E4E7EC] text-[#1F2933]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-semibold pb-1 mb-1 border-b border-black/5">
                            <span className="flex items-center gap-1">
                              {msg.senderName} ({msg.senderRole})
                              {msg.isInternalStaffOnly && (
                                <span className="bg-[#B45309] text-white px-1 rounded text-[9px]">
                                  STAFF CONFIDENTIAL
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-[#667085]">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div>{msg.message}</div>
                        </div>
                      ))}
                    </div>

                    {/* Reply / Internal Note Input */}
                    <div className="pt-2 border-t border-[#E4E7EC] flex flex-col gap-2">
                      <textarea
                        value={caseStaffReply}
                        onChange={(e) => setCaseStaffReply(e.target.value)}
                        placeholder="Write official response to student or internal staff note..."
                        className="w-full text-xs p-2.5 border border-[#E4E7EC] rounded focus:outline-none focus:border-[#123A63]"
                        rows={2}
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs text-[#B45309] font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isConfidentialNote}
                            onChange={(e) => setIsConfidentialNote(e.target.checked)}
                          />
                          <span>Staff-Only Confidential Note (Hidden from student & parent)</span>
                        </label>
                        <button
                          onClick={() => handleSendCaseMessage(c.id)}
                          className="px-3 py-1 bg-[#123A63] text-white text-xs font-semibold rounded hover:bg-[#0B2947] cursor-pointer"
                        >
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 7: COMMUNICATION */}
          {activeProfileTab === 'communication' && (
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2947]">
                Institutional Communications & Notices Log
              </h3>
              <div className="divide-y divide-[#E4E7EC] text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#1F2933]">SMS Alert: Attendance Below 80% Threshold</div>
                    <div className="text-[#667085]">Dispatched to Guardian: {activeStudent.guardianPhone}</div>
                  </div>
                  <span className="font-mono text-[11px] text-[#667085]">Delivered</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#1F2933]">Email Notice: Autumn Term Exam Board Clearance Policy</div>
                    <div className="text-[#667085]">Dispatched to Student: {activeStudent.email}</div>
                  </div>
                  <span className="font-mono text-[11px] text-[#667085]">Opened</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: AUDIT (IMMUTABLE RECORD) */}
          {activeProfileTab === 'audit' && (
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2947]">
                Immutable Compliance Audit Trail
              </h3>
              <p className="text-xs text-[#667085]">
                Log of all manual attendance adjustments, reason justifications, and staff actors.
              </p>

              <div className="space-y-2 mt-3">
                {(Object.values(activeStudent.attendanceRecords) as AttendanceRecord[])
                  .flatMap((rec) => rec.auditTrail || [])
                  .map((entry) => (
                    <div key={entry.id} className="p-3 bg-[#FAFAF8] border border-[#E4E7EC] rounded text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-[#123A63]">{entry.actorName} ({entry.actorRole})</span>
                        <span className="text-[10px] font-mono text-[#667085]">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-[#1F2933]">
                        Changed status: <strong>{entry.previousStatus}</strong> → <strong>{entry.newStatus}</strong>
                      </div>
                      <div className="text-[#667085] italic">
                        Justification: "{entry.justificationReason}"
                      </div>
                    </div>
                  ))}
                {(Object.values(activeStudent.attendanceRecords) as AttendanceRecord[]).every((r) => !r.auditTrail?.length) && (
                  <div className="text-center py-6 text-xs text-[#667085]">
                    No manual corrections logged yet for this student.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          MODALS: ATTENDANCE CORRECTION, CREATE CASE, SCHEDULE, NOTICE
          ========================================================================= */}
      
      {/* Attendance Correction Modal */}
      {showCorrectionModal && activeStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E4E7EC] max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
              <h3 className="font-bold text-sm text-[#0B2947]">
                Attendance Correction Override
              </h3>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="text-[#667085] hover:text-[#1F2933]"
              >
                <X size={16} />
              </button>
            </div>

            {correctionSuccessMsg ? (
              <div className="p-3 bg-[#ECFDF3] border border-[#A6F4C5] rounded text-xs text-[#15803D] font-medium text-center">
                {correctionSuccessMsg}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#1F2933] mb-1">Student</label>
                  <div className="text-xs text-[#667085] bg-[#F2F4F7] p-2 rounded">
                    {activeStudent.fullName} ({activeStudent.rollNumber})
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#1F2933] mb-1">Session</label>
                  <select
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="w-full p-2 border border-[#E4E7EC] rounded bg-white"
                  >
                    {activeStudent.scheduledSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.date} ({s.startTime}) - {s.moduleName} [{s.sessionType}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1F2933] mb-1">New Attendance Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)}
                    className="w-full p-2 border border-[#E4E7EC] rounded bg-white font-semibold"
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="AUTHORISED_ABSENCE">AUTHORISED_ABSENCE (Excused / Medical)</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="LATE">LATE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1F2933] mb-1">
                    Regulatory Justification Reason <span className="text-[#C62828]">*</span>
                  </label>
                  <textarea
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="e.g. Verified hospital discharge slip #88192 from Norvic Hospital approved by SSD Committee."
                    rows={3}
                    className="w-full p-2 border border-[#E4E7EC] rounded focus:outline-none focus:border-[#123A63]"
                  />
                  <span className="text-[10px] text-[#667085]">
                    Mandatory for academic board audit compliance.
                  </span>
                </div>

                <div className="pt-3 border-t border-[#E4E7EC] flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowCorrectionModal(false)}
                    className="px-3 py-1.5 border border-[#E4E7EC] text-xs font-semibold rounded hover:bg-[#F2F4F7]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCorrection}
                    disabled={!correctionReason.trim()}
                    className="px-3.5 py-1.5 bg-[#123A63] text-white text-xs font-semibold rounded hover:bg-[#0B2947] disabled:opacity-50 cursor-pointer"
                  >
                    Save & Log to Audit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Case Modal */}
      {showCreateCaseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E4E7EC] max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
              <h3 className="font-bold text-sm text-[#0B2947]">Create Student Support Case</h3>
              <button onClick={() => setShowCreateCaseModal(false)} className="text-[#667085] hover:text-[#1F2933]">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Student</label>
                <select
                  value={newCaseStudentId}
                  onChange={(e) => setNewCaseStudentId(e.target.value)}
                  className="w-full p-2 border border-[#E4E7EC] rounded bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={newCaseCategory}
                  onChange={(e) => setNewCaseCategory(e.target.value as SupportCase['category'])}
                  className="w-full p-2 border border-[#E4E7EC] rounded bg-white"
                >
                  <option value="Attendance Appeal & Medical Waiver">Attendance Appeal & Medical Waiver</option>
                  <option value="Academic Support & Tutoring">Academic Support & Tutoring</option>
                  <option value="Counseling & Mental Wellbeing">Counseling & Mental Wellbeing</option>
                  <option value="Fee & Financial Advisory">Fee & Financial Advisory</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  value={newCaseSubject}
                  onChange={(e) => setNewCaseSubject(e.target.value)}
                  placeholder="e.g. Medical waiver submission for Norvic Hospital admission"
                  className="w-full p-2 border border-[#E4E7EC] rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  value={newCaseDescription}
                  onChange={(e) => setNewCaseDescription(e.target.value)}
                  placeholder="Detailed case background..."
                  rows={3}
                  className="w-full p-2 border border-[#E4E7EC] rounded"
                />
              </div>
              <div className="pt-2 border-t border-[#E4E7EC] flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateCaseModal(false)}
                  className="px-3 py-1.5 border border-[#E4E7EC] rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newCaseSubject.trim() || !newCaseDescription.trim()) return;
                    createSupportCase(newCaseStudentId, newCaseCategory, newCaseSubject, newCaseDescription);
                    setShowCreateCaseModal(false);
                    setNewCaseSubject('');
                    setNewCaseDescription('');
                  }}
                  className="px-3.5 py-1.5 bg-[#123A63] text-white rounded font-semibold cursor-pointer"
                >
                  Log Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E4E7EC] max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
              <h3 className="font-bold text-sm text-[#0B2947]">Schedule Advisory Appointment</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-[#667085] hover:text-[#1F2933]">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Student</label>
                <select
                  value={aptStudentId}
                  onChange={(e) => setAptStudentId(e.target.value)}
                  className="w-full p-2 border border-[#E4E7EC] rounded bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Type</label>
                <select
                  value={aptType}
                  onChange={(e) => setAptType(e.target.value as Appointment['appointmentType'])}
                  className="w-full p-2 border border-[#E4E7EC] rounded bg-white"
                >
                  <option value="Attendance Hearing">Attendance Hearing</option>
                  <option value="Academic Advisory">Academic Advisory</option>
                  <option value="Disciplinary Review">Disciplinary Review</option>
                  <option value="Counseling">Counseling</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full p-2 border border-[#E4E7EC] rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Time</label>
                  <input
                    type="text"
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    className="w-full p-2 border border-[#E4E7EC] rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Notes / Agenda</label>
                <textarea
                  value={aptNotes}
                  onChange={(e) => setAptNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-[#E4E7EC] rounded"
                />
              </div>
              <div className="pt-2 border-t border-[#E4E7EC] flex justify-end gap-2">
                <button onClick={() => setShowScheduleModal(false)} className="px-3 py-1.5 border border-[#E4E7EC] rounded">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    scheduleAppointment(
                      aptStudentId,
                      aptType,
                      aptDate,
                      aptTime,
                      'Deepak Adhikari (SSD Lead)',
                      'SSD Office Room 102',
                      aptNotes
                    );
                    setShowScheduleModal(false);
                    setAptNotes('');
                  }}
                  className="px-3.5 py-1.5 bg-[#123A63] text-white rounded font-semibold cursor-pointer"
                >
                  Confirm Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E4E7EC] max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
              <h3 className="font-bold text-sm text-[#0B2947]">Publish Institutional Notice</h3>
              <button onClick={() => setShowNoticeModal(false)} className="text-[#667085] hover:text-[#1F2933]">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Audience</label>
                <select
                  value={noticeAudience}
                  onChange={(e) => setNoticeAudience(e.target.value as 'ALL' | 'STUDENTS' | 'PARENTS')}
                  className="w-full p-2 border border-[#E4E7EC] rounded bg-white"
                >
                  <option value="ALL">All (Students & Parents)</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="PARENTS">Parents Only</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Notice Title</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Spring Carnival 2026 Schedule & Guidelines"
                  className="w-full p-2 border border-[#E4E7EC] rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Summary / Body</label>
                <textarea
                  value={noticeSummary}
                  onChange={(e) => setNoticeSummary(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-[#E4E7EC] rounded"
                />
              </div>
              <div className="pt-2 border-t border-[#E4E7EC] flex justify-end gap-2">
                <button onClick={() => setShowNoticeModal(false)} className="px-3 py-1.5 border border-[#E4E7EC] rounded">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!noticeTitle.trim() || !noticeSummary.trim()) return;
                    createNotice(noticeTitle, 'Campus Life', noticeSummary, noticeSummary, noticeAudience, 'NORMAL');
                    setShowNoticeModal(false);
                    setNoticeTitle('');
                    setNoticeSummary('');
                  }}
                  className="px-3.5 py-1.5 bg-[#123A63] text-white rounded font-semibold cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
