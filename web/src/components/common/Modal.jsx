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
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, animation: 'fadeIn 0.18s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.75)',
          borderRadius: 'var(--radius-lg)',
          width: '100%', maxWidth: widths[size],
          maxHeight: '90vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
          animation: 'fadeUp 0.22s cubic-bezier(0.34,1.56,0.64,1)'
        }}
      >
        {/* Modal chrome */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(226,232,240,0.6)',
          background: 'rgba(255,255,255,0.5)'
        }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(241,245,249,0.8)', border: '1px solid rgba(226,232,240,0.6)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', padding: 6, borderRadius: 8,
              transition: 'var(--transition)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(226,232,240,0.9)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(241,245,249,0.8)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <X size={17} />
          </button>
        </div>
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid rgba(226,232,240,0.6)',
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            background: 'rgba(248,250,252,0.5)'
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
export default Modal
