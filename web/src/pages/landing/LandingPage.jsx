import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, Shield, ArrowRight, Lock } from 'lucide-react'

const portals = [
  {
    role: 'student',
    title: 'Student Portal',
    subtitle: 'Academic Resources',
    desc: 'Browse lecture notes, past questions, project archives, and course materials organized by level and semester.',
    icon: BookOpen,
    color: '#2563eb',
    cardBg: '#f0f7ff',
    border: '#bfdbfe',
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
    desc: 'Upload course materials, track student engagement, respond to requests, and post course announcements.',
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
      'Approve or reject uploads',
      'Review full audit trails',
      'System analytics & reporting'
    ]
  }
]

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Onest', sans-serif" }}>

      {/* Header */}
      <header style={{
        background: '#0f1b2d',
        borderBottom: '1px solid #1e3356',
        height: 56,
        display: 'flex', alignItems: 'center',
        padding: '0 36px', gap: 14
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(59,130,246,0.4)'
        }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>C</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.01em' }}>CalebLib</span>
          <span style={{ fontSize: 12, color: '#3a506b' }}>·</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>Caleb University CS Department</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#3a506b' }}>
          <Lock size={10} />
          Restricted System
        </div>
      </header>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '56px 36px 44px' }}>
        {/* Badge — no dot */}
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '5px 16px',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 20,
          fontSize: 11, fontWeight: 700,
          color: '#3b82f6',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 20
        }}>
          Resource Library System
        </div>

        <h1 style={{
          fontSize: 38, fontWeight: 900,
          color: '#0f172a',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: 14,
          maxWidth: 560, margin: '0 auto 14px'
        }}>
          Select Your Access Portal
        </h1>

        <p style={{
          fontSize: 15, color: '#64748b',
          maxWidth: 480, margin: '0 auto',
          lineHeight: 1.7
        }}>
          Access is restricted to registered members of the Caleb University Computer Science Department.
        </p>
      </div>

      {/* Portal cards */}
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 28px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
          {portals.map((portal) => {
            const Icon = portal.icon
            return (
              <div
                key={portal.role}
                onClick={() => navigate(portal.path)}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1.5px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = portal.color
                  e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.09), 0 0 0 3px ${portal.color}18`
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                {/* Colored top strip */}
                <div style={{
                  background: portal.cardBg,
                  borderBottom: `1.5px solid ${portal.border}`,
                  padding: '26px 26px 20px'
                }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 13,
                    background: '#fff',
                    border: `1px solid ${portal.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 18,
                    boxShadow: `0 3px 10px ${portal.color}18`
                  }}>
                    <Icon size={24} color={portal.color} strokeWidth={1.8} />
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700,
                    color: portal.color,
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase',
                    marginBottom: 5
                  }}>
                    {portal.subtitle}
                  </div>
                  <h2 style={{
                    fontSize: 19, fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    marginBottom: 8
                  }}>
                    {portal.title}
                  </h2>
                  <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6 }}>
                    {portal.desc}
                  </p>
                </div>

                {/* Features list */}
                <div style={{ padding: '18px 26px', flex: 1 }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {portal.features.map(f => (
                      <li key={f} style={{
                        display: 'flex', alignItems: 'flex-start',
                        gap: 9, fontSize: 13.5, color: '#475569', lineHeight: 1.45
                      }}>
                        <span style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: portal.color,
                          flexShrink: 0, marginTop: 6
                        }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA button */}
                <div style={{ padding: '12px 20px 22px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 18px',
                    background: portal.color,
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 14, fontWeight: 700,
                    boxShadow: `0 4px 12px ${portal.color}38`
                  }}>
                    <span>Access {portal.title}</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer notice */}
        <div style={{ textAlign: 'center', marginTop: 44, paddingTop: 32, borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            <Lock size={12} color="#94a3b8" />
            <p style={{ fontSize: 13, color: '#94a3b8' }}>
              This system is exclusively for registered Caleb University CS Department members.
            </p>
          </div>
          <p style={{ fontSize: 12, color: '#cbd5e1' }}>
            All activity is logged and monitored. Unauthorised access is prohibited.{' '}
            <a href="/privacy-policy" style={{ color: '#3b82f6', fontWeight: 500 }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
