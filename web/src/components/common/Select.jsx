import { useState } from 'react'

const Select = ({ label, value, onChange, options = [], required, error, style = {} }) => {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', gap: 3 }}>
          {label}{required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        style={{
          padding: '10px 14px',
          background: 'var(--card-bg)',
          border: `1.5px solid ${error ? '#ef4444' : focused ? 'var(--blue-500)' : 'var(--card-border)'}`,
          borderRadius: 10,
          color: 'var(--text-primary)', fontSize: 14,
          cursor: 'pointer', transition: 'var(--transition)',
          boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none'
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p style={{ fontSize: 12, color: '#ef4444' }}>{error}</p>}
    </div>
  )
}
export default Select
