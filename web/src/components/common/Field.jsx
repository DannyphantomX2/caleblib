import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Field = ({
  label, type = 'text', value, onChange, placeholder,
  error, required, disabled, hint, icon, style = {}
}) => {
  const [show, setShow] = useState(false)
  const [focused, setFocused] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', gap: 3 }}>
          {label}{required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused ? 'var(--blue-500)' : 'var(--text-muted)', display: 'flex', pointerEvents: 'none', transition: 'color 0.15s' }}>
            {icon}
          </span>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={{
            width: '100%',
            padding: `10px ${isPassword ? '40px' : '14px'} 10px ${icon ? '40px' : '14px'}`,
            background: disabled ? 'var(--page-bg-2)' : 'var(--card-bg)',
            border: `1.5px solid ${error ? '#ef4444' : focused ? 'var(--blue-500)' : 'var(--card-border)'}`,
            borderRadius: 10,
            color: 'var(--text-primary)', fontSize: 14,
            transition: 'var(--transition)',
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.7 : 1,
            boxShadow: focused ? (error ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 0 0 3px rgba(59,130,246,0.1)') : 'none'
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(p => !p)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 2 }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
}
export default Field
