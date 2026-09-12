import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  Check,
  Search,
  X,
  ArrowUpDown,
  Plus,
  Pencil,
  Trash2,
  Hash,
  Layers,
  Clock,
  Users,
  Percent,
} from 'lucide-react';
import {
  IT_DEGREES,
  ITDegree,
} from '../data/attendanceData';
import {
  StudentRecord,
  generateInitialStudents,
  DEGREE_SECTIONS,
} from '../data/routineData';

interface StudentsManagerProps {
  activeDegreeId: string;
  activeYear: 'Year 1' | 'Year 2' | 'Year 3';
  onSelectActiveDegreeYear: (degreeId: string, year: 'Year 1' | 'Year 2' | 'Year 3') => void;
  onSwitchSubView?: (view: 'courses' | 'students' | 'excel') => void;
}

export const StudentsManager: React.FC<StudentsManagerProps> = ({
  activeDegreeId,
  activeYear,
  onSelectActiveDegreeYear,
  onSwitchSubView,
}) => {
  const [selectedDegreeId, setSelectedDegreeId] = useState<string>(activeDegreeId || 'multimedia');
  const [selectedYear, setSelectedYear] = useState<'Year 1' | 'Year 2' | 'Year 3'>(activeYear || 'Year 1');
  const [isDegreeDropdownOpen, setIsDegreeDropdownOpen] = useState(false);
  const degreeDropdownRef = useRef<HTMLDivElement>(null);

  // Sync with prop changes
  useEffect(() => {
    if (activeDegreeId) setSelectedDegreeId(activeDegreeId);
    if (activeYear) setSelectedYear(activeYear);
  }, [activeDegreeId, activeYear]);

  // Click outside for degree dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        degreeDropdownRef.current &&
        !degreeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDegreeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDegree: ITDegree =
    IT_DEGREES.find((d) => d.id === selectedDegreeId) || IT_DEGREES[0];

  // Students state persisted in localStorage
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('attendease_students_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return generateInitialStudents();
  });

  useEffect(() => {
    localStorage.setItem('attendease_students_v1', JSON.stringify(students));
  }, [students]);

  // Section & Student filtering
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'Good' | 'Warning' | 'Critical'>('all');
  const [studentSortKey, setStudentSortKey] = useState<'rollNo' | 'name' | 'section' | 'attended' | 'rate' | 'status'>('section');
  const [studentSortOrder, setStudentSortOrder] = useState<'asc' | 'desc'>('asc');

  // Reset section filter when degree or year changes
  useEffect(() => {
    setSelectedSectionFilter('all');
  }, [selectedDegreeId, selectedYear]);

  // Available sections for current degree and year (5 sections)
  const availableSections = DEGREE_SECTIONS[selectedDegreeId]?.[selectedYear] || [];

  const yearStudents = useMemo(() => {
    return students.filter(
      (s) => s.degreeId === selectedDegreeId && s.year === selectedYear
    );
  }, [students, selectedDegreeId, selectedYear]);

  const filteredAndSortedStudents = useMemo(() => {
    let list = yearStudents;

    if (selectedSectionFilter !== 'all') {
      list = list.filter(
        (s) => s.section.toLowerCase() === selectedSectionFilter.toLowerCase()
      );
    }

    if (studentStatusFilter !== 'all') {
      list = list.filter((s) => s.status === studentStatusFilter);
    }

    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.section.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      let comp = 0;
      if (studentSortKey === 'rollNo') comp = a.rollNo.localeCompare(b.rollNo);
      else if (studentSortKey === 'name') comp = a.name.localeCompare(b.name);
      else if (studentSortKey === 'section') comp = a.section.localeCompare(b.section);
      else if (studentSortKey === 'attended') comp = a.attendedSessions - b.attendedSessions;
      else if (studentSortKey === 'rate') comp = a.attendanceRate - b.attendanceRate;
      else if (studentSortKey === 'status') comp = a.status.localeCompare(b.status);
      return studentSortOrder === 'asc' ? comp : -comp;
    });
  }, [yearStudents, selectedSectionFilter, studentStatusFilter, studentSearch, studentSortKey, studentSortOrder]);

  const handleToggleStudentSort = (
    key: 'rollNo' | 'name' | 'section' | 'attended' | 'rate' | 'status'
  ) => {
    if (studentSortKey === key) {
      setStudentSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setStudentSortKey(key);
      setStudentSortOrder('asc');
    }
  };

  const getSectionBadgeStyle = (sec: string) => {
    const clean = sec.trim().toUpperCase();
    if (clean.includes('7')) {
      return 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold';
    }
    if (clean.endsWith('1') || clean.endsWith('6') || clean.endsWith('11')) {
      return 'bg-blue-50 text-blue-900 border-blue-200 font-bold';
    }
    if (clean.endsWith('2') || clean.endsWith('12')) {
      return 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold';
    }
    if (clean.endsWith('3') || clean.endsWith('8') || clean.endsWith('13')) {
      return 'bg-purple-50 text-purple-900 border-purple-200 font-bold';
    }
    if (clean.endsWith('4') || clean.endsWith('9') || clean.endsWith('14')) {
      return 'bg-amber-50 text-amber-900 border-amber-200 font-bold';
    }
    return 'bg-rose-50 text-rose-900 border-rose-200 font-bold';
  };

  // Student Edit / Add Modal state & handlers
  const [isOpenStudentModal, setIsOpenStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentFormName, setStudentFormName] = useState('');
  const [studentFormRollNo, setStudentFormRollNo] = useState('');
  const [studentFormSection, setStudentFormSection] = useState('');
  const [studentFormAttended, setStudentFormAttended] = useState<number>(33);
  const [studentFormTotal, setStudentFormTotal] = useState<number>(35);
  const [isConfirmingDeleteStudent, setIsConfirmingDeleteStudent] = useState(false);

  const handleOpenAddStudent = () => {
    setEditingStudentId(null);
    setStudentFormName('');
    const defaultSec = availableSections[0] || 'AI1';
    setStudentFormSection(defaultSec);
    const count = yearStudents.length + 1;
    const degCode =
      selectedDegreeId === 'ai'
        ? 'CS4S'
        : selectedDegreeId === 'computing'
        ? 'CS4C'
        : selectedDegreeId === 'networking'
        ? 'CS4N'
        : 'CS4M';
    const yrCode = selectedYear === 'Year 1' ? '25' : selectedYear === 'Year 2' ? '24' : '23';
    setStudentFormRollNo(`NP03${degCode}${yrCode}${String(count).padStart(3, '0')}`);
    setStudentFormAttended(33);
    setStudentFormTotal(35);
    setIsConfirmingDeleteStudent(false);
    setIsOpenStudentModal(true);
  };

  const handleOpenEditStudent = (st: StudentRecord) => {
    setEditingStudentId(st.id);
    setStudentFormName(st.name);
    setStudentFormRollNo(st.rollNo);
    setStudentFormSection(st.section);
    setStudentFormAttended(st.attendedSessions);
    setStudentFormTotal(st.totalSessions);
    setIsConfirmingDeleteStudent(false);
    setIsOpenStudentModal(true);
  };

  const handleCloseStudentModal = () => {
    setIsOpenStudentModal(false);
    setEditingStudentId(null);
    setIsConfirmingDeleteStudent(false);
  };

  const handleSubmitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Math.max(1, studentFormTotal);
    const attended = Math.min(total, Math.max(0, studentFormAttended));
    const rate = Number(((attended / total) * 100).toFixed(1));
    const status: 'Good' | 'Warning' | 'Critical' =
      rate >= 85 ? 'Good' : rate >= 75 ? 'Warning' : 'Critical';

    if (editingStudentId) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudentId
            ? {
                ...s,
                name: studentFormName.trim() || s.name,
                rollNo: studentFormRollNo.trim() || s.rollNo,
                section: studentFormSection,
                attendedSessions: attended,
                totalSessions: total,
                missedSessions: total - attended,
                attendanceRate: rate,
                status,
              }
            : s
        )
      );
    } else {
      const newStudent: StudentRecord = {
        id: studentFormRollNo.trim() || `NP03-${Date.now()}`,
        name: studentFormName.trim() || 'New Student',
        rollNo: studentFormRollNo.trim() || `NP03-${Date.now()}`,
        degreeId: selectedDegreeId,
        year: selectedYear,
        section: studentFormSection,
        attendedSessions: attended,
        totalSessions: total,
        missedSessions: total - attended,
        attendanceRate: rate,
        status,
      };
      setStudents((prev) => [newStudent, ...prev]);
    }
    handleCloseStudentModal();
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    handleCloseStudentModal();
  };

  return (
    <div className="flex-1 p-5 sm:p-7 overflow-y-auto bg-white flex flex-col gap-6">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Admin
          </h1>
          {onSwitchSubView && (
            <div className="flex items-center p-1 bg-neutral-100 rounded-xl">
              <button
                type="button"
                id="students-switch-courses"
                onClick={() => onSwitchSubView('courses')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                Courses
              </button>
              <button
                type="button"
                id="students-switch-students"
                onClick={() => onSwitchSubView('students')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-neutral-900 shadow-xs cursor-pointer"
              >
                Students
              </button>
              <button
                type="button"
                id="students-switch-excel"
                onClick={() => onSwitchSubView('excel')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                Excel
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="admin-add-student-btn"
            onClick={handleOpenAddStudent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0c3830] text-white hover:bg-[#092923] text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </header>

      {/* Degree & Year Controls */}
      <section className="flex flex-wrap items-center gap-3">
        {/* Degree Dropdown */}
        <div className="relative" ref={degreeDropdownRef}>
          <button
            type="button"
            id="students-degree-dropdown-trigger"
            onClick={() => setIsDegreeDropdownOpen(!isDegreeDropdownOpen)}
            className="h-14 px-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-all flex items-center justify-between gap-3 text-left shadow-xs cursor-pointer min-w-[260px]"
          >
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-neutral-600 tracking-wider">
                Degree Programme
              </span>
              <span className="text-sm font-bold text-neutral-900 truncate">
                {selectedDegree.name}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-neutral-400 transition-transform duration-200 ${
                isDegreeDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDegreeDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-1.5">
              {IT_DEGREES.map((deg) => {
                const isSelected = deg.id === selectedDegreeId;
                return (
                  <button
                    key={deg.id}
                    type="button"
                    onClick={() => {
                      setSelectedDegreeId(deg.id);
                      setIsDegreeDropdownOpen(false);
                      onSelectActiveDegreeYear(deg.id, selectedYear);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-100 text-neutral-900 font-bold'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{deg.name}</div>
                      <div className="text-[11px] text-neutral-600 font-medium mt-0.5">
                        {deg.award}
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-[#0c3830]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Year Tabs */}
        <div className="h-14 flex items-stretch p-1 bg-white rounded-xl border border-neutral-200 shadow-xs">
          {(['Year 1', 'Year 2', 'Year 3'] as const).map((yr) => {
            const isYrSelected = yr === selectedYear;
            return (
              <button
                key={yr}
                id={`students-year-${yr.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => {
                  setSelectedYear(yr);
                  onSelectActiveDegreeYear(selectedDegreeId, yr);
                }}
                className={`h-full px-4 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                  isYrSelected
                    ? 'bg-[#0c3830] text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <span>{yr}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Students Table Section */}
      <section className="space-y-3">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              id="students-filter-sec-all"
              onClick={() => setSelectedSectionFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 ${
                selectedSectionFilter === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
              }`}
            >
              <span>All Sections</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  selectedSectionFilter === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-neutral-600 border border-neutral-200'
                }`}
              >
                {yearStudents.length}
              </span>
            </button>

            {availableSections.map((sec) => {
              const secCount = yearStudents.filter((s) => s.section === sec).length;
              const isSelected = selectedSectionFilter === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  id={`students-filter-sec-${sec.toLowerCase()}`}
                  onClick={() => setSelectedSectionFilter(sec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? 'bg-[#0c3830] text-white border-[#0c3830] shadow-xs'
                      : `${getSectionBadgeStyle(sec)} hover:brightness-95`
                  }`}
                >
                  <span>{sec}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white/80 text-neutral-800'
                    }`}
                  >
                    {secCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Utility Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            {/* Search */}
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-2.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, College ID, section..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="h-8 pl-7 pr-7 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-36 sm:w-48 focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
              />
              {studentSearch && (
                <button
                  onClick={() => setStudentSearch('')}
                  className="absolute right-2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={studentStatusFilter}
              onChange={(e) => setStudentStatusFilter(e.target.value as any)}
              className="h-8 px-2 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0c3830] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Good">Good (≥85%)</option>
              <option value="Warning">Warning (75-84%)</option>
              <option value="Critical">Critical (&lt;75%)</option>
            </select>

            {/* Cycle Sort */}
            <button
              type="button"
              title={`Sorted by ${studentSortKey === 'rollNo' ? 'College ID' : studentSortKey} (${studentSortOrder})`}
              onClick={() => {
                if (studentSortKey === 'section') setStudentSortKey('name');
                else if (studentSortKey === 'name') setStudentSortKey('rollNo');
                else if (studentSortKey === 'rollNo') setStudentSortKey('rate');
                else if (studentSortKey === 'rate') setStudentSortKey('attended');
                else setStudentSortKey('section');
              }}
              className="h-8 px-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowUpDown size={13} />
              <span className="capitalize">{studentSortKey === 'rollNo' ? 'College ID' : studentSortKey}</span>
            </button>

            {/* Add Student Button */}
            <button
              type="button"
              id="students-toolbar-add-btn"
              onClick={handleOpenAddStudent}
              className="h-8 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-xs cursor-pointer ml-1"
            >
              <span>Add</span>
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-700 font-semibold select-none">
                  <th
                    onClick={() => handleToggleStudentSort('rollNo')}
                    className="px-4 py-2.5 border-r border-neutral-200 w-36 cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <Hash size={13} className="text-neutral-400 shrink-0" />
                      <span>College ID</span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleToggleStudentSort('name')}
                    className="px-4 py-2.5 border-r border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <Users size={13} className="text-neutral-400 shrink-0" />
                      <span>Student Name</span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleToggleStudentSort('section')}
                    className="px-4 py-2.5 border-r border-neutral-200 w-28 cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <Layers size={13} className="text-neutral-400 shrink-0" />
                      <span>Section</span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleToggleStudentSort('attended')}
                    className="px-4 py-2.5 border-r border-neutral-200 w-36 cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <Clock size={13} className="text-neutral-400 shrink-0" />
                      <span>Classes</span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleToggleStudentSort('rate')}
                    className="px-4 py-2.5 border-r border-neutral-200 w-36 cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <Percent size={13} className="text-neutral-400 shrink-0" />
                      <span>Attendance</span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleToggleStudentSort('status')}
                    className="px-4 py-2.5 border-r border-neutral-200 w-28 cursor-pointer hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="px-4 py-2.5 w-24 text-right">
                    <span>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-neutral-400 font-medium">
                      No students found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedStudents.map((st) => {
                    return (
                      <tr
                        key={st.id}
                        className="border-b border-neutral-100 hover:bg-neutral-50/60 transition-colors group"
                      >
                        <td className="px-4 py-3 border-r border-neutral-100 font-mono text-[11px] text-neutral-600 font-medium">
                          {st.rollNo}
                        </td>
                        <td className="px-4 py-3 border-r border-neutral-100">
                          <span className="font-semibold text-neutral-900 text-xs">
                            {st.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-r border-neutral-100">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${getSectionBadgeStyle(
                              st.section
                            )}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                            <span>{st.section}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 border-r border-neutral-100 text-neutral-700 font-medium">
                          <span>{st.attendedSessions}</span>
                          <span className="text-neutral-400 mx-1">/</span>
                          <span className="text-neutral-500">{st.totalSessions}</span>
                        </td>
                        <td className="px-4 py-3 border-r border-neutral-100">
                          <div className="flex flex-col gap-1 w-28">
                            <span className="font-bold text-neutral-900 text-xs">
                              {st.attendanceRate}%
                            </span>
                            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  st.attendanceRate >= 85
                                    ? 'bg-emerald-600'
                                    : st.attendanceRate >= 75
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, st.attendanceRate)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-neutral-100">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              st.status === 'Good'
                                ? 'bg-emerald-50 text-emerald-800'
                                : st.status === 'Warning'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                st.status === 'Good'
                                  ? 'bg-emerald-500'
                                  : st.status === 'Warning'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span>{st.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              title="Edit Student & Section"
                              onClick={() => handleOpenEditStudent(st)}
                              className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              title="Delete Student"
                              onClick={() => handleDeleteStudent(st.id)}
                              className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Student Add/Edit Modal */}
      {isOpenStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#0c3830]" />
                <h3 className="font-bold text-neutral-900 text-base">
                  {editingStudentId ? 'Edit Student & Section' : 'Add Student'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseStudentModal}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitStudent} className="p-4 sm:p-5 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={studentFormName}
                    onChange={(e) => setStudentFormName(e.target.value)}
                    placeholder="e.g. Kenji Sato"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      College ID
                    </label>
                    <input
                      type="text"
                      required
                      value={studentFormRollNo}
                      onChange={(e) => setStudentFormRollNo(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Section
                    </label>
                    <select
                      value={studentFormSection}
                      onChange={(e) => setStudentFormSection(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#0c3830] bg-white text-neutral-800"
                    >
                      {availableSections.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Attended Classes
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={studentFormTotal}
                      value={studentFormAttended}
                      onChange={(e) => setStudentFormAttended(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Total Classes
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={studentFormTotal}
                      onChange={(e) => setStudentFormTotal(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                {editingStudentId ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isConfirmingDeleteStudent) {
                        setIsConfirmingDeleteStudent(true);
                      } else {
                        handleDeleteStudent(editingStudentId);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isConfirmingDeleteStudent
                        ? 'bg-rose-600 text-white border-rose-700'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <Trash2 size={13} />
                    <span>{isConfirmingDeleteStudent ? 'Confirm' : 'Delete'}</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseStudentModal}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#0c3830] text-white hover:bg-[#092923] transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
