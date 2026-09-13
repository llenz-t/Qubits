/** Landing page footer: copyright line plus anchor links back up the page. */
export default function LandingFooter() {
  return (
    <footer style={{padding: '3rem 1.25rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem'}}>
        <p style={{fontSize: '0.875rem', color: '#64748b'}}>
          © 2026 ClassPulse. Islington College.
        </p>
        <div style={{display: 'flex', gap: '2rem'}}>
          <a href="#portals" style={{fontSize: '0.875rem', color: '#64748b', textDecoration: 'none'}}>
            Access Portal
          </a>
          <a href="#features" style={{fontSize: '0.875rem', color: '#64748b', textDecoration: 'none'}}>
            Features
          </a>
        </div>
      </div>
    </footer>
  );
}
