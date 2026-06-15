const StatCard = ({ label, value, icon: Icon, color = '#3b82f6', sub }) => (
  <div style={{
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(18px) saturate(180%)',
    WebkitBackdropFilter: 'blur(18px) saturate(180%)',
    border: `1px solid rgba(255,255,255,0.65)`,
    borderTop: `2px solid ${color}`,
    borderRadius: 'var(--radius)',
    padding: 22,
    boxShadow: `0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)`,
    display: 'flex', flexDirection: 'column', gap: 14,
    transition: 'all 0.2s ease',
    position: 'relative', overflow: 'hidden'
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.09), 0 0 0 1px rgba(255,255,255,0.5), 0 0 20px ${color}18` }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)` }}
  >
    {/* Subtle color glow in corner */}
    <div style={{
      position: 'absolute', top: -20, right: -20,
      width: 80, height: 80, borderRadius: '50%',
      background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
      pointerEvents: 'none'
    }} />

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
      <div style={{
        width: 40, height: 40, borderRadius: 11,
        background: `linear-gradient(145deg, rgba(255,255,255,0.9) 0%, ${color}22 100%)`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 2px 8px ${color}20, inset 0 1px 0 rgba(255,255,255,0.8)`
      }}>
        <Icon size={19} color={color} />
      </div>
    </div>

    <div style={{ position: 'relative' }}>
      <div style={{
        fontSize: 32, fontWeight: 900, color: 'var(--text-primary)',
        lineHeight: 1, letterSpacing: '-0.04em'
      }}>
        {value ?? '—'}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5, fontWeight: 500 }}>{sub}</div>}
    </div>
  </div>
)
export default StatCard
