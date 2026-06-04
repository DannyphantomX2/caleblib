import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Bell, Sun, Moon, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Spinner from './Spinner'

const PageShell = ({ nav, children, role = 'student' }) => {
  const [open, setOpen] = useState(true)
  const { user, logout, theme, toggleTheme } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const roleLabel = { student: 'Student Portal', staff: 'Staff Portal', admin: 'Admin Panel' }
  const loginPath = { student: '/login/student', staff: '/login/staff', admin: '/login/admin' }

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate(loginPath[role] || '/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--page-bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: open ? 'var(--sidebar-width)' : 0,
        minWidth: open ? 'var(--sidebar-width)' : 0,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh'
      }}>
        <div style={{ width: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--sidebar-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: '0 4px 12px rgba(59,130,246,0.35)'
              }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'var(--font)', letterSpacing: '-0.03em' }}>C</span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>CalebLib</div>
                <div style={{ fontSize: 10, color: 'var(--sidebar-text)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 1 }}>
                  {roleLabel[role]}
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
            {nav.map(group => (
              <div key={group.label} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#3a506b', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px 6px' }}>
                  {group.label}
                </div>
                {group.items.map(({ to, icon: Icon, label, badge }) => (
                  <NavLink key={to} to={to} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
                    {({ isActive }) => (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        padding: '9px 10px', borderRadius: 9,
                        background: isActive ? 'var(--sidebar-active)' : 'transparent',
                        color: isActive ? '#fff' : 'var(--sidebar-text)',
                        transition: 'var(--transition)', cursor: 'pointer',
                        fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                        borderLeft: isActive ? '3px solid var(--sidebar-accent)' : '3px solid transparent'
                      }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--sidebar-hover)' }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                      >
                        <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                        <span style={{ flex: 1 }}>{label}</span>
                        {badge > 0 && (
                          <span style={{ background: '#ef4444', color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                            {badge > 99 ? '99+' : badge}
                          </span>
                        )}
                        {isActive && <ChevronRight size={13} style={{ opacity: 0.6 }} />}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* User card */}
          <div style={{ padding: '12px 10px', borderTop: '1px solid var(--sidebar-border)' }}>
            <div style={{ padding: '10px', background: 'var(--sidebar-bg-2)', borderRadius: 10, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 1 }}>{user?.fullName}</div>
              <div style={{ fontSize: 11, color: 'var(--sidebar-text)' }}>{user?.email}</div>
              {user?.matricNumber && <div style={{ fontSize: 10, color: '#3b82f6', marginTop: 3, fontWeight: 600 }}>{user.matricNumber} · {user.academicLevel}L</div>}
              {user?.employeeId && <div style={{ fontSize: 10, color: '#10b981', marginTop: 3, fontWeight: 600 }}>ID: {user.employeeId}</div>}
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '8px', background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, color: '#f87171', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'var(--transition)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            >
              {loggingOut ? <Spinner size={14} color="#f87171" /> : <LogOut size={14} />}
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 'var(--navbar-height)',
          background: 'var(--card-bg)',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: 12,
          position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 1px 0 var(--card-border)'
        }}>
          <button
            onClick={() => setOpen(p => !p)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 6, borderRadius: 8, transition: 'var(--transition)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--page-bg-2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={toggleTheme}
            style={{ background: 'none', border: '1.5px solid var(--card-border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 7, borderRadius: 8, transition: 'var(--transition)' }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px',
            background: 'var(--page-bg-2)',
            borderRadius: 8, border: '1.5px solid var(--card-border)'
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: role === 'student' ? 'var(--student-bg)' : role === 'staff' ? 'var(--staff-bg)' : 'var(--admin-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: role === 'student' ? 'var(--student-color)' : role === 'staff' ? 'var(--staff-color)' : 'var(--admin-color)'
            }}>
              {user?.fullName?.[0]}
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.fullName?.split(' ')[0]}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: role === 'student' ? 'var(--student-color)' : role === 'staff' ? 'var(--staff-color)' : 'var(--admin-color)' }}>
                {role}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default PageShell
