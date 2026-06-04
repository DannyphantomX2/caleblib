import { useEffect } from 'react'
import { X } from 'lucide-react'

const Modal = ({ open, onClose, title, children, size = 'md', footer }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const widths = { sm: 440, md: 560, lg: 720, xl: 900 }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, animation: 'fadeIn 0.15s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)',
          width: '100%', maxWidth: widths[size],
          maxHeight: '90vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--card-shadow-lg)',
          animation: 'fadeUp 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--card-border)' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 6, transition: 'var(--transition)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--page-bg-2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>{footer}</div>}
      </div>
    </div>
  )
}
export default Modal
