export interface HolidayItem {
  name: string;
  dateStr: string; // YYYY-MM-DD
  nepaliDate: string;
  dayOfWeek: string;
  isVacation?: boolean; // Multi-day vacation break like Dashain
}

// Islington College / ING Holiday Calendar 2083 (2026 - 2027)
export const HOLIDAYS_2083: HolidayItem[] = [
  {
    name: 'Nepalese New Year 2083',
    nepaliDate: '1 Baisakh',
    dateStr: '2026-04-14',
    dayOfWeek: 'Tuesday',
  },
  {
    name: 'International Labour Day',
    nepaliDate: '18 Baisakh',
    dateStr: '2026-05-01',
    dayOfWeek: 'Friday',
  },
  {
    name: 'Janai Purnima',
    nepaliDate: '12 Bhadra',
    dateStr: '2026-08-28',
    dayOfWeek: 'Friday',
  },
  {
    name: 'Haritalika Teej (Only for Ladies)',
    nepaliDate: '29 Bhadra',
    dateStr: '2026-09-14',
    dayOfWeek: 'Monday',
  },
  // Dashain Vacation (11 Oct 2026 to 25 Oct 2026 / 25 Ashwin - 8 Kartik)
  {
    name: 'Ghatasthapana',
    nepaliDate: '25 Ashwin',
    dateStr: '2026-10-11',
    dayOfWeek: 'Sunday',
    isVacation: true,
  },
  {
    name: 'Dashain Bida',
    nepaliDate: '26 Ashwin',
    dateStr: '2026-10-12',
    dayOfWeek: 'Monday',
    isVacation: true,
  },
  {
    name: 'Dashain Bida',
    nepaliDate: '27 Ashwin',
    dateStr: '2026-10-13',
    dayOfWeek: 'Tuesday',
    isVacation: true,
  },
  {
    name: 'Dashain Bida',
    nepaliDate: '28 Ashwin',
    dateStr: '2026-10-14',
    dayOfWeek: 'Wednesday',
    isVacation: true,
  },
  {
    name: 'Dashain Bida',
    nepaliDate: '29 Ashwin',
    dateStr: '2026-10-15',
    dayOfWeek: 'Thursday',
    isVacation: true,
  },
  {
    name: 'Dashain Bida',
    nepaliDate: '30 Ashwin',
    dateStr: '2026-10-16',
    dayOfWeek: 'Friday',
    isVacation: true,
  },
  {
    name: 'Fulpati',
    nepaliDate: '31 Ashwin',
    dateStr: '2026-10-17',
    dayOfWeek: 'Saturday',
    isVacation: true,
  },
  {
    name: 'Maha Ashtami',
    nepaliDate: '1 Kartik',
    dateStr: '2026-10-18',
    dayOfWeek: 'Sunday',
    isVacation: true,
  },
  {
    name: 'Dashain Bida',
    nepaliDate: '2 Kartik',
    dateStr: '2026-10-19',
    dayOfWeek: 'Monday',
    isVacation: true,
  },
  {
    name: 'Maha Navami',
    nepaliDate: '3 Kartik',
    dateStr: '2026-10-20',
    dayOfWeek: 'Tuesday',
    isVacation: true,
  },
  {
    name: 'Vijaya Dashami',
    nepaliDate: '4 Kartik',
    dateStr: '2026-10-21',
    dayOfWeek: 'Wednesday',
    isVacation: true,
  },
  {
    name: 'Ekadashi',
    nepaliDate: '5 Kartik',
    dateStr: '2026-10-22',
    dayOfWeek: 'Thursday',
    isVacation: true,
  },
  {
    name: 'Dwadashi',
    nepaliDate: '6 Kartik',
    dateStr: '2026-10-23',
    dayOfWeek: 'Friday',
    isVacation: true,
  },
  {
    name: 'Dashain Bida',
    nepaliDate: '7 Kartik',
    dateStr: '2026-10-24',
    dayOfWeek: 'Saturday',
    isVacation: true,
  },
  {
    name: 'Kojagrat Purnima',
    nepaliDate: '8 Kartik',
    dateStr: '2026-10-25',
    dayOfWeek: 'Sunday',
    isVacation: true,
  },
  // Tihar Holidays
  {
    name: 'Laxmi Puja',
    nepaliDate: '22 Kartik',
    dateStr: '2026-11-08',
    dayOfWeek: 'Sunday',
  },
  {
    name: 'Gai Puja',
    nepaliDate: '23 Kartik',
    dateStr: '2026-11-09',
    dayOfWeek: 'Monday',
  },
  {
    name: 'Govardhan Puja',
    nepaliDate: '24 Kartik',
    dateStr: '2026-11-10',
    dayOfWeek: 'Tuesday',
  },
  {
    name: 'Bhai Tika',
    nepaliDate: '25 Kartik',
    dateStr: '2026-11-11',
    dayOfWeek: 'Wednesday',
  },
  {
    name: 'Tihar Bida',
    nepaliDate: '26 Kartik',
    dateStr: '2026-11-12',
    dayOfWeek: 'Thursday',
  },
  {
    name: 'Chhath Puja (Terai Region)',
    nepaliDate: '29 Kartik',
    dateStr: '2026-11-15',
    dayOfWeek: 'Sunday',
  },
  {
    name: 'English New Year 2027',
    nepaliDate: '17 Poush',
    dateStr: '2027-01-01',
    dayOfWeek: 'Friday',
  },
  {
    name: 'Maghe Sankranti',
    nepaliDate: '1 Magh',
    dateStr: '2027-01-15',
    dayOfWeek: 'Friday',
  },
  {
    name: 'Maha Shivaratri',
    nepaliDate: '22 Falgun',
    dateStr: '2027-03-06',
    dayOfWeek: 'Saturday',
  },
  {
    name: 'Holi (Hilly Region)',
    nepaliDate: '7 Chaitra',
    dateStr: '2027-03-21',
    dayOfWeek: 'Sunday',
  },
  {
    name: 'Holi (Terai Region)',
    nepaliDate: '8 Chaitra',
    dateStr: '2027-03-22',
    dayOfWeek: 'Monday',
  },
];

// Dashain Vacation Range (oct 11, 2026 to oct 25, 2026)
export const DASHAIN_VACATION_START = '2026-10-11';
export const DASHAIN_VACATION_END = '2026-10-25';

function isWithinDashain(date: Date): boolean {
  const start = new Date(DASHAIN_VACATION_START + 'T00:00:00');
  const end = new Date(DASHAIN_VACATION_END + 'T23:59:59');
  return date >= start && date <= end;
}

export interface SemesterCalculationResult {
  nominalClasses: number;
  holidayDeductions: number;
  totalConductedClasses: number;
  cancelledHolidays: { name: string; date: string; day: string }[];
  endDate: string;
}

/**
 * Calculates total classes for a 12-week semester.
 * - 3 classes per week evenly distributed across teaching days (Sunday, Tuesday, Thursday).
 * - Saturday is always a holiday.
 * - Dashain Vacation pauses teaching weeks.
 * - Single-day holidays falling on a scheduled class day deduct 1 from nominal 36.
 */
export function calculateSemesterClasses(
  startDateStr: string,
  classDays: number[] = [0, 2, 4] // 0: Sunday, 2: Tuesday, 4: Thursday
): SemesterCalculationResult {
  if (!startDateStr) {
    return {
      nominalClasses: 36,
      holidayDeductions: 0,
      totalConductedClasses: 36,
      cancelledHolidays: [],
      endDate: '',
    };
  }

  const startDate = new Date(startDateStr + 'T00:00:00');
  if (isNaN(startDate.getTime())) {
    return {
      nominalClasses: 36,
      holidayDeductions: 0,
      totalConductedClasses: 36,
      cancelledHolidays: [],
      endDate: '',
    };
  }

  const holidayMap = new Map<string, HolidayItem>();
  HOLIDAYS_2083.forEach((h) => {
    if (!h.isVacation) {
      holidayMap.set(h.dateStr, h);
    }
  });

  let teachingWeeksCompleted = 0;
  let currentDate = new Date(startDate);
  const cancelledHolidays: { name: string; date: string; day: string }[] = [];
  const nominalClasses = 36; // 12 weeks * 3 classes/week

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Track 12 teaching weeks
  while (teachingWeeksCompleted < 12) {
    // Check if the current week start is during Dashain vacation
    if (isWithinDashain(currentDate)) {
      // Advance by 1 day and do not count toward teaching week
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Process 7 consecutive days for 1 candidate week
    let hasVacationInWeek = false;
    const weekDays: Date[] = [];

    for (let d = 0; d < 7; d++) {
      const checkDay = new Date(currentDate);
      checkDay.setDate(currentDate.getDate() + d);
      if (isWithinDashain(checkDay)) {
        hasVacationInWeek = true;
      }
      weekDays.push(checkDay);
    }

    if (hasVacationInWeek) {
      // Skip day-by-day until out of vacation
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // This is an active teaching week
    for (const dayDate of weekDays) {
      const dayOfWeek = dayDate.getDay();
      // Saturday is weekly off
      if (dayOfWeek === 6) continue;

      // Check if this day is one of the 3 class days
      if (classDays.includes(dayOfWeek)) {
        const yyyy = dayDate.getFullYear();
        const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
        const dd = String(dayDate.getDate()).padStart(2, '0');
        const dateKey = `${yyyy}-${mm}-${dd}`;

        const holiday = holidayMap.get(dateKey);
        if (holiday) {
          cancelledHolidays.push({
            name: holiday.name,
            date: dateKey,
            day: dayNames[dayOfWeek],
          });
        }
      }
    }

    teachingWeeksCompleted++;
    currentDate.setDate(currentDate.getDate() + 7);
  }

  const holidayDeductions = cancelledHolidays.length;
  const totalConductedClasses = Math.max(0, nominalClasses - holidayDeductions);

  const endY = currentDate.getFullYear();
  const endM = String(currentDate.getMonth() + 1).padStart(2, '0');
  const endD = String(currentDate.getDate()).padStart(2, '0');

  return {
    nominalClasses,
    holidayDeductions,
    totalConductedClasses,
    cancelledHolidays,
    endDate: `${endY}-${endM}-${endD}`,
  };
}

export interface RoutineSlotLike {
  day: 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
  moduleCode?: string;
  moduleTitle?: string;
  group?: string;
  degreeId?: string;
  year?: string;
  classType?: string;
}

export interface ModuleDeductionResult {
  moduleCode: string;
  moduleTitle: string;
  scheduledDays: ('SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI')[];
  nominalClasses: number;
  holidayDeductions: number;
  totalConductedClasses: number;
  cancelledHolidays: { name: string; date: string; day: string }[];
}

/**
 * Extracts the exact days of the week when a module has classes (Lecture/Tutorial/Workshop)
 * for a specific section/group from the routine timetable slots.
 */
export function getScheduledDaysForModule(
  moduleIdentifier: string,
  degreeId: string,
  year: 'Year 1' | 'Year 2' | 'Year 3',
  section?: string,
  routines: RoutineSlotLike[] = []
): ('SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI')[] {
  if (!routines || routines.length === 0) return [];

  const normId = (moduleIdentifier || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const matchingSlots = routines.filter((s) => {
    if (degreeId && s.degreeId && s.degreeId.toLowerCase() !== degreeId.toLowerCase()) {
      return false;
    }
    if (year && s.year && s.year !== year) {
      return false;
    }

    // Group matching: e.g. "AI7" matches "AI7" as well as combined lecture groups like "AI6+AI7+AI8+AI9"
    if (section && s.group) {
      const parts = s.group.split('+').map((g) => g.trim().toLowerCase());
      const cleanSec = section.trim().toLowerCase();
      const inParts = parts.includes(cleanSec);
      const inStr = s.group.toLowerCase().includes(cleanSec);
      if (!inParts && !inStr) {
        return false;
      }
    }

    const sCodeNorm = (s.moduleCode || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const sTitleNorm = (s.moduleTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    return (
      sCodeNorm === normId ||
      sTitleNorm === normId ||
      (sTitleNorm && normId && (sTitleNorm.includes(normId) || normId.includes(sTitleNorm))) ||
      (sCodeNorm && normId && (sCodeNorm.includes(normId) || normId.includes(sCodeNorm)))
    );
  });

  const dayOrder: ('SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI')[] = [
    'SUN',
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
  ];

  const uniqueDays = Array.from(new Set(matchingSlots.map((s) => s.day)));
  return uniqueDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
}

/**
 * Calculates the exact conducted classes for a specific module in a given section,
 * deducting ONLY the holidays that collide with that module's scheduled routine days.
 */
export function calculateSectionModuleSessions(
  module: {
    code: string;
    name: string;
    term: 'Semester 1' | 'Semester 2' | 'Year-Long';
    year: 'Year 1' | 'Year 2' | 'Year 3';
    degreeId: string;
  },
  section: string,
  sem1StartDate: string,
  sem2StartDate: string,
  routines: RoutineSlotLike[] = []
): ModuleDeductionResult {
  // First search by module code
  let scheduledDays = getScheduledDaysForModule(
    module.code,
    module.degreeId,
    module.year,
    section,
    routines
  );

  // If not found, try searching by module title
  if (scheduledDays.length === 0 && module.name) {
    scheduledDays = getScheduledDaysForModule(
      module.name,
      module.degreeId,
      module.year,
      section,
      routines
    );
  }

  // Fallback: If no routine slots are matched, assume standard 3 classes/week (SUN, TUE, THU)
  if (scheduledDays.length === 0) {
    scheduledDays = ['SUN', 'TUE', 'THU'];
  }

  if (module.term === 'Semester 1') {
    const calc = calculateModuleHolidayDeductions(scheduledDays, sem1StartDate, 12);
    return {
      moduleCode: module.code,
      moduleTitle: module.name,
      scheduledDays,
      nominalClasses: calc.nominalClasses,
      holidayDeductions: calc.holidayDeductions,
      totalConductedClasses: calc.totalConductedClasses,
      cancelledHolidays: calc.cancelledHolidays,
    };
  } else if (module.term === 'Semester 2') {
    const calc = calculateModuleHolidayDeductions(scheduledDays, sem2StartDate, 12);
    return {
      moduleCode: module.code,
      moduleTitle: module.name,
      scheduledDays,
      nominalClasses: calc.nominalClasses,
      holidayDeductions: calc.holidayDeductions,
      totalConductedClasses: calc.totalConductedClasses,
      cancelledHolidays: calc.cancelledHolidays,
    };
  } else {
    // Year-Long module: spans both Semester 1 and Semester 2
    const calc1 = calculateModuleHolidayDeductions(scheduledDays, sem1StartDate, 12);
    const calc2 = calculateModuleHolidayDeductions(scheduledDays, sem2StartDate, 12);
    return {
      moduleCode: module.code,
      moduleTitle: module.name,
      scheduledDays,
      nominalClasses: calc1.nominalClasses + calc2.nominalClasses,
      holidayDeductions: calc1.holidayDeductions + calc2.holidayDeductions,
      totalConductedClasses: calc1.totalConductedClasses + calc2.totalConductedClasses,
      cancelledHolidays: [...calc1.cancelledHolidays, ...calc2.cancelledHolidays],
    };
  }
}

export function calculateModuleHolidayDeductions(
  scheduledDays: ('SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI')[],
  startDateStr: string,
  teachingWeeksCount = 12
): {
  nominalClasses: number;
  holidayDeductions: number;
  totalConductedClasses: number;
  cancelledHolidays: { name: string; date: string; day: string }[];
} {
  const dayCodeToNumber: Record<'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI', number> = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
  };

  const targetDayNumbers = scheduledDays.map((d) => dayCodeToNumber[d]);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const holidayMap = new Map<string, HolidayItem>();
  HOLIDAYS_2083.forEach((h) => {
    if (!h.isVacation) {
      holidayMap.set(h.dateStr, h);
    }
  });

  const nominalClasses = teachingWeeksCount * scheduledDays.length;
  const cancelledHolidays: { name: string; date: string; day: string }[] = [];

  let currentDate = new Date(startDateStr);
  let teachingWeeksCompleted = 0;

  while (teachingWeeksCompleted < teachingWeeksCount) {
    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentDate);
      d.setDate(currentDate.getDate() + i);
      weekDays.push(d);
    }

    const isDashainBreak = weekDays.some((d) => isWithinDashain(d));
    if (isDashainBreak) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    for (const dayDate of weekDays) {
      const dayOfWeek = dayDate.getDay();
      if (dayOfWeek === 6) continue; // Saturday off

      if (targetDayNumbers.includes(dayOfWeek)) {
        const yyyy = dayDate.getFullYear();
        const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
        const dd = String(dayDate.getDate()).padStart(2, '0');
        const dateKey = `${yyyy}-${mm}-${dd}`;

        const holiday = holidayMap.get(dateKey);
        if (holiday) {
          cancelledHolidays.push({
            name: holiday.name,
            date: dateKey,
            day: dayNames[dayOfWeek],
          });
        }
      }
    }

    teachingWeeksCompleted++;
    currentDate.setDate(currentDate.getDate() + 7);
  }

  const holidayDeductions = cancelledHolidays.length;
  const totalConductedClasses = Math.max(0, nominalClasses - holidayDeductions);

  return {
    nominalClasses,
    holidayDeductions,
    totalConductedClasses,
    cancelledHolidays,
  };
}

export function getHolidayDetails(date: Date): {
  isHoliday: boolean;
  name?: string;
  isSaturday: boolean;
  isDashain: boolean;
} {
  const dayOfWeek = date.getDay();
  const isSaturday = dayOfWeek === 6;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateKey = `${yyyy}-${mm}-${dd}`;

  const isDashain = isWithinDashain(date);
  const holiday = HOLIDAYS_2083.find((h) => h.dateStr === dateKey);
  if (holiday) {
    return {
      isHoliday: true,
      name: holiday.name,
      isSaturday,
      isDashain: isDashain || !!holiday.isVacation,
    };
  }

  if (isDashain) {
    return {
      isHoliday: true,
      name: 'Dashain Vacation',
      isSaturday,
      isDashain: true,
    };
  }

  if (isSaturday) {
    return {
      isHoliday: true,
      name: 'Saturday (Weekly Off)',
      isSaturday: true,
      isDashain: false,
    };
  }

  return {
    isHoliday: false,
    isSaturday: false,
    isDashain: false,
  };
}
