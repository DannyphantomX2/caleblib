import { useAuth } from '../../context/AuthContext'
import { Moon, Sun, Shield, Activity } from 'lucide-react'

const AdminSettings = () => {
  const { theme, toggleTheme } = useAuth()
  const card = {
    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
    borderRadius: 'var(--radius)', padding: 24,
    boxShadow: 'var(--card-shadow)', marginBottom: 16
  }

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
          <button onClick={toggleTheme} style={{
            width: 48, height: 26, borderRadius: 13,
            background: theme === 'dark' ? 'var(--admin-color)' : 'var(--card-border)',
            border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
          }}>
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
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={15} color="var(--admin-color)" /> System Information
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
          CalebLib v1.0 · Caleb University CS Department · Node.js + MongoDB Atlas
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'JWT authentication with 7-day token expiry',
            'bcrypt password hashing (12 salt rounds)',
            'Account lockout after 5 failed login attempts',
            'All actions logged with IP address and timestamp',
            'GridFS file storage with original filename preservation',
            'Rate limiting: 200 requests per 15 minutes globally'
          ].map(item => (
            <div key={item} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <Shield size={13} color="var(--admin-color)" style={{ marginTop: 2, flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
        <a href="/privacy-policy" style={{ display: 'inline-block', marginTop: 16, fontSize: 13, color: 'var(--admin-color)', fontWeight: 600 }}>
          Read Privacy Policy →
        </a>
      </div>
    </div>
  )
}
export default AdminSettings
