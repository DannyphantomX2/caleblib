import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import Spinner from './Spinner'

const getViewedAnnouncements = () => {
  try { return JSON.parse(localStorage.getItem('viewed_announcements') || '[]') } catch { return [] }
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return isMobile
}

const PageShell = ({ nav, children, role = 'student' }) => {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(!isMobile)
  const { user, logout, theme, toggleTheme } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  // Close sidebar when switching to mobile
  useEffect(() => { if (isMobile) setOpen(false) }, [isMobile])

  const { data: annData } = useQuery({
    queryKey: ['student-announcements'],
    queryFn: async () => { const r = await api.get('/student/announcements'); return r.data },
    enabled: role === 'student',
    refetchInterval: 60000
  })

  const viewedIds = getViewedAnnouncements()
  const unreadAnnCount = role === 'student'
    ? (annData?.announcements || []).filter(a => !viewedIds.includes(a._id)).length : 0

  const roleLabel = { student: 'Student Portal', staff: 'Staff Portal', admin: 'Admin Panel' }
  const loginPath = { student: '/login/student', staff: '/login/staff', admin: '/login/admin' }
  const roleColor = { student: 'var(--student-color)', staff: 'var(--staff-color)', admin: 'var(--admin-color)' }

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate(loginPath[role] || '/')
  }

  const navWithBadges = nav.map(group => ({
    ...group,
    items: group.items.map(item => {
      if (item.to === '/student/notifications' && unreadAnnCount > 0)
        return { ...item, badge: unreadAnnCount }
      return item
    })
  }))

  const closeSidebar = () => { if (isMobile) setOpen(false) }

  const sidebarContent = (
    <div style={{ width: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--sidebar-border)', background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, transparent 50%), linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>C</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>CalebLib</div>
            <div style={{ fontSize: 9.5, color: 'var(--sidebar-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>
              {roleLabel[role]}
            </div>
          </div>
          {isMobile && (
            <button onClick={closeSidebar} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--sidebar-text)', cursor: 'pointer', display: 'flex', padding: 4 }}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 10px' }}>
        {navWithBadges.map(group => (
          <div key={group.label} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(122,156,192,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 10px 7px' }}>
              {group.label}
            </div>
            {group.items.map(({ to, icon: Icon, label, badge }) => (
              <NavLink key={to} to={to} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }} onClick={closeSidebar}>
                {({ isActive }) => (
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '9px 10px', borderRadius: 10,
                      background: isActive ? 'linear-gradient(135deg, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.12) 100%)' : 'transparent',
                      backdropFilter: isActive ? 'blur(8px)' : 'none',
                      WebkitBackdropFilter: isActive ? 'blur(8px)' : 'none',
                      border: isActive ? '1px solid rgba(59,130,246,0.28)' : '1px solid transparent',
                      boxShadow: isActive ? '0 2px 10px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
                      color: isActive ? '#fff' : 'var(--sidebar-text)',
                      transition: 'all 0.17s ease',
                      cursor: 'pointer', fontSize: 13.5,
                      fontWeight: isActive ? 600 : 400,
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--sidebar-hover)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--sidebar-text)' } }}
                  >
                    <Icon size={15.5} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.65 }} />
                    <span style={{ flex: 1 }}>{label}</span>
                    {badge > 0 && (
                      <span style={{ background: '#ef4444', color: '#fff', borderRadius: 20, fontSize: 9.5, fontWeight: 800, padding: '1px 6px', minWidth: 18, textAlign: 'center', animation: 'pulse2 2s infinite', boxShadow: '0 2px 6px rgba(239,68,68,0.5)' }}>
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                    {isActive && !badge && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--sidebar-border)' }}>
        <div style={{ padding: '11px 12px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)', borderRadius: 10, marginBottom: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 1 }}>{user?.fullName}</div>
          <div style={{ fontSize: 11, color: 'var(--sidebar-text)' }}>{user?.email}</div>
          {user?.matricNumber && <div style={{ fontSize: 10, color: roleColor[role], fontWeight: 700, marginTop: 3 }}>{user.matricNumber} · {user.academicLevel}L</div>}
          {user?.employeeId && <div style={{ fontSize: 10, color: roleColor[role], fontWeight: 700, marginTop: 3 }}>{user.employeeId}</div>}
        </div>
        <button onClick={handleLogout} disabled={loggingOut}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '8px', fontFamily: 'var(--font)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 9, color: '#f87171', fontSize: 13, fontWeight: 600, cursor: loggingOut ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
        >
          {loggingOut ? <Spinner size={14} color="#f87171" /> : <LogOut size={14} />}
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--page-bg)' }}>

      {/* Mobile backdrop */}
      {isMobile && open && (
        <div onClick={closeSidebar} style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? 'var(--sidebar-width)' : (open ? 'var(--sidebar-width)' : 0),
        minWidth: isMobile ? 'var(--sidebar-width)' : (open ? 'var(--sidebar-width)' : 0),
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.26s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden', flexShrink: 0,
        position: isMobile ? 'fixed' : 'sticky',
        top: 0, left: 0,
        height: isMobile ? '100vh' : '100vh',
        zIndex: isMobile ? 200 : 'auto',
        transform: isMobile ? (open ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        boxShadow: isMobile && open ? '4px 0 30px rgba(0,0,0,0.3)' : '2px 0 20px rgba(0,0,0,0.15)'
      }}>
        {sidebarContent}
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Glass topbar */}
        <header style={{
          height: 'var(--navbar-height)',
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(203,213,225,0.5)',
          display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: 10,
          position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 1px 0 rgba(203,213,225,0.4), 0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <button onClick={() => setOpen(p => !p)}
            style={{ background: 'rgba(241,245,249,0.7)', border: '1px solid rgba(226,232,240,0.6)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 7, borderRadius: 8, transition: 'var(--transition)', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(226,232,240,0.9)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(241,245,249,0.7)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <Menu size={17} />
          </button>

          {/* Show app name on mobile */}
          {isMobile && (
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>CalebLib</span>
          )}

          <div style={{ flex: 1 }} />

          <button onClick={toggleTheme}
            style={{ background: 'rgba(241,245,249,0.7)', border: '1px solid rgba(226,232,240,0.6)', backdropFilter: 'blur(8px)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 7, borderRadius: 8, transition: 'var(--transition)', flexShrink: 0 }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,232,240,0.9)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(241,245,249,0.7)'}
          >
            {theme === 'light'
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            }
          </button>

          {/* User chip — condensed on mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0 : 9, padding: isMobile ? '4px' : '6px 14px 6px 7px', background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: 30, border: '1px solid rgba(203,213,225,0.6)', boxShadow: '0 2px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `rgba(59,130,246,0.12)`, border: `1.5px solid ${roleColor[role]}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: roleColor[role] }}>
              {user?.fullName?.[0]}
            </div>
            {!isMobile && (
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{user?.fullName?.split(' ')[0]}</div>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: roleColor[role] }}>{role}</div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: isMobile ? '16px' : '28px', overflowY: 'auto', overflowX: 'hidden' }}>
          <div className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default PageShell
