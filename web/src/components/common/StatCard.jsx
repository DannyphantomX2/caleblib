const StatCard = ({ label, value, icon: Icon, color = '#3b82f6', sub, trend }) => (
  <div style={{
    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
    borderRadius: 'var(--radius)', padding: 22,
    boxShadow: 'var(--card-shadow)',
    display: 'flex', flexDirection: 'column', gap: 14
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={19} color={color} />
      </div>
    </div>
    <div>
      <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
        {value ?? '—'}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
)
export default StatCard
