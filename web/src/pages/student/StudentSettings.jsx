import { useAuth } from '../../context/AuthContext'
import { Moon, Sun, Shield, Bell } from 'lucide-react'

const StudentSettings = () => {
  const { theme, toggleTheme } = useAuth()

  const card = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--card-shadow)', marginBottom: 16 }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Settings</h1>

      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Appearance</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {theme === 'light' ? <Sun size={18} color="var(--text-secondary)" /> : <Moon size={18} color="var(--text-secondary)" />}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Theme</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Currently {theme} mode</div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              width: 48, height: 26, borderRadius: 13,
              background: theme === 'dark' ? 'var(--blue-600)' : 'var(--card-border)',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s'
            }}
          >
            <span style={{
              position: 'absolute', top: 3,
              left: theme === 'dark' ? 24 : 3,
              width: 20, height: 20, borderRadius: '50%',
              background: '#fff', transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Security & Privacy</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Information about how your data is handled</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: Shield, text: 'Your password is hashed with bcrypt — never stored in plain text' },
            { icon: Shield, text: 'All sessions use JWT tokens that expire after 7 days' },
            { icon: Shield, text: 'Login attempts are monitored — 5 failures locks your account for 15 minutes' },
            { icon: Bell, text: 'Download and login activity is logged for audit purposes' }
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <Icon size={14} color="var(--blue-500)" style={{ marginTop: 2, flexShrink: 0 }} />
              {text}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <a href="/privacy-policy" style={{ fontSize: 13, color: 'var(--blue-600)', fontWeight: 600 }}>
            Read full Privacy Policy →
          </a>
        </div>
      </div>
    </div>
  )
}
export default StudentSettings
