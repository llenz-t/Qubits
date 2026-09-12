import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHolidayDetails } from '../utils/calendar2083';

interface HolidayCalendarProps {
  initialDate?: string;
}

export const HolidayCalendar: React.FC<HolidayCalendarProps> = ({
  initialDate = '2026-09-01',
}) => {
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const d = new Date(initialDate);
    return isNaN(d.getTime()) ? 2026 : d.getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const d = new Date(initialDate);
    return isNaN(d.getTime()) ? 8 : d.getMonth(); // 8 = September
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Construct weeks grid
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(new Date(currentYear, currentMonth, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="border border-neutral-200 rounded-2xl bg-white shadow-xs overflow-hidden">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 cursor-pointer transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            <select
              id="calendar-month-select"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="text-base font-bold text-neutral-900 bg-white border border-neutral-200 rounded-lg px-2.5 py-1 cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
            <select
              id="calendar-year-select"
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="text-base font-bold text-neutral-900 bg-white border border-neutral-200 rounded-lg px-2 py-1 cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#0c3830]"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 cursor-pointer transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Table connected directly to outer box */}
      <div className="overflow-x-auto border-t border-neutral-200">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-sm font-bold text-neutral-800">
              {dayHeaders.map((dh, i) => (
                <th
                  key={dh}
                  className={`w-[14.2857%] py-2.5 px-2.5 text-center border-r border-neutral-200 last:border-r-0 ${
                    i === 6 ? 'text-rose-600 bg-rose-50/30' : ''
                  }`}
                >
                  {dh}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wIdx) => (
              <tr key={wIdx} className="border-b border-neutral-200 last:border-b-0">
                {week.map((dayDate, dIdx) => {
                  if (!dayDate) {
                    return (
                      <td
                        key={`empty-${wIdx}-${dIdx}`}
                        className="w-[14.2857%] h-14 sm:h-16 p-2 sm:p-2.5 border-r border-neutral-200 last:border-r-0 bg-neutral-50/40"
                      />
                    );
                  }

                  const info = getHolidayDetails(dayDate);
                  const dayNum = dayDate.getDate();
                  const isSaturday = dIdx === 6 || info.isSaturday;
                  const hasHolidayName = info.isHoliday && !isSaturday && info.name && info.name !== 'Saturday (Weekly Off)';

                  return (
                    <td
                      key={dayNum}
                      className={`w-[14.2857%] h-14 sm:h-16 p-2 sm:p-2.5 border-r border-neutral-200 last:border-r-0 align-top transition-colors ${
                        hasHolidayName
                          ? 'bg-rose-50/40 text-rose-900'
                          : isSaturday
                          ? 'bg-neutral-50/20 text-rose-600'
                          : 'bg-white text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm sm:text-base font-bold leading-none ${
                            isSaturday || info.isHoliday
                              ? 'text-rose-600'
                              : 'text-neutral-800'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {/* Show red dot only for special holidays, NOT for regular Saturday */}
                        {hasHolidayName && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                        )}
                      </div>

                      {/* Show holiday title only for actual holidays, not for Saturday */}
                      {hasHolidayName && (
                        <div
                          title={info.name}
                          className="text-xs font-semibold leading-tight text-rose-700 line-clamp-2"
                        >
                          {info.name}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
