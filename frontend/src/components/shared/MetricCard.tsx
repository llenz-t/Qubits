/** Small stat tile (icon + label + big number, optional subtitle) used across all three dashboards. */
import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  subtitle?: string;
}

export default function MetricCard({ label, value, icon, color = '#64748b', subtitle }: MetricCardProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}>
            {icon}
          </div>
        )}
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {label}
        </div>
      </div>
      <div style={{
        fontSize: '32px',
        fontWeight: '700',
        color: '#0f172a',
        lineHeight: 1
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{
          fontSize: '13px',
          color: '#94a3b8'
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
