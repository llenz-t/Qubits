/**
 * Root component and top-level router. There is no client-side routing
 * library: the app is a single state machine that shows the marketing
 * landing page when no portal is chosen, and swaps in the matching
 * perspective (Admin / Student / Parent) once one is.
 */
import { useState } from 'react';
import { PortalSwitcher, type Portal } from './perspectives/PortalSwitcher';
import AdminPerspective from './perspectives/AdminPerspective';
import StudentPerspective from './perspectives/StudentPerspective';
import ParentPerspective from './perspectives/ParentPerspective';
import LandingHero from './components/landing/LandingHero';
import LandingFeatures from './components/landing/LandingFeatures';
import LandingFooter from './components/landing/LandingFooter';

const BRAND = '#7c1d2c';

export default function App() {
  // undefined = still on the landing page; set once a portal card is picked.
  const [portal, setPortal] = useState<Portal>();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header style={{borderBottom: '1px solid #e2e8f0', backgroundColor: 'white'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'}}>
          <button
            onClick={() => setPortal(undefined)}
            style={{display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'}}
          >
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem',
              backgroundColor: BRAND, color: 'white', fontWeight: '700', fontSize: '1rem', flexShrink: 0
            }}>C</span>
            <span>
              <span style={{display: 'block', fontSize: '1.0625rem', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.01em', lineHeight: '1.2'}}>ClassPulse</span>
              <span style={{display: 'block', fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.2'}}>Automated Attendance &amp; Alerts · Islington College</span>
            </span>
          </button>

          {!portal ? (
            <nav style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
              <a href="#features" style={{fontSize: '0.875rem', fontWeight: '500', color: '#475569', textDecoration: 'none'}}>How it works</a>
              <a href="#portals" style={{fontSize: '0.875rem', fontWeight: '500', color: '#475569', textDecoration: 'none'}}>For Staff</a>
              <a
                href="#portals"
                style={{
                  padding: '0.5rem 1.25rem', backgroundColor: BRAND, color: 'white',
                  borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none'
                }}
              >
                Log In
              </a>
            </nav>
          ) : (
            <button
              onClick={() => setPortal(undefined)}
              style={{fontSize: '0.875rem', fontWeight: '500', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer'}}
            >
              ← Switch portal
            </button>
          )}
        </div>
      </header>
      {!portal ? (
        <>
          <LandingHero />
          <LandingFeatures />
          <div id="portals" style={{padding: '6rem 1.25rem', backgroundColor: '#f8fafc'}}>
            <div style={{maxWidth: '1200px', margin: '0 auto'}}>
              <h2 style={{fontSize: '2.25rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#0f172a', marginBottom: '1rem'}}>
                Choose your portal
              </h2>
              <p style={{fontSize: '1rem', color: '#64748b', marginBottom: '3rem', maxWidth: '36rem'}}>
                Select the portal that matches your role to access attendance data and management tools.
              </p>
              <PortalSwitcher onSelect={setPortal} />
            </div>
          </div>
          <LandingFooter />
        </>
      ) : (
        <div className="mx-auto max-w-6xl px-5 py-10">
          {portal === 'admin' ? (
            <AdminPerspective />
          ) : portal === 'student' ? (
            <StudentPerspective />
          ) : (
            <ParentPerspective />
          )}
        </div>
      )}
    </div>
  );
}