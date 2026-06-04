import Spinner from './Spinner'

const variants = {
  primary: { bg: 'var(--blue-600)', text: '#fff', border: 'transparent', hoverBg: 'var(--blue-700)' },
  secondary: { bg: 'var(--card-bg)', text: 'var(--text-primary)', border: 'var(--card-border)', hoverBg: 'var(--page-bg-2)' },
  danger: { bg: '#ef4444', text: '#fff', border: 'transparent', hoverBg: '#dc2626' },
  ghost: { bg: 'transparent', text: 'var(--text-secondary)', border: 'transparent', hoverBg: 'var(--page-bg-2)' },
  outline: { bg: 'transparent', text: 'var(--blue-600)', border: 'var(--blue-200)', hoverBg: 'var(--blue-50)' },
  success: { bg: '#10b981', text: '#fff', border: 'transparent', hoverBg: '#059669' }
}

const sizes = {
  xs: { padding: '4px 10px', fontSize: 12, radius: 6, gap: 5 },
  sm: { padding: '6px 14px', fontSize: 13, radius: 8, gap: 6 },
  md: { padding: '9px 18px', fontSize: 14, radius: 10, gap: 7 },
  lg: { padding: '12px 24px', fontSize: 15, radius: 10, gap: 8 }
}

const Btn = ({ children, onClick, type = 'button', variant = 'primary', size = 'md', disabled, loading, fullWidth, style = {}, icon }) => {
  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.md
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap, padding: s.padding, fontSize: s.fontSize,
        fontFamily: 'var(--font)', fontWeight: 600,
        borderRadius: s.radius, border: `1.5px solid ${v.border}`,
        background: v.bg, color: v.text,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'var(--transition)',
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        ...style
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = v.hoverBg }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.background = v.bg }}
    >
      {loading ? <Spinner size={14} color={variant === 'primary' || variant === 'danger' || variant === 'success' ? '#fff' : 'var(--blue-500)'} /> : icon}
      {children}
    </button>
  )
}
export default Btn
