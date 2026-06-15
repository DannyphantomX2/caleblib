import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, Shield, ArrowRight, Lock } from 'lucide-react'

const portals = [
  {
    role: 'student',
    title: 'Student Portal',
    subtitle: 'Academic Resources',
    desc: 'Browse lecture notes, past questions, project archives, and course materials organized by level.',
    icon: BookOpen,
    color: '#2563eb',
    glow: 'rgba(37,99,235,0.15)',
    path: '/login/student',
    features: ['Browse resources by course & level','Download lecture notes & past questions','Bookmark materials for later','Submit resource requests']
  },
  {
    role: 'staff',
    title: 'Staff Portal',
    subtitle: 'Resource Management',
    desc: 'Upload course materials, track student engagement, manage requests, and communicate with students.',
    icon: Users,
    color: '#059669',
    glow: 'rgba(5,150,105,0.15)',
    path: '/login/staff',
    features: ['Upload & organise course resources','Monitor downloads and views','Respond to student requests','Post course announcements']
  },
  {
    role: 'admin',
    title: 'Admin Panel',
    subtitle: 'System Administration',
    desc: 'Manage users and access, approve uploaded content, review audit logs, and oversee operations.',
    icon: Shield,
    color: '#b45309',
    glow: 'rgba(180,83,9,0.15)',
    path: '/login/admin',
    features: ['Manage student & staff accounts','Approve or reject uploads','Review full audit trails','System analytics & reporting']
  }
]

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Onest', sans-serif", position: 'relative', overflow: 'hidden' }}>

      {/* Full page gradient background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'linear-gradient(135deg, #0a1628 0%, #0d2144 35%, #081830 65%, #0a1f3a 100%)'
      }} />
      {/* Floating blobs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{
          padding: '0 40px', height: 58,
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.05)'
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, transparent 50%), linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>C</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>CalebLib</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>·</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Caleb University CS Department</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            <Lock size={10} />
            Restricted System
          </div>
        </header>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '64px 40px 52px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', background: 'rgba(59,130,246,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#93c5fd', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 24 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', animation: 'pulse2 2s infinite' }} />
            Resource Library System
          </div>
          <h1 style={{ fontSize: 46, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, maxWidth: 580, margin: '0 auto 16px' }}>
            Select Your Access Portal
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
            Access is restricted to registered members of the Caleb University Computer Science Department.
          </p>
        </div>

        {/* Glass portal cards */}
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 32px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {portals.map(({ role, title, subtitle, desc, icon: Icon, color, glow, path, features }) => (
              <div
                key={role}
                onClick={() => navigate(path)}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(24px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.34,1.4,0.64,1)',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.11)'
                  e.currentTarget.style.border = `1px solid ${color}50`
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'
                  e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.3), 0 0 40px ${glow}, inset 0 1px 0 rgba(255,255,255,0.15)`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                {/* Top glow accent */}
                <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />

                <div style={{ padding: '26px 26px 20px' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: `rgba(255,255,255,0.08)`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: `0 4px 16px ${glow}, inset 0 1px 0 rgba(255,255,255,0.1)` }}>
                    <Icon size={24} color={color} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>{subtitle}</div>
                  <h2 style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 10 }}>{title}</h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{desc}</p>
                </div>

                <div style={{ padding: '0 26px 20px' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '0 20px 22px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 16px',
                    background: `linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 50%, transparent 100%), ${color}`,
                    borderRadius: 11, color: '#fff', fontSize: 13.5, fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.25)',
                    boxShadow: `0 4px 14px ${glow}90, inset 0 1px 0 rgba(255,255,255,0.2)`
                  }}>
                    <span>Access {title}</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom notice */}
          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
              <Lock size={11} />
              All activity is logged and monitored. Unauthorised access is prohibited.
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
              © 2026 Caleb University · CS Department · {' '}
              <a href="/privacy-policy" style={{ color: 'rgba(59,130,246,0.6)', fontWeight: 500 }}>Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default LandingPage
