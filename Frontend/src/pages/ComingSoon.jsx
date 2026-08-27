export default function ComingSoon({ title, phase }) {
  return (
    <div className="page">
      <div className="container">
        <div className="hero marquee-frame">
          <div style={{ padding: '48px 40px', textAlign: 'center' }}>
            <span className="eyebrow">Coming in Phase {phase}</span>
            <h1 className="display hero-title" style={{ fontSize: 48 }}>{title}</h1>
            <p className="hero-subtitle" style={{ margin: '0 auto' }}>
              This part of MovieTime is scaffolded and lands in the next build phase.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
