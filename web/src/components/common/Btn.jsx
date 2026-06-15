import { forwardRef } from 'react'
import Spinner from './Spinner'

const glassShine = 'linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 45%, transparent 100%)'

const variants = {
  primary: {
    base: {
      background: `${glassShine}, linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)`,
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.28)',
      boxShadow: '0 4px 14px rgba(59,130,246,0.45), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.22)'
    },
    hover: {
      background: `${glassShine}, linear-gradient(135deg, #4b96ff 0%, #3b82f6 100%)`,
      boxShadow: '0 8px 22px rgba(59,130,246,0.55), 0 2px 6px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.28)',
      transform: 'translateY(-2px)'
    }
  },
  secondary: {
    base: {
      background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: 'var(--text-primary)',
      border: '1px solid rgba(203,213,225,0.7)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)'
    },
    hover: {
      background: 'rgba(255,255,255,0.92)',
      boxShadow: '0 4px 14px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,1)',
      transform: 'translateY(-1px)'
    }
  },
  danger: {
    base: {
      background: `${glassShine}, linear-gradient(135deg, #f87171 0%, #ef4444 100%)`,
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.22)',
      boxShadow: '0 4px 14px rgba(239,68,68,0.42), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.18)'
    },
    hover: {
      background: `${glassShine}, linear-gradient(135deg, #ff8080 0%, #f87171 100%)`,
      boxShadow: '0 8px 22px rgba(239,68,68,0.52), inset 0 1px 0 rgba(255,255,255,0.22)',
      transform: 'translateY(-2px)'
    }
  },
  success: {
    base: {
      background: `${glassShine}, linear-gradient(135deg, #34d399 0%, #10b981 100%)`,
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.22)',
      boxShadow: '0 4px 14px rgba(16,185,129,0.42), inset 0 1px 0 rgba(255,255,255,0.2)'
    },
    hover: {
      background: `${glassShine}, linear-gradient(135deg, #4aeaaa 0%, #34d399 100%)`,
      boxShadow: '0 8px 22px rgba(16,185,129,0.52), inset 0 1px 0 rgba(255,255,255,0.25)',
      transform: 'translateY(-2px)'
    }
  },
  ghost: {
    base: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
      boxShadow: 'none'
    },
    hover: {
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(203,213,225,0.5)',
      color: 'var(--text-primary)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }
  },
  outline: {
    base: {
      background: 'rgba(239,246,255,0.5)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      color: 'var(--blue-600)',
      border: '1.5px solid rgba(59,130,246,0.4)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)'
    },
    hover: {
      background: 'rgba(239,246,255,0.85)',
      border: '1.5px solid rgba(59,130,246,0.65)',
      boxShadow: '0 4px 14px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
      transform: 'translateY(-1px)'
    }
  },
  link: {
    base: { background: 'transparent', color: 'var(--blue-600)', border: 'none', boxShadow: 'none', padding: '0' },
    hover: { color: 'var(--blue-700)' }
  }
}

const sizes = {
  xs: { padding: '4px 10px', fontSize: 12, borderRadius: 7, gap: 4 },
  sm: { padding: '6px 13px', fontSize: 13, borderRadius: 8, gap: 5 },
  md: { padding: '9px 18px', fontSize: 14, borderRadius: 10, gap: 7 },
  lg: { padding: '12px 24px', fontSize: 15, borderRadius: 10, gap: 8 }
}

const Btn = forwardRef(({ children, onClick, type = 'button', variant = 'primary', size = 'md', disabled, loading, fullWidth, style = {}, icon }, ref) => {
  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.md

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap, padding: s.padding, fontSize: s.fontSize,
        fontFamily: 'var(--font)', fontWeight: 600,
        borderRadius: s.radius || 10,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        position: 'relative',
        overflow: 'hidden',
        ...v.base,
        ...style
      }}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, v.hover)
        }
      }}
      onMouseLeave={e => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, v.base, style)
          e.currentTarget.style.transform = ''
        }
      }}
      onMouseDown={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'translateY(0px) scale(0.97)' }}
      onMouseUp={e => { if (!disabled && !loading) Object.assign(e.currentTarget.style, v.hover) }}
    >
      {loading ? <Spinner size={14} color={['primary','danger','success'].includes(variant) ? '#fff' : 'var(--blue-500)'} /> : icon}
      {children}
    </button>
  )
})

Btn.displayName = 'Btn'
export default Btn
