import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, Shield, ArrowRight, Lock } from 'lucide-react'

const portals = [
  {
    role: 'student',
    title: 'Student Portal',
    subtitle: 'Academic Resources',
    desc: 'Browse and download course materials, lecture notes, past questions, and project archives for your level.',
    icon: BookOpen,
    color: '#2563eb',
    cardBg: '#f0f7ff',
    border: '#c7dffe',
    path: '/login/student',
    features: [
      'Browse resources by course & level',
      'Download lecture notes & past questions',
      'Bookmark materials for later',
      'Submit resource requests'
    ]
  },
  {
    role: 'staff',
    title: 'Staff Portal',
    subtitle: 'Resource Management',
    desc: 'Upload course materials, track student engagement, manage requests, and communicate with students.',
    icon: Users,
    color: '#059669',
    cardBg: '#f0fdf8',
    border: '#bbf0dc',
    path: '/login/staff',
    features: [
      'Upload & organise course resources',
      'Monitor downloads and views',
      'Respond to student requests',
      'Post course announcements'
    ]
  },
  {
    role: 'admin',
    title: 'Admin Panel',
    subtitle: 'System Administration',
    desc: 'Manage users and access, approve uploaded content, review audit logs, and oversee system operations.',
    icon: Shield,
    color: '#b45309',
    cardBg: '#fefce8',
    border: '#fde68a',
    path: '/login/admin',
    features: [
      'Manage student & staff accounts',
      'Approve or reject resource uploads',
      'Review full audit trails',
      'System analytics & reporting'
    ]
  }
]

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Onest', sans-serif" }}>

      {/* Top bar */}
      <header style={{
        background: '#0f1b2d',
        borderBottom: '1px solid #1e3356',
        height: 56,
        display: 'flex', alignItems: 'center',
        padding: '0 32px', gap: 14
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: '#2563eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>C</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em' }}>
            CalebLib
          </span>
          <span style={{ fontSize: 12, color: '#3a506b' }}>·</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Caleb University Department of Computer Science
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#3a506b' }}>
          <Lock size={11} />
          Secure Access
        </div>
      </header>

      {/* Page content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '52px 28px' }}>

        {/* Header block */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontSize: 11, fontWeight: 700,
            color: '#2563eb', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: 10
          }}>
            Resource Library System
          </p>
          <h1 style={{
            fontSize: 28, fontWeight: 800,
            color: '#0f172a', letterSpacing: '-0.02em',
            marginBottom: 10, lineHeight: 1.2
          }}>
            Select Your Access Portal
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', maxWidth: 480, lineHeight: 1.65 }}>
            Access is restricted to registered members of the Caleb University Computer Science Department. Choose the portal that matches your role.
          </p>
        </div>

        {/* Portal cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48 }}>
          {portals.map((portal) => {
            const Icon = portal.icon
            return (
              <div
                key={portal.role}
                onClick={() => navigate(portal.path)}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1.5px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = portal.color
                  e.currentTarget.style.boxShadow = `0 6px 24px rgba(0,0,0,0.08)`
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                {/* Top strip */}
                <div style={{
                  background: portal.cardBg,
                  borderBottom: `1px solid ${portal.border}`,
                  padding: '22px 22px 18px'
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: '#fff',
                    border: `1px solid ${portal.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14
                  }}>
                    <Icon size={22} color={portal.color} strokeWidth={1.8} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: portal.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {portal.subtitle}
                  </div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 6 }}>
                    {portal.title}
                  </h2>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>
                    {portal.desc}
                  </p>
                </div>

                {/* Features */}
                <div style={{ padding: '16px 22px', flex: 1 }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {portal.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: portal.color, flexShrink: 0, marginTop: 5 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <div style={{ padding: '12px 22px 20px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 14px',
                    background: portal.color,
                    borderRadius: 8,
                    color: '#fff', fontSize: 13, fontWeight: 600
                  }}>
                    <span>Sign in to {portal.title}</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Notice bar */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 18px',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderLeft: '3px solid #2563eb',
          borderRadius: 8,
          marginBottom: 28
        }}>
          <Lock size={14} color="#2563eb" style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, marginBottom: 2 }}>
              Restricted System
            </p>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
              This portal is exclusively for registered students, faculty, and administrators of the Caleb University Computer Science Department. All login attempts, uploads, downloads, and administrative actions are recorded in the system audit log. Unauthorised access attempts are prohibited under institutional policy.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#94a3b8' }}>
          <span>© 2026 Caleb University · Department of Computer Science</span>
          <a href="/privacy-policy" style={{ color: '#2563eb', fontWeight: 500 }}>Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
