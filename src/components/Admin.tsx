import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Check,
  ChevronDown,
  ArrowUpDown,
  ListFilter,
  Search,
  BookOpen,
  Calendar,
  MoreHorizontal,
  Hash,
  Layers,
  Clock,
} from 'lucide-react';
import {
  IT_DEGREES,
  ModuleAttendance,
  ITDegree,
} from '../data/attendanceData';

interface AdminProps {
  activeDegreeId: string;
  activeYear: 'Year 1' | 'Year 2' | 'Year 3';
  onSelectActiveDegreeYear: (degreeId: string, year: 'Year 1' | 'Year 2' | 'Year 3') => void;
  curricula: Record<string, Record<'Year 1' | 'Year 2' | 'Year 3', ModuleAttendance[]>>;
  onUpdateCourse: (
    degreeId: string,
    year: 'Year 1' | 'Year 2' | 'Year 3',
    module: ModuleAttendance
  ) => void;
  onAddCourse: (
    degreeId: string,
    year: 'Year 1' | 'Year 2' | 'Year 3',
    module: ModuleAttendance
  ) => void;
  onDeleteCourse: (
    degreeId: string,
    year: 'Year 1' | 'Year 2' | 'Year 3',
    moduleId: string
  ) => void;
  onResetCurricula: () => void;
  onSwitchSubView?: (view: 'courses' | 'students' | 'excel') => void;
}

export const Admin: React.FC<AdminProps> = ({
  activeDegreeId,
  activeYear,
  onSelectActiveDegreeYear,
  curricula,
  onUpdateCourse,
  onAddCourse,
  onDeleteCourse,
  onResetCurricula,
  onSwitchSubView,
}) => {
  const [selectedDegreeId, setSelectedDegreeId] = useState<string>(activeDegreeId || 'multimedia');
  const [selectedYear, setSelectedYear] = useState<'Year 1' | 'Year 2' | 'Year 3'>(
    activeYear || 'Year 1'
  );
  const [isDegreeDropdownOpen, setIsDegreeDropdownOpen] = useState(false);
  const degreeDropdownRef = useRef<HTMLDivElement>(null);

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

  const [isOpenForm, setIsOpenForm] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  // Form fields start empty with no prefill on add
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCredits, setFormCredits] = useState<string>('');
  const [formTotalClasses, setFormTotalClasses] = useState<string>('');
  const [formTerm, setFormTerm] = useState<'Year-Long' | 'Semester 1' | 'Semester 2'>('Year-Long');

  // Table view state (Notion / Airtable style)
  const [activeTableTab, setActiveTableTab] = useState<'all' | 'Semester 1' | 'Semester 2' | 'Year-Long'>('all');
  const [tableSearch, setTableSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [sortKey, setSortKey] = useState<'code' | 'name' | 'term' | 'credits' | 'classes' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const currentDegreeModules: ModuleAttendance[] =
    curricula[selectedDegreeId]?.[selectedYear] || [];

  const filteredAndSortedModules = currentDegreeModules
    .filter((mod) => {
      if (activeTableTab !== 'all' && mod.term !== activeTableTab) return false;
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        return (
          mod.name.toLowerCase().includes(q) ||
          mod.code.toLowerCase().includes(q) ||
          mod.term.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      if (sortKey === 'code') {
        return sortOrder === 'asc'
          ? a.code.localeCompare(b.code)
          : b.code.localeCompare(a.code);
      }
      if (sortKey === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortKey === 'term') {
        return sortOrder === 'asc'
          ? a.term.localeCompare(b.term)
          : b.term.localeCompare(a.term);
      }
      if (sortKey === 'credits') {
        return sortOrder === 'asc' ? a.credits - b.credits : b.credits - a.credits;
      }
      if (sortKey === 'classes') {
        return sortOrder === 'asc' ? a.totalSessions - b.totalSessions : b.totalSessions - a.totalSessions;
      }
      return 0;
    });

  const handleToggleSortColumn = (key: 'code' | 'name' | 'term' | 'credits' | 'classes') => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleCycleSort = () => {
    if (!sortKey) {
      setSortKey('name');
      setSortOrder('asc');
    } else if (sortKey === 'name' && sortOrder === 'asc') {
      setSortOrder('desc');
    } else if (sortKey === 'name' && sortOrder === 'desc') {
      setSortKey('code');
      setSortOrder('asc');
    } else if (sortKey === 'code' && sortOrder === 'asc') {
      setSortKey('term');
      setSortOrder('asc');
    } else if (sortKey === 'term' && sortOrder === 'asc') {
      setSortKey('credits');
      setSortOrder('desc');
    } else if (sortKey === 'credits' && sortOrder === 'desc') {
      setSortKey('classes');
      setSortOrder('desc');
    } else {
      setSortKey(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingModuleId(null);
    setFormName('');
    setFormCode('');
    setFormCredits('');
    setFormTotalClasses('');
    setFormTerm('Year-Long');
    setIsConfirmingDelete(false);
    setIsOpenForm(true);
  };

  const handleOpenEdit = (mod: ModuleAttendance) => {
    setEditingModuleId(mod.id);
    setFormName(mod.name);
    setFormCode(mod.code);
    setFormCredits(String(mod.credits));
    setFormTotalClasses(String(mod.totalSessions));
    setFormTerm(mod.term);
    setIsConfirmingDelete(false);
    setIsOpenForm(true);
  };

  const handleCloseForm = () => {
    setIsOpenForm(false);
    setEditingModuleId(null);
    setIsConfirmingDelete(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const creditsNum = Number(formCredits) || 0;
    const existingMod = editingModuleId
      ? currentDegreeModules.find((m) => m.id === editingModuleId)
      : null;
    const totalSessionsNum = formTotalClasses !== '' ? (Number(formTotalClasses) || 0) : (existingMod?.totalSessions ?? 24);

    const mod: ModuleAttendance = {
      id: editingModuleId || `MOD-${Date.now()}`,
      code: formCode.trim() || `MOD${Date.now().toString().slice(-4)}`,
      name: formName.trim() || 'Course',
      term: formTerm,
      credits: creditsNum,
      creditWeight: Number(((creditsNum / 120) * 100).toFixed(1)),
      totalSessions: totalSessionsNum,
      attendedSessions: existingMod ? Math.min(existingMod.attendedSessions, totalSessionsNum) : totalSessionsNum,
      missedSessions: existingMod?.missedSessions ?? 0,
      lectureRate: existingMod?.lectureRate ?? 100,
      tutorialRate: existingMod?.tutorialRate ?? 100,
      workshopRate: existingMod?.workshopRate ?? 100,
      year: selectedYear,
      degreeId: selectedDegreeId,
    };

    if (editingModuleId) {
      onUpdateCourse(selectedDegreeId, selectedYear, mod);
    } else {
      onAddCourse(selectedDegreeId, selectedYear, mod);
    }
    handleCloseForm();
  };

  const isCurrentActive =
    selectedDegreeId === activeDegreeId && selectedYear === activeYear;

  const currentDegree =
    IT_DEGREES.find((d) => d.id === selectedDegreeId) || IT_DEGREES[0];

  const totalYearCredits = currentDegreeModules.reduce(
    (acc, m) => acc + (Number(m.credits) || 0),
    0
  );

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
                id="admin-switch-courses"
                onClick={() => onSwitchSubView('courses')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-neutral-900 shadow-xs cursor-pointer"
              >
                Courses
              </button>
              <button
                type="button"
                id="admin-switch-students"
                onClick={() => onSwitchSubView('students')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                Students
              </button>
              <button
                type="button"
                id="admin-switch-excel"
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
            id="admin-add-course-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0c3830] text-white hover:bg-[#092923] text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={16} />
            <span>Add Course</span>
          </button>

          <button
            id="admin-reset-btn"
            onClick={onResetCurricula}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-sm font-medium transition-colors cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* Degree & Year Controls */}
      <section className="flex flex-wrap items-center gap-3">
        {/* Degree Dropdown */}
        <div className="relative" ref={degreeDropdownRef}>
          <button
            id="admin-degree-dropdown-btn"
            onClick={() => setIsDegreeDropdownOpen(!isDegreeDropdownOpen)}
            className="h-14 flex items-center justify-between gap-4 px-4 bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl text-left shadow-xs transition-all cursor-pointer min-w-[260px] sm:min-w-[300px]"
          >
            <div className="flex flex-col justify-center min-w-0 pr-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 leading-tight">
                Degree
              </span>
              <span className="text-sm font-bold text-neutral-900 truncate leading-snug pb-1">
                {currentDegree.name}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-neutral-500 shrink-0 transition-transform duration-200 ${
                isDegreeDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDegreeDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-84 max-w-[90vw] bg-white rounded-2xl shadow-xl border border-neutral-200 z-50 py-1.5 overflow-hidden">
              {IT_DEGREES.map((deg) => {
                const isSelected = deg.id === selectedDegreeId;

                return (
                  <button
                    key={deg.id}
                    id={`admin-degree-${deg.id}`}
                    onClick={() => {
                      setSelectedDegreeId(deg.id);
                      onSelectActiveDegreeYear(deg.id, selectedYear);
                      setIsDegreeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#0c3830] text-white'
                        : 'text-neutral-800 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex flex-col pr-2 min-w-0">
                      <span className="text-sm font-bold truncate">
                        {deg.name}
                      </span>
                      <span
                        className={`text-xs mt-0.5 ${
                          isSelected ? 'text-emerald-200/80' : 'text-neutral-500'
                        }`}
                      >
                        {deg.award}
                      </span>
                    </div>
                    {isSelected && (
                      <Check size={16} className="shrink-0 text-white" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Years Selector on the right of Degree dropdown */}
        <div className="h-14 flex items-stretch p-1 bg-white rounded-xl border border-neutral-200 shadow-xs">
          {(['Year 1', 'Year 2', 'Year 3'] as const).map((yr) => {
            const isYrSelected = yr === selectedYear;

            return (
              <button
                key={yr}
                id={`admin-year-${yr.replace(/\s+/g, '-').toLowerCase()}`}
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

      {/* Courses List */}
      <section className="space-y-3">
        {/* Table Toolbar (Tabs & Action Utilities) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* View Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTableTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTableTab === 'all'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTableTab('Semester 1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTableTab === 'Semester 1'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Semester 1
            </button>
            <button
              onClick={() => setActiveTableTab('Semester 2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTableTab === 'Semester 2'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Semester 2
            </button>
            <button
              onClick={() => setActiveTableTab('Year-Long')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTableTab === 'Year-Long'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Year-Long
            </button>
            <button
              onClick={handleOpenAdd}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Utility Action Buttons */}
          <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
            {isSearchVisible ? (
              <div className="relative flex items-center">
                <Search size={13} className="absolute left-2.5 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="h-8 pl-7 pr-7 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-36 sm:w-44 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  autoFocus
                />
                {tableSearch && (
                  <button
                    onClick={() => setTableSearch('')}
                    className="absolute right-2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsSearchVisible(true)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <Search size={15} />
              </button>
            )}

            <button
              onClick={handleCycleSort}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                sortKey ? 'text-[#0c3830] bg-emerald-50' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <ArrowUpDown size={15} />
            </button>

            <button
              onClick={() => {
                setActiveTableTab(activeTableTab === 'all' ? 'Semester 1' : 'all');
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTableTab !== 'all' ? 'text-[#0c3830] bg-emerald-50' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <ListFilter size={15} />
            </button>

            <button
              onClick={handleOpenAdd}
              className="h-8 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-xs cursor-pointer ml-1"
            >
              <span>Add</span>
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-white text-neutral-700 font-semibold select-none">
                  <th
                    onClick={() => handleToggleSortColumn('code')}
                    className="px-4 py-2.5 border-r border-neutral-200 w-36 cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <Hash size={13} className="text-neutral-400" />
                      <span>Code</span>
                      {sortKey === 'code' && (
                        <span className="text-[10px] text-neutral-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleToggleSortColumn('name')}
                    className="px-4 py-2.5 border-r border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <BookOpen size={13} className="text-neutral-400" />
                      <span>Course</span>
                      {sortKey === 'name' && (
                        <span className="text-[10px] text-neutral-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleToggleSortColumn('term')}
                    className="px-4 py-2.5 border-r border-neutral-200 w-48 cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <Calendar size={13} className="text-neutral-400" />
                      <span>Term</span>
                      {sortKey === 'term' && (
                        <span className="text-[10px] text-neutral-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleToggleSortColumn('credits')}
                    className="px-4 py-2.5 border-r border-neutral-200 w-28 cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <Layers size={13} className="text-neutral-400" />
                      <span>Credits</span>
                      {sortKey === 'credits' && (
                        <span className="text-[10px] text-neutral-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleToggleSortColumn('classes')}
                    className="px-4 py-2.5 border-r border-neutral-200 w-36 cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <Clock size={13} className="text-neutral-400" />
                      <span>Total Classes</span>
                      {sortKey === 'classes' && (
                        <span className="text-[10px] text-neutral-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="w-20 px-2 py-2.5 text-center">
                    <div className="flex justify-center text-neutral-400">
                      <MoreHorizontal size={14} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredAndSortedModules.map((mod) => {
                  const termDotColor =
                    mod.term === 'Semester 1'
                      ? 'bg-purple-500'
                      : mod.term === 'Semester 2'
                      ? 'bg-sky-500'
                      : 'bg-emerald-500';

                  return (
                    <tr
                      key={mod.id}
                      onClick={() => handleOpenEdit(mod)}
                      className="group hover:bg-neutral-50/80 transition-colors bg-white cursor-pointer"
                    >
                      <td className="px-4 py-2.5 border-r border-neutral-200 font-mono text-xs font-semibold text-neutral-800 whitespace-nowrap">
                        {mod.code}
                      </td>

                      <td className="px-4 py-2.5 border-r border-neutral-200 font-medium text-neutral-900">
                        {mod.name}
                      </td>

                      <td className="px-4 py-2.5 border-r border-neutral-200 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-50 text-neutral-800 border border-neutral-200">
                          <span className={`w-1.5 h-1.5 rounded-full ${termDotColor} shrink-0`} />
                          {mod.term}
                        </span>
                      </td>

                      <td className="px-4 py-2.5 border-r border-neutral-200 font-medium text-neutral-800 whitespace-nowrap">
                        {mod.credits}
                      </td>

                      <td className="px-4 py-2.5 border-r border-neutral-200 font-medium text-neutral-800 whitespace-nowrap">
                        {mod.totalSessions}
                      </td>

                      <td className="w-16 px-2 py-2 text-center whitespace-nowrap">
                        <button
                          type="button"
                          id={`edit-course-${mod.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(mod);
                          }}
                          className="p-1.5 rounded-md text-neutral-400 group-hover:text-neutral-800 group-hover:bg-neutral-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredAndSortedModules.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-neutral-400">
                      No courses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* Modal Form: Add or Edit Course */}
      {isOpenForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <h3 className="font-bold text-lg text-neutral-900">
                {editingModuleId ? 'Edit' : 'Add'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Term
                    </label>
                    <select
                      value={formTerm}
                      onChange={(e) =>
                        setFormTerm(
                          e.target.value as 'Year-Long' | 'Semester 1' | 'Semester 2'
                        )
                      }
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0c3830] bg-white"
                    >
                      <option value="Year-Long">Year-Long</option>
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Credits
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={120}
                      value={formCredits}
                      onChange={(e) => setFormCredits(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Classes
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={formTotalClasses}
                      onChange={(e) => setFormTotalClasses(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                {editingModuleId ? (
                  <button
                    type="button"
                    id="admin-delete-course-btn"
                    onClick={() => {
                      if (!isConfirmingDelete) {
                        setIsConfirmingDelete(true);
                      } else {
                        onDeleteCourse(selectedDegreeId, selectedYear, editingModuleId);
                        handleCloseForm();
                      }
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer border ${
                      isConfirmingDelete
                        ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700 ring-2 ring-rose-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300 hover:text-rose-800'
                    }`}
                  >
                    <Trash2 size={15} />
                    <span>{isConfirmingDelete ? 'Confirm' : 'Delete'}</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseForm}
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
