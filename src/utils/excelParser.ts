import * as XLSX from 'xlsx';
import {
  ModuleAttendance,
  AI_CURRICULUM,
  COMPUTING_CURRICULUM,
  NETWORKING_CURRICULUM,
  MULTIMEDIA_CURRICULUM,
} from '../data/attendanceData';
import {
  TimetableSlot,
  generateAllRoutines,
} from '../data/routineData';

export interface ParsedDegreeCurriculum {
  'Year 1': ModuleAttendance[];
  'Year 2': ModuleAttendance[];
  'Year 3': ModuleAttendance[];
}

export interface ParseExcelResult {
  isMultiDegree: boolean;
  degrees: Record<string, ParsedDegreeCurriculum>;
  curriculum: ParsedDegreeCurriculum; // Primary or selected degree curriculum
  totalParsed: number;
  detectedDegrees: string[];
  routines: TimetableSlot[];
  detectedSections: string[];
}

export function identifyDegreeId(raw: string): string | null {
  const str = String(raw || '').toLowerCase().trim();
  if (
    str.includes('multimedia') ||
    str.includes('media') ||
    str.includes('bmt') ||
    str.startsWith('mm')
  ) {
    return 'multimedia';
  }
  if (
    str.includes('with ai') ||
    str.includes('computing with ai') ||
    str.includes('artificial intelligence') ||
    str.includes('ai -') ||
    str.includes('ai-') ||
    str.includes('ai_') ||
    str === 'ai' ||
    str.startsWith('ai ') ||
    str.endsWith(' ai')
  ) {
    return 'ai';
  }
  if (
    str.includes('network') ||
    str.includes('security') ||
    str.includes('cyber') ||
    str.includes('cns') ||
    str.startsWith('nw')
  ) {
    return 'networking';
  }
  if (
    str.includes('computing') ||
    str.includes('computer science') ||
    str.startsWith('comp') ||
    str === 'cs' ||
    str.startsWith('cs ') ||
    str.startsWith('cs-') ||
    str.startsWith('c-')
  ) {
    return 'computing';
  }
  return null;
}

function normalizeTerm(raw: string): 'Semester 1' | 'Semester 2' | 'Year-Long' {
  const str = String(raw || '').toLowerCase().trim();
  if (
    str.includes('sem 1') ||
    str.includes('semester 1') ||
    str === 's1' ||
    str === '1'
  ) {
    return 'Semester 1';
  }
  if (
    str.includes('sem 2') ||
    str.includes('semester 2') ||
    str === 's2' ||
    str === '2'
  ) {
    return 'Semester 2';
  }
  return 'Year-Long';
}

export function normalizeYear(raw: string): 'Year 1' | 'Year 2' | 'Year 3' {
  const str = String(raw || '').toLowerCase().trim();
  if (
    str.includes('year 2') ||
    str.includes('y2') ||
    str.includes('level 5') ||
    str.includes('yr 2') ||
    str.includes('year-2') ||
    str.includes('2')
  ) {
    return 'Year 2';
  }
  if (
    str.includes('year 3') ||
    str.includes('y3') ||
    str.includes('level 6') ||
    str.includes('yr 3') ||
    str.includes('year-3') ||
    str.includes('3')
  ) {
    return 'Year 3';
  }
  return 'Year 1';
}

function normalizeDay(raw: string): 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' {
  const str = String(raw || '').toUpperCase().trim();
  if (str.startsWith('SUN')) return 'SUN';
  if (str.startsWith('MON')) return 'MON';
  if (str.startsWith('TUE')) return 'TUE';
  if (str.startsWith('WED')) return 'WED';
  if (str.startsWith('THU')) return 'THU';
  return 'FRI';
}

function normalizeClassType(raw: string): 'Lecture' | 'Tutorial' | 'Workshop' {
  const str = String(raw || '').toLowerCase().trim();
  if (str.includes('tut')) return 'Tutorial';
  if (str.includes('work') || str.includes('lab')) return 'Workshop';
  return 'Lecture';
}

function createEmptyCurriculum(): ParsedDegreeCurriculum {
  return {
    'Year 1': [],
    'Year 2': [],
    'Year 3': [],
  };
}

export function parseExcelWorkbook(
  data: ArrayBuffer,
  fallbackDegreeId = 'multimedia'
): ParseExcelResult {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  const degrees: Record<string, ParsedDegreeCurriculum> = {};
  const parsedRoutines: TimetableSlot[] = [];
  const sectionSet = new Set<string>();
  let totalParsed = 0;
  const detectedDegreeSet = new Set<string>();

  // Check if sheet names match degrees
  const degreeMatchedSheets = sheetNames
    .map((name) => ({ name, degreeId: identifyDegreeId(name) }))
    .filter((item): item is { name: string; degreeId: string } => item.degreeId !== null);

  const targetSheets = degreeMatchedSheets.length > 0 
    ? degreeMatchedSheets 
    : sheetNames.map((name) => ({ name, degreeId: fallbackDegreeId }));

  targetSheets.forEach(({ name, degreeId }) => {
    detectedDegreeSet.add(degreeId);
    if (!degrees[degreeId]) {
      degrees[degreeId] = createEmptyCurriculum();
    }

    const sheet = workbook.Sheets[name];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);
    const defaultYearFromSheet = normalizeYear(name);

    // Check if this sheet is a routine sheet (contains Day, Class Type, Group)
    const isRoutineSheet = rows.some(
      (r) => r['Day'] || r['Class Type'] || r['Group'] || r['Room'] || r['Lecturer']
    );

    const modulesSeen = new Map<string, { code: string; name: string; term: 'Semester 1' | 'Semester 2' | 'Year-Long'; year: 'Year 1' | 'Year 2' | 'Year 3'; degreeId: string }>();

    rows.forEach((r, idx) => {
      // Degree resolution: If sheet wasn't matched, check Degree/Course column in row, else use sheet/fallback
      const rowDegreeCandidate = r['Degree'] || r['Course'] || r['Programme'] || r['Program'] || r['Major'];
      const effectiveDegreeId =
        (rowDegreeCandidate ? identifyDegreeId(rowDegreeCandidate) : null) ||
        degreeId ||
        fallbackDegreeId;

      detectedDegreeSet.add(effectiveDegreeId);
      if (!degrees[effectiveDegreeId]) {
        degrees[effectiveDegreeId] = createEmptyCurriculum();
      }

      const yr = r['Year'] || r['Academic Year'] || r['Level']
        ? normalizeYear(r['Year'] || r['Academic Year'] || r['Level'])
        : defaultYearFromSheet;

      const code = String(
        r['Course Code'] || r['Code'] || r['Module Code'] || r['Module'] || `MOD-${idx + 1}`
      ).trim();
      const courseName = String(
        r['Course Name'] || r['Name'] || r['Title'] || r['Module Title'] || r['Module Name'] || code
      ).trim();
      // If blank or left empty, defaults to Year-Long
      const term = normalizeTerm(
        r['Term'] || r['Semester'] || r['Sem'] || ''
      );
      const defaultCredit = term === 'Year-Long' ? 30 : 15;
      const credits =
        Number(r['Credits'] || r['Credit'] || defaultCredit) || defaultCredit;

      if (isRoutineSheet && (r['Day'] || r['Class Type'])) {
        const groupStr = String(r['Group'] || r['Section'] || 'AI7').trim();
        const slot: TimetableSlot = {
          id: `excel-slot-${effectiveDegreeId}-${yr}-${idx}`,
          day: normalizeDay(r['Day']),
          time: String(r['Time'] || '10:00 AM - 12:00 PM').trim(),
          classType: normalizeClassType(r['Class Type']),
          moduleCode: code,
          moduleTitle: courseName,
          lecturer: String(r['Lecturer'] || 'Faculty').trim(),
          group: groupStr,
          block: String(r['Block'] || 'Main').trim(),
          room: String(r['Room'] || 'Room 1').trim(),
          degreeId: effectiveDegreeId,
          year: yr,
        };
        parsedRoutines.push(slot);

        // Record individual sections from group (e.g. AI6+AI7+AI8 splits into AI6, AI7, etc.)
        groupStr.split('+').forEach((g) => {
          const clean = g.trim();
          if (clean && clean.length <= 6) sectionSet.add(clean);
        });

        // Collect unique modules to build curriculum
        const modKey = `${effectiveDegreeId}-${yr}-${code}`;
        if (!modulesSeen.has(modKey) && code) {
          modulesSeen.set(modKey, { code, name: courseName, term, year: yr, degreeId: effectiveDegreeId });
        }
      } else if (code && courseName) {
        degrees[effectiveDegreeId][yr].push({
          id: `EXCEL-${effectiveDegreeId}-${yr}-${code}-${idx}`,
          code,
          name: courseName,
          term,
          credits,
          creditWeight: Number(((credits / 120) * 100).toFixed(1)),
          totalSessions: 36,
          attendedSessions: 36,
          missedSessions: 0,
          lectureRate: 100,
          tutorialRate: 100,
          workshopRate: 100,
          year: yr,
          degreeId: effectiveDegreeId,
        });
        totalParsed++;
      }
    });

    // If it was a routine sheet, populate the curriculum from the unique modules
    if (isRoutineSheet && modulesSeen.size > 0) {
      modulesSeen.forEach((item, _) => {
        const itemCredits = item.term === 'Year-Long' ? 30 : 15;
        degrees[item.degreeId][item.year].push({
          id: `ROUTINE-${item.degreeId}-${item.year}-${item.code}`,
          code: item.code,
          name: item.name,
          term: item.term,
          credits: itemCredits,
          creditWeight: Number(((itemCredits / 120) * 100).toFixed(1)),
          totalSessions: 36,
          attendedSessions: 36,
          missedSessions: 0,
          lectureRate: 100,
          tutorialRate: 100,
          workshopRate: 100,
          year: item.year,
          degreeId: item.degreeId,
        });
        totalParsed++;
      });
    }
  });

  const detectedDegrees = Array.from(detectedDegreeSet);
  const primaryDegreeId =
    detectedDegrees.length > 0 ? detectedDegrees[0] : fallbackDegreeId;
  const curriculum = degrees[primaryDegreeId] || createEmptyCurriculum();

  return {
    isMultiDegree: detectedDegrees.length > 1,
    degrees,
    curriculum,
    totalParsed: totalParsed || parsedRoutines.length,
    detectedDegrees,
    routines: parsedRoutines,
    detectedSections: Array.from(sectionSet),
  };
}

export function generateTemplateWorkbook(): void {
  const wb = XLSX.utils.book_new();
  const allRoutines = generateAllRoutines();

  // 12 sheets separated by Course and Year, each containing 5 sections with Lecture, Tutorial, Workshop
  const sheetConfigs: { sheetName: string; degreeId: string; year: 'Year 1' | 'Year 2' | 'Year 3' }[] = [
    { sheetName: 'AI - Year 1', degreeId: 'ai', year: 'Year 1' },
    { sheetName: 'AI - Year 2', degreeId: 'ai', year: 'Year 2' },
    { sheetName: 'AI - Year 3', degreeId: 'ai', year: 'Year 3' },
    { sheetName: 'Computing - Year 1', degreeId: 'computing', year: 'Year 1' },
    { sheetName: 'Computing - Year 2', degreeId: 'computing', year: 'Year 2' },
    { sheetName: 'Computing - Year 3', degreeId: 'computing', year: 'Year 3' },
    { sheetName: 'Networking - Year 1', degreeId: 'networking', year: 'Year 1' },
    { sheetName: 'Networking - Year 2', degreeId: 'networking', year: 'Year 2' },
    { sheetName: 'Networking - Year 3', degreeId: 'networking', year: 'Year 3' },
    { sheetName: 'Multimedia - Year 1', degreeId: 'multimedia', year: 'Year 1' },
    { sheetName: 'Multimedia - Year 2', degreeId: 'multimedia', year: 'Year 2' },
    { sheetName: 'Multimedia - Year 3', degreeId: 'multimedia', year: 'Year 3' },
  ];

  sheetConfigs.forEach(({ sheetName, degreeId, year }) => {
    // Filter slots for this degree and year
    const slots = allRoutines.filter(
      (s) => s.degreeId === degreeId && s.year === year
    );

    const rows = slots.map((s) => ({
      Day: s.day,
      Time: s.time,
      'Class Type': s.classType,
      'Module Code': s.moduleCode,
      'Module Title': s.moduleTitle,
      Lecturer: s.lecturer,
      Group: s.group,
      Block: s.block,
      Room: s.room,
      Year: s.year,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Set column widths for clean readability
    ws['!cols'] = [
      { wch: 8 },  // Day
      { wch: 24 }, // Time
      { wch: 14 }, // Class Type
      { wch: 14 }, // Module Code
      { wch: 44 }, // Module Title
      { wch: 28 }, // Lecturer
      { wch: 24 }, // Group
      { wch: 14 }, // Block
      { wch: 30 }, // Room
      { wch: 10 }, // Year
    ];

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, 'Timetable_Routines_All_Courses.xlsx');
}
