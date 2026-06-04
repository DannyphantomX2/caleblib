const colors = {
  blue: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  green: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  yellow: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  red: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  purple: { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
  gray: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
  teal: { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
  orange: { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' }
}

const Badge = ({ children, color = 'blue', dot = false, style = {} }) => {
  const c = colors[color] || colors.blue
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      background: c.bg, color: c.text,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap', ...style
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.text, flexShrink: 0 }} />}
      {children}
    </span>
  )
}
export default Badge
