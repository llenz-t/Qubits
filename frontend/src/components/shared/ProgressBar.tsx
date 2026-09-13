/**
 * Labeled "value of max" bar with an optional leading icon and percentage.
 * Generic by design — used for present/late/absent breakdowns and for
 * the attendance safety-margin indicator, just with different props.
 */
import { CheckCircle, XCircle, Clock, Calendar } from '@phosphor-icons/react';

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  icon?: 'present' | 'absent' | 'late' | 'total';
  showPercentage?: boolean;
}

const iconMap = {
  present: CheckCircle,
  absent: XCircle,
  late: Clock,
  total: Calendar
};

export default function ProgressBar({
  label,
  value,
  max,
  color,
  icon,
  showPercentage = true
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  const Icon = icon ? iconMap[icon] : null;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {Icon && (
            <Icon size={20} weight="fill" color={color} />
          )}
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#475569'
          }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#0f172a'
          }}>
            {value}
          </span>
          <span style={{
            fontSize: '14px',
            color: '#94a3b8'
          }}>
            of {max}
          </span>
          {showPercentage && (
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: color,
              marginLeft: '8px'
            }}>
              {percentage}%
            </span>
          )}
        </div>
      </div>
      <div style={{
        height: '8px',
        backgroundColor: '#f1f5f9',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: '100%',
          transform: `scaleX(${percentage / 100})`,
          transformOrigin: 'left',
          backgroundColor: color,
          borderRadius: '4px',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />
      </div>
    </div>
  );
}
