import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Download,
  Filter,
  Search,
  Printer,
  CheckCircle2,
  CalendarCheck,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { CanonicalStudent, ScheduledSession } from '../../types/canonical';

interface OfficialTimetableRow {
  id: string;
  day: 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
  time: string;
  classType: 'Lecture' | 'Tutorial' | 'Workshop';
  moduleCode: string;
  moduleTitle: string;
  lecturer: string;
  group: string;
  block: string;
  room: string;
}

// Exact dataset matching London Metropolitan University / Islington College routine from screenshot
export const ISLINGTON_OFFICIAL_ROUTINE: OfficialTimetableRow[] = [
  {
    id: 'slot-1',
    day: 'SUN',
    time: '12:30 PM - 02:30 PM',
    classType: 'Workshop',
    moduleCode: 'CC5051NI',
    moduleTitle: 'Databases',
    lecturer: 'Ms. Tek Maya Chaudhary',
    group: 'AI7',
    block: 'Alumni',
    room: 'SR 10 - Samir Gautam',
  },
  {
    id: 'slot-2',
    day: 'MON',
    time: '08:00 AM - 10:00 AM',
    classType: 'Workshop',
    moduleCode: 'CS5002NI',
    moduleTitle: 'Software Engineering',
    lecturer: 'Mr. Mohit Paudel',
    group: 'AI7',
    block: 'Skill',
    room: 'Lab 12 - Sushant Hona',
  },
  {
    id: 'slot-3',
    day: 'MON',
    time: '10:00 AM - 12:00 PM',
    classType: 'Workshop',
    moduleCode: 'CS5003NI',
    moduleTitle: 'Data Structure and Specialist Programming',
    lecturer: 'Mr. Nishan Poudel',
    group: 'AI7',
    block: 'Skill',
    room: 'Lab 12 - Sushant Hona',
  },
  {
    id: 'slot-4',
    day: 'TUE',
    time: '11:00 AM - 12:30 PM',
    classType: 'Lecture',
    moduleCode: 'MA5054NI',
    moduleTitle: 'Further Calculus',
    lecturer: 'Mr. Nadil Paudel',
    group: 'AI6+AI7+AI8+AI9',
    block: 'Alumni',
    room: 'LT 04 - Tridev Gurung',
  },
  {
    id: 'slot-5',
    day: 'TUE',
    time: '12:30 PM - 02:00 PM',
    classType: 'Lecture',
    moduleCode: 'CS5003NI',
    moduleTitle: 'Data Structure and Specialist Programming',
    lecturer: 'Mr. Sudip Dahal',
    group: 'AI6+AI7+AI8+AI9',
    block: 'Alumni',
    room: 'LT 04 - Tridev Gurung',
  },
  {
    id: 'slot-6',
    day: 'WED',
    time: '09:30 AM - 11:00 AM',
    classType: 'Lecture',
    moduleCode: 'CC5051NI',
    moduleTitle: 'Databases',
    lecturer: 'Ms. Astha Sharma',
    group: 'AI6+AI7+AI8+AI9',
    block: 'London',
    room: 'LT 03 - Westminster Palace',
  },
  {
    id: 'slot-7',
    day: 'WED',
    time: '12:00 PM - 01:30 PM',
    classType: 'Lecture',
    moduleCode: 'CS5002NI',
    moduleTitle: 'Software Engineering',
    lecturer: 'Mr. Sanjeep Lama',
    group: 'AI6+AI7+AI8+AI9',
    block: 'London',
    room: 'LT 03 - Westminster Palace',
  },
  {
    id: 'slot-8',
    day: 'THU',
    time: '12:00 PM - 01:00 PM',
    classType: 'Tutorial',
    moduleCode: 'CC5051NI',
    moduleTitle: 'Databases',
    lecturer: 'Ms. Tek Maya Chaudhary',
    group: 'AI7',
    block: 'Nepal',
    room: 'TR 08 - Sagarmatha',
  },
  {
    id: 'slot-9',
    day: 'THU',
    time: '01:00 PM - 02:00 PM',
    classType: 'Tutorial',
    moduleCode: 'MA5054NI',
    moduleTitle: 'Further Calculus',
    lecturer: 'Mr. Sanjit Kumar Yadav',
    group: 'AI7',
    block: 'Nepal',
    room: 'TR 08 - Sagarmatha',
  },
  {
    id: 'slot-10',
    day: 'FRI',
    time: '08:30 AM - 10:30 AM',
    classType: 'Workshop',
    moduleCode: 'MA5054NI',
    moduleTitle: 'Further Calculus',
    lecturer: 'Mr. Sanjit Kumar Yadav',
    group: 'AI7',
    block: 'Nepal',
    room: 'TR 02 - Patan',
  },
  {
    id: 'slot-11',
    day: 'FRI',
    time: '11:00 AM - 12:00 PM',
    classType: 'Tutorial',
    moduleCode: 'CS5002NI',
    moduleTitle: 'Software Engineering',
    lecturer: 'Mr. Mohit Paudel',
    group: 'AI7',
    block: 'Nepal',
    room: 'TR 03 - Pokhara',
  },
  {
    id: 'slot-12',
    day: 'FRI',
    time: '12:00 PM - 01:00 PM',
    classType: 'Tutorial',
    moduleCode: 'CS5003NI',
    moduleTitle: 'Data Structure and Specialist Programming',
    lecturer: 'Mr. Nishan Poudel',
    group: 'AI7',
    block: 'Nepal',
    room: 'TR 04 - Lumbini',
  },
];

interface ClassTimetableGoogleCalendarProps {
  student: CanonicalStudent;
  onRequestExcuse?: (session: ScheduledSession) => void;
}

export const ClassTimetableGoogleCalendar: React.FC<ClassTimetableGoogleCalendarProps> = ({
  student,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const daysList: ('ALL' | 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI')[] = [
    'ALL',
    'SUN',
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
  ];

  // Filtered rows
  const filteredRoutine = useMemo(() => {
    return ISLINGTON_OFFICIAL_ROUTINE.filter((item) => {
      if (selectedDay !== 'ALL' && item.day !== selectedDay) return false;
      if (selectedType !== 'ALL' && item.classType !== selectedType) return false;
      if (selectedModule !== 'ALL' && item.moduleCode !== selectedModule) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.moduleTitle.toLowerCase().includes(q) ||
          item.moduleCode.toLowerCase().includes(q) ||
          item.lecturer.toLowerCase().includes(q) ||
          item.room.toLowerCase().includes(q) ||
          item.block.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [selectedDay, selectedType, selectedModule, searchQuery]);

  // Export full calendar to .ics file
  const handleExportToICS = () => {
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Islington College//London Met Timetable//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    const dayOffsets: Record<string, number> = {
      SUN: 0,
      MON: 1,
      TUE: 2,
      WED: 3,
      THU: 4,
      FRI: 5,
    };

    // Use current week's Sunday as base
    const now = new Date();
    const currentDay = now.getDay();
    const sundayDate = new Date(now);
    sundayDate.setDate(now.getDate() - currentDay);

    ISLINGTON_OFFICIAL_ROUTINE.forEach((slot, index) => {
      const targetDate = new Date(sundayDate);
      targetDate.setDate(sundayDate.getDate() + (dayOffsets[slot.day] || 0));
      const dateStr = targetDate.toISOString().split('T')[0].replace(/-/g, '');

      // Parse times approx
      const [startRaw, endRaw] = slot.time.split(' - ');
      const formatTime = (timeStr: string) => {
        const [time, meridiem] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
      };

      const startFormatted = formatTime(startRaw);
      const endFormatted = formatTime(endRaw);

      ics.push(
        'BEGIN:VEVENT',
        `UID:slot-${index}-${slot.moduleCode}@islingtoncollege.edu.np`,
        `SUMMARY:${slot.moduleCode}: ${slot.moduleTitle} (${slot.classType})`,
        `DESCRIPTION:Lecturer: ${slot.lecturer}\\nGroup: ${slot.group}\\nBlock: ${slot.block}\\nRoom: ${slot.room}`,
        `LOCATION:${slot.room}, ${slot.block} Block, Islington College`,
        `DTSTART:${dateStr}T${startFormatted}`,
        `DTEND:${dateStr}T${endFormatted}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    ics.push('END:VCALENDAR');

    const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Islington_Class_Timetable_${student.rollNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper for single Google Calendar Add URL
  const getGoogleCalendarUrl = (slot: OfficialTimetableRow) => {
    const title = encodeURIComponent(`${slot.moduleCode}: ${slot.moduleTitle} (${slot.classType})`);
    const details = encodeURIComponent(
      `Lecturer: ${slot.lecturer}\nGroup: ${slot.group}\nBlock: ${slot.block}\nRoom: ${slot.room}\nIslington College Class Attendance Portal`
    );
    const location = encodeURIComponent(`${slot.room}, ${slot.block} Block, Islington College, Kathmandu`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search & Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search module, lecturer, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="Lecture">Lecture</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Module:</span>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
            >
              <option value="ALL">All Modules</option>
              <option value="CC5051NI">CC5051NI - Databases</option>
              <option value="CS5002NI">CS5002NI - Software Engineering</option>
              <option value="CS5003NI">CS5003NI - Data Structure</option>
              <option value="MA5054NI">MA5054NI - Further Calculus</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Routine</span>
          </button>

          <button
            onClick={handleExportToICS}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0c3830] text-white text-xs font-bold hover:bg-[#0c3830]/90 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Download size={14} />
            <span>Export Timetable (.ics)</span>
          </button>
        </div>
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {daysList.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedDay === d
                ? 'bg-[#0c3830] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {d === 'ALL' ? 'All Days (SUN - FRI)' : d}
          </button>
        ))}
      </div>

      {/* Official Timetable Document Frame (Exact London Metropolitan University Layout) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Top University Blue Banner */}
        <div className="bg-[#4d7ea8] text-white py-3.5 px-4 text-center">
          <h2 className="text-sm sm:text-base font-extrabold tracking-wider uppercase font-sans">
            LONDON METROPOLITAN UNIVERSITY
          </h2>
        </div>

        {/* Secondary Medium Blue Banner */}
        <div className="bg-[#7ea8cc] text-white py-2 px-4 text-center border-t border-white/20">
          <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase font-sans">
            YEAR 2 COMPUTING WITH ARTIFICIAL INTELLIGENCE TIME TABLE
          </h3>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#8ea633] text-white border-y border-[#7b9227] font-bold">
                <th className="py-3 px-3.5 font-bold tracking-wide border-r border-[#9eb73d] whitespace-nowrap">
                  Day
                </th>
                <th className="py-3 px-3.5 font-bold tracking-wide border-r border-[#9eb73d] whitespace-nowrap">
                  Time
                </th>
                <th className="py-3 px-3.5 font-bold tracking-wide border-r border-[#9eb73d] whitespace-nowrap">
                  Class Type
                </th>
                <th className="py-3 px-3.5 font-bold tracking-wide border-r border-[#9eb73d] whitespace-nowrap">
                  Module Code
                </th>
                <th className="py-3 px-3.5 font-bold tracking-wide border-r border-[#9eb73d]">
                  Module Title
                </th>
                <th className="py-3 px-3.5 font-bold tracking-wide border-r border-[#9eb73d]">
                  Lecturer
                </th>
                <th className="py-3 px-3.5 font-bold tracking-wide border-r border-[#9eb73d] whitespace-nowrap">
                  Group
                </th>
                <th className="py-3 px-3.5 font-bold tracking-wide border-r border-[#9eb73d] whitespace-nowrap">
                  Block
                </th>
                <th className="py-3 px-3.5 font-bold tracking-wide whitespace-nowrap">
                  Room
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRoutine.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No timetable classes match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRoutine.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                    }`}
                  >
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      {row.day}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-700 border-r border-slate-200 whitespace-nowrap">
                      {row.time}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-800 border-r border-slate-200 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          row.classType === 'Lecture'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : row.classType === 'Tutorial'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {row.classType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      {row.moduleCode}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-900 border-r border-slate-200">
                      {row.moduleTitle}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 border-r border-slate-200 whitespace-nowrap">
                      {row.lecturer}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-700 border-r border-slate-200 whitespace-nowrap">
                      {row.group}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 border-r border-slate-200 whitespace-nowrap">
                      {row.block}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-slate-800 whitespace-nowrap">
                      <div className="flex items-center justify-between gap-3">
                        <span>{row.room}</span>
                        <a
                          href={getGoogleCalendarUrl(row)}
                          target="_blank"
                          rel="noreferrer"
                          title="Add this session to Google Calendar"
                          className="text-slate-400 hover:text-emerald-700 transition-colors p-1"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Timetable Footer Information */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>
              Official Schedule · Islington College Kamalpokhari Campus · Active Group: <strong>AI7</strong>
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Total Weekly Scheduled Sessions: 12 (Lectures: 4, Workshops: 4, Tutorials: 4)
          </div>
        </div>
      </div>
    </div>
  );
};
