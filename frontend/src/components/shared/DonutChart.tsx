/**
 * Reusable Present/Late/Absent donut (Recharts Pie underneath) with a
 * number + label absolutely centered over the ring. Used by both the
 * student and parent dashboards to summarize one course or the whole term.
 */
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DonutChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}

export default function DonutChart({ data, centerValue, centerLabel, size = 200 }: DonutChartProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.32}
            outerRadius={size * 0.42}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{
          fontSize: size * 0.16,
          fontWeight: '700',
          color: '#0f172a',
          lineHeight: 1
        }}>
          {centerValue}
        </div>
        <div style={{
          fontSize: size * 0.06,
          color: '#64748b',
          marginTop: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: '600'
        }}>
          {centerLabel}
        </div>
      </div>
    </div>
  );
}
