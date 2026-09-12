import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, LucideIcon } from 'lucide-react';
import { ScholarshipZone, SCHOLARSHIP_ZONE_META } from '../../types/aaa';

interface AAAScholarshipBadgeProps {
  zone: ScholarshipZone;
  rate: number;
  size?: 'sm' | 'lg';
}

const ZONE_ICON: Record<ScholarshipZone, LucideIcon> = {
  GREEN: ShieldCheck,
  YELLOW: ShieldAlert,
  RED: ShieldX,
};

export const AAAScholarshipBadge: React.FC<AAAScholarshipBadgeProps> = ({ zone, rate, size = 'lg' }) => {
  const meta = SCHOLARSHIP_ZONE_META[zone];
  const Icon = ZONE_ICON[zone];
  const isLarge = size === 'lg';

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-2xl border ${isLarge ? 'px-4 py-3' : 'px-3 py-1.5'}`}
      style={{ backgroundColor: meta.bg, borderColor: meta.ring }}
      title={`AAA Scholarship: ${meta.label} (${rate}% aggregate attendance)`}
    >
      <Icon size={isLarge ? 22 : 15} />
      <div className="flex flex-col leading-tight">
        <span className={`font-bold ${isLarge ? 'text-sm' : 'text-xs'}`} style={{ color: meta.color }}>
          {meta.label}
        </span>
        {isLarge && (
          <span className="text-[11px] font-semibold opacity-80" style={{ color: meta.color }}>
            AAA Scholarship &middot; {rate}%
          </span>
        )}
      </div>
    </div>
  );
};
