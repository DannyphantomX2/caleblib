import { useAuth } from '../../context/AuthContext'
import { Moon, Sun, Shield } from 'lucide-react'

const StaffSettings = () => {
  const { theme, toggleTheme } = useAuth()
  const card = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--card-shadow)', marginBottom: 16 }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Settings</h1>
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Appearance</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {theme === 'light' ? <Sun size={18} color="var(--text-secondary)" /> : <Moon size={18} color="var(--text-secondary)" />}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Theme</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Currently {theme} mode</div>
            </div>
          </div>
          <button onClick={toggleTheme} style={{ width: 48, height: 26, borderRadius: 13, background: theme === 'dark' ? '#059669' : 'var(--card-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <span style={{ position: 'absolute', top: 3, left: theme === 'dark' ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </button>
        </div>
      </div>
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={15} color="var(--staff-color)" /> Security
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Staff accounts are managed by administrators. Contact your system admin to change your email or employee ID. All resource uploads and actions are logged in the system audit trail.
        </p>
        <a href="/privacy-policy" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#059669', fontWeight: 600 }}>Read Privacy Policy →</a>
      </div>
    </div>
  )
}
export default StaffSettings
