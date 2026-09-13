/**
 * Landing page hero. Copy and layout (badge, headline, dual CTA, the
 * Daily/Instant/Flagged stat row) are lifted directly from the
 * ClassPulse wireframe rather than invented — see the project README.
 */
const BRAND = '#7c1d2c';

export default function LandingHero() {
  return (
    <section style={{padding: '6rem 1.25rem 4rem', backgroundColor: '#f8fafc'}}>
      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        textAlign: 'center',
        animation: 'rise-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.5rem 1rem',
          borderRadius: '999px',
          border: '1px solid #e2e8f0',
          backgroundColor: 'white',
          fontSize: '0.8125rem',
          fontWeight: '600',
          color: '#64748b',
          marginBottom: '2rem'
        }}>
          Islington College · Automating Student Services Hackathon
        </div>

        <h1 style={{fontSize: '3rem', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-0.02em', color: '#0f172a', marginBottom: '1.5rem'}}>
          One attendance alert, three people informed — automatically.
        </h1>

        <p style={{fontSize: '1.0625rem', lineHeight: '1.7', color: '#64748b', maxWidth: '640px', margin: '0 auto 2.5rem'}}>
          Problem 3 — low attendance found too late — is the trigger. Fixing it automatically notifies parents
          (Problem 2) through a clearly-flagged urgent channel (Problem 5). One rule engine, three problems solved.
        </p>

        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3.5rem'}}>
          <a
            href="#portals"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.75rem',
              backgroundColor: BRAND,
              color: 'white',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#651522')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
          >
            Select Your Portal →
          </a>
          <a
            href="#features"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.875rem 1.75rem',
              backgroundColor: 'white',
              color: '#0f172a',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              textDecoration: 'none',
              border: '1px solid #e2e8f0',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          >
            See the Automation Flow
          </a>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '2rem',
          maxWidth: '640px',
          margin: '0 auto'
        }}>
          {[
            { title: 'Daily', desc: 'attendance check (not weekly)' },
            { title: 'Instant', desc: 'parent notification, no staff relay' },
            { title: 'Flagged', desc: 'urgent notices can’t hide in inbox' }
          ].map((stat) => (
            <div key={stat.title}>
              <div style={{fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem'}}>{stat.title}</div>
              <div style={{fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5'}}>{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
