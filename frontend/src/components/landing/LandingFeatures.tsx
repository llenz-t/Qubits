/** "Built for daily use" section: a static, no-data feature summary shown below the hero. */
export default function LandingFeatures() {
  const features = [
    {
      title: 'Real-time tracking',
      description: 'Attendance records updated instantly as classes are held. No delays, no gaps.',
    },
    {
      title: 'Transparent reporting',
      description: 'Students and parents see the same data. Clear metrics, no surprises.',
    },
    {
      title: 'Justification workflow',
      description: 'Submit absence justifications with supporting documents. Track review status.',
    },
    {
      title: 'Bulk operations',
      description: 'Adjust class schedules for holidays or events across programmes in seconds.',
    },
  ];

  return (
    <section id="features" style={{padding: '6rem 1.25rem', backgroundColor: 'white'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto'}}>
        <h2 style={{fontSize: '2.25rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#0f172a', marginBottom: '3rem'}}>
          Built for daily use
        </h2>
        <div style={{display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'}}>
          {features.map((feature) => (
            <div key={feature.title}>
              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.75rem'}}>
                {feature.title}
              </h3>
              <p style={{fontSize: '1rem', lineHeight: '1.6', color: '#64748b'}}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
