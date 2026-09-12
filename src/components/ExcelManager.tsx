import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  IT_DEGREES,
  ModuleAttendance,
} from '../data/attendanceData';
import {
  calculateSemesterClasses,
  calculateSectionModuleSessions,
  SemesterCalculationResult,
} from '../utils/calendar2083';
import { generateAllRoutines } from '../data/routineData';
import {
  parseExcelWorkbook,
  generateTemplateWorkbook,
  ParsedDegreeCurriculum,
} from '../utils/excelParser';
import { HolidayCalendar } from './HolidayCalendar';

interface ExcelManagerProps {
  activeDegreeId: string;
  curricula: Record<string, Record<'Year 1' | 'Year 2' | 'Year 3', ModuleAttendance[]>>;
  onSaveCurriculum: (
    degreeId: string,
    newCurriculum: Record<'Year 1' | 'Year 2' | 'Year 3', ModuleAttendance[]>
  ) => void;
  onSaveMultipleCurricula?: (
    newCurricula: Record<string, Record<'Year 1' | 'Year 2' | 'Year 3', ModuleAttendance[]>>
  ) => void;
  onSwitchSubView?: (view: 'courses' | 'students' | 'excel') => void;
  onUpdateSemesterDates?: (sem1Start: string, sem2Start: string) => void;
}

export const ExcelManager: React.FC<ExcelManagerProps> = ({
  activeDegreeId,
  curricula,
  onSaveCurriculum,
  onSaveMultipleCurricula,
  onSwitchSubView,
}) => {
  const selectedDegreeId = activeDegreeId || 'multimedia';

  // Semester Dates (stored in localStorage)
  const [sem1StartDate, setSem1StartDate] = useState<string>(() => {
    return localStorage.getItem('attendease_sem1_start_date') || '2026-09-06';
  });
  const [sem2StartDate, setSem2StartDate] = useState<string>(() => {
    return localStorage.getItem('attendease_sem2_start_date') || '2027-02-07';
  });

  // Calculation results
  const [sem1Calc, setSem1Calc] = useState<SemesterCalculationResult>(() =>
    calculateSemesterClasses(sem1StartDate)
  );
  const [sem2Calc, setSem2Calc] = useState<SemesterCalculationResult>(() =>
    calculateSemesterClasses(sem2StartDate)
  );

  // Excel Upload state
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedDegreeCurriculum | null>(null);
  const [multiDegreeData, setMultiDegreeData] = useState<Record<string, ParsedDegreeCurriculum> | null>(null);
  const [isMultiDegreeFile, setIsMultiDegreeFile] = useState(false);
  const [detectedDegreeIds, setDetectedDegreeIds] = useState<string[]>([]);
  const [totalParsedCount, setTotalParsedCount] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update calculation whenever dates change
  useEffect(() => {
    const res1 = calculateSemesterClasses(sem1StartDate);
    const res2 = calculateSemesterClasses(sem2StartDate);
    setSem1Calc(res1);
    setSem2Calc(res2);
    localStorage.setItem('attendease_sem1_start_date', sem1StartDate);
    localStorage.setItem('attendease_sem2_start_date', sem2StartDate);

    // Apply calculated totals to existing courses for this degree
    const currentProg = curricula[selectedDegreeId];
    if (currentProg) {
      let changed = false;
      const allRoutines = generateAllRoutines();
      const updatedProg: Record<'Year 1' | 'Year 2' | 'Year 3', ModuleAttendance[]> = {
        'Year 1': currentProg['Year 1'].map((m) => {
          const modRes = calculateSectionModuleSessions(
            { code: m.code, name: m.name, term: m.term as any, year: 'Year 1', degreeId: selectedDegreeId },
            'AI7',
            sem1StartDate,
            sem2StartDate,
            allRoutines
          );
          const targetTotal = modRes.totalConductedClasses || (m.term === 'Year-Long' ? 68 : 36);
          if (m.totalSessions !== targetTotal) {
            changed = true;
            return {
              ...m,
              totalSessions: targetTotal,
              attendedSessions: Math.min(m.attendedSessions, targetTotal),
            };
          }
          return m;
        }),
        'Year 2': currentProg['Year 2'].map((m) => {
          const modRes = calculateSectionModuleSessions(
            { code: m.code, name: m.name, term: m.term as any, year: 'Year 2', degreeId: selectedDegreeId },
            'AI7',
            sem1StartDate,
            sem2StartDate,
            allRoutines
          );
          const targetTotal = modRes.totalConductedClasses || (m.term === 'Year-Long' ? 68 : 36);
          if (m.totalSessions !== targetTotal) {
            changed = true;
            return {
              ...m,
              totalSessions: targetTotal,
              attendedSessions: Math.min(m.attendedSessions, targetTotal),
            };
          }
          return m;
        }),
        'Year 3': currentProg['Year 3'].map((m) => {
          const modRes = calculateSectionModuleSessions(
            { code: m.code, name: m.name, term: m.term as any, year: 'Year 3', degreeId: selectedDegreeId },
            'AI7',
            sem1StartDate,
            sem2StartDate,
            allRoutines
          );
          const targetTotal = modRes.totalConductedClasses || (m.term === 'Year-Long' ? 68 : 36);
          if (m.totalSessions !== targetTotal) {
            changed = true;
            return {
              ...m,
              totalSessions: targetTotal,
              attendedSessions: Math.min(m.attendedSessions, targetTotal),
            };
          }
          return m;
        }),
      };
      if (changed) {
        onSaveCurriculum(selectedDegreeId, updatedProg);
      }
    }
  }, [sem1StartDate, sem2StartDate, selectedDegreeId]);

  const handleProcessFile = (file: File) => {
    setErrorMsg(null);
    setSaveSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const parseResult = parseExcelWorkbook(buffer, selectedDegreeId);

        if (parseResult.totalParsed === 0) {
          setErrorMsg('No course rows detected in file.');
          return;
        }

        // Adjust class counts for all parsed degrees using routine-aware calculation
        const allRoutines = generateAllRoutines();
        const adjustedMulti: Record<string, ParsedDegreeCurriculum> = {};
        Object.entries(parseResult.degrees).forEach(([dId, curr]) => {
          const adjustYear = (yr: 'Year 1' | 'Year 2' | 'Year 3') => {
            return curr[yr].map((m) => {
              const modRes = calculateSectionModuleSessions(
                { code: m.code, name: m.name, term: m.term as any, year: yr, degreeId: dId },
                'AI7',
                sem1StartDate,
                sem2StartDate,
                allRoutines
              );
              const conducted = modRes.totalConductedClasses || (m.term === 'Year-Long' ? 68 : 36);
              return {
                ...m,
                totalSessions: conducted,
                attendedSessions: conducted,
              };
            });
          };

          adjustedMulti[dId] = {
            'Year 1': adjustYear('Year 1'),
            'Year 2': adjustYear('Year 2'),
            'Year 3': adjustYear('Year 3'),
          };
        });

        setMultiDegreeData(adjustedMulti);
        setIsMultiDegreeFile(parseResult.isMultiDegree);
        setDetectedDegreeIds(parseResult.detectedDegrees);

        const targetDegreeId =
          parseResult.detectedDegrees.length > 0
            ? parseResult.detectedDegrees.includes(selectedDegreeId)
              ? selectedDegreeId
              : parseResult.detectedDegrees[0]
            : selectedDegreeId;

        setParsedData(adjustedMulti[targetDegreeId] || parseResult.curriculum);
        setTotalParsedCount(parseResult.totalParsed);
        setFileName(file.name);
      } catch (err: any) {
        setErrorMsg('Failed to parse file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleApplyCurriculum = () => {
    if (isMultiDegreeFile && multiDegreeData && Object.keys(multiDegreeData).length > 0) {
      if (onSaveMultipleCurricula) {
        onSaveMultipleCurricula(multiDegreeData);
      } else {
        Object.entries(multiDegreeData).forEach(([dId, curr]) => {
          onSaveCurriculum(dId, curr);
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else if (parsedData) {
      onSaveCurriculum(selectedDegreeId, parsedData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="flex-1 p-5 sm:p-7 overflow-y-auto bg-white flex flex-col gap-6">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            Admin
          </h1>
          {onSwitchSubView && (
            <div className="flex items-center p-1 bg-neutral-100 rounded-xl">
              <button
                type="button"
                id="excel-switch-courses"
                onClick={() => onSwitchSubView('courses')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                Courses
              </button>
              <button
                type="button"
                id="excel-switch-students"
                onClick={() => onSwitchSubView('students')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                Students
              </button>
              <button
                type="button"
                id="excel-switch-excel"
                onClick={() => onSwitchSubView('excel')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-neutral-900 shadow-xs cursor-pointer"
              >
                Excel
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Start Date Section at top */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-neutral-900">Start date</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Semester 1 Card */}
          <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-900">Semester 1</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <Clock size={12} />
                <span>{sem1Calc.totalConductedClasses} Classes</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-neutral-500 shrink-0" />
              <input
                id="sem1-start-date"
                type="date"
                value={sem1StartDate}
                onChange={(e) => setSem1StartDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
              />
            </div>
          </div>

          {/* Semester 2 Card */}
          <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-900">Semester 2</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <Clock size={12} />
                <span>{sem2Calc.totalConductedClasses} Classes</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-neutral-500 shrink-0" />
              <input
                id="sem2-start-date"
                type="date"
                value={sem2StartDate}
                onChange={(e) => setSem2StartDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Upload Zone below Start date */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900">Upload</h2>
          <button
            type="button"
            onClick={generateTemplateWorkbook}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer shadow-xs"
          >
            <Download size={13} />
            <span>Template</span>
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleProcessFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#0c3830] bg-emerald-50/50'
              : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleProcessFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 shadow-xs">
              <UploadCloud size={24} />
            </div>
            <div className="font-bold text-sm text-neutral-800">
              {fileName ? fileName : 'Excel'}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {(parsedData || multiDegreeData) && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 size={16} />
                <span>{totalParsedCount}</span>
              </div>
              {isMultiDegreeFile && detectedDegreeIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {detectedDegreeIds.map((dId) => {
                    const deg = IT_DEGREES.find((d) => d.id === dId);
                    return (
                      <span
                        key={dId}
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#0c3830] text-white shadow-xs"
                      >
                        {deg?.shortName || dId}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              id="apply-excel-curriculum-btn"
              onClick={handleApplyCurriculum}
              className="px-4 py-2 rounded-xl bg-[#0c3830] text-white text-xs font-bold hover:bg-[#082620] transition-colors cursor-pointer shadow-xs shrink-0"
            >
              Apply
            </button>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold text-center">
            Saved
          </div>
        )}
      </section>

      {/* Calendar Section at the bottom */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-neutral-900">Calendar</h2>
        <HolidayCalendar initialDate={sem1StartDate} />
      </section>
    </div>
  );
};
