/**
 * The "Choose your portal" card grid on the landing page. Selecting a
 * card just sets App's `portal` state — there's no routing involved.
 * Copy/bullets here are pulled straight from the ClassPulse wireframe.
 */
import { GraduationCap, UsersFour, ShieldCheck, Check } from '@phosphor-icons/react';

export type Portal = 'admin' | 'student' | 'parent';

const portals = [
  {
    id: 'student' as const,
    title: 'Student Portal',
    description: 'See attendance, get an automatic alert before it becomes a problem, submit justifications.',
    icon: GraduationCap,
    color: '#3b82f6',
    bullets: [
      'Auto alert on band change (Cautionary/Debarred)',
      'Attendance % + margin left',
      'Justification upload'
    ]
  },
  {
    id: 'parent' as const,
    title: 'Parent Portal',
    description: 'Direct, read-only access — no more asking staff to relay attendance or exam-clearance status.',
    icon: UsersFour,
    color: '#8b5cf6',
    bullets: [
      'Phone-verified login (no staff relay)',
      'Same alerts as student, read-only',
      'Exam clearance / results view'
    ]
  },
  {
    id: 'admin' as const,
    title: 'Admin Console',
    description: 'The automation engine’s control room — see who the rules flagged, review, and send.',
    icon: ShieldCheck,
    color: '#059669',
    bullets: [
      'Auto-built Absence Pool queue',
      'One-click urgent notice, flagged channel',
      'Escalation levels config'
    ]
  }
];

export function PortalSwitcher({ onSelect }: { onSelect: (portal: Portal) => void }) {
  return (
    <div style={{display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'}}>
      {portals.map((portal) => (
        <button
          key={portal.id}
          onClick={() => onSelect(portal.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '2rem',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '1rem',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = portal.color;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.5rem',
            height: '3.5rem',
            backgroundColor: `${portal.color}15`,
            borderRadius: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <portal.icon size={26} weight="duotone" color={portal.color} />
          </div>
          <h3 style={{fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem'}}>
            {portal.title}
          </h3>
          <p style={{fontSize: '0.9375rem', lineHeight: '1.5', color: '#64748b', marginBottom: '1.25rem'}}>
            {portal.description}
          </p>
          <ul style={{listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'grid', gap: '0.5rem', width: '100%'}}>
            {portal.bullets.map((bullet) => (
              <li key={bullet} style={{display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569'}}>
                <Check size={14} weight="bold" color={portal.color} style={{marginTop: '3px', flexShrink: 0}} />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: portal.color,
            marginTop: 'auto'
          }}>
            Enter
            <span style={{fontSize: '1rem'}}>→</span>
          </div>
        </button>
      ))}
    </div>
  );
}
