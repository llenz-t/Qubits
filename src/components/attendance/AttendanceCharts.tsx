import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { LtwRates, WeeklyTrendPoint, ScholarshipZone, SCHOLARSHIP_ZONE_META } from '../../types/aaa';

const ZONE_HEX: Record<ScholarshipZone, string> = {
  GREEN: '#22c55e',
  YELLOW: '#eab308',
  RED: '#ef4444',
};

function zoneColorForRate(rate: number): string {
  if (rate >= 80) return ZONE_HEX.GREEN;
  if (rate >= 70) return ZONE_HEX.YELLOW;
  return ZONE_HEX.RED;
}

interface OverallDonutProps {
  rate: number;
  zone: ScholarshipZone;
}

/** Overall Attendance Donut Chart - conditional fill by AAA zone. */
export const OverallAttendanceDonut: React.FC<OverallDonutProps> = ({ rate, zone }) => {
  const clamped = Math.max(0, Math.min(100, rate));
  const color = zoneColorForRate(clamped);
  const data = [
    { name: 'Attended', value: clamped },
    { name: 'Remaining', value: 100 - clamped },
  ];

  return (
    <div className="relative w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="70%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill={color} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-neutral-900">{clamped.toFixed(1)}%</span>
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>
          {SCHOLARSHIP_ZONE_META[zone].label}
        </span>
      </div>
    </div>
  );
};

interface LtwBarChartProps {
  rates: LtwRates;
}

/** L-T-W Component Bar Chart - side by side comparison. */
export const LtwBarChart: React.FC<LtwBarChartProps> = ({ rates }) => {
  const data = [
    { name: 'Lecture', rate: rates.lectureRate },
    { name: 'Tutorial', rate: rates.tutorialRate },
    { name: 'Workshop', rate: rates.workshopRate },
  ];

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600, fill: '#525252' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Rate']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          <Bar dataKey="rate" radius={[8, 8, 0, 0]} maxBarSize={56}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={zoneColorForRate(entry.rate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface WeeklyTrendLineChartProps {
  points: WeeklyTrendPoint[];
}

/** Weekly Performance Line Graph - momentum trend across the semester. */
export const WeeklyTrendLineChart: React.FC<WeeklyTrendLineChartProps> = ({ points }) => {
  const data = points.map((p) => ({
    week: new Date(p.weekStart + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    rate: p.attendanceRate,
  }));

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Attendance']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          {/* Reference bands for the AAA zones would clutter a thin sparkline-style
              chart at this size, so the zone is conveyed via the donut/badge instead. */}
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#0c3830"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#0c3830' }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
