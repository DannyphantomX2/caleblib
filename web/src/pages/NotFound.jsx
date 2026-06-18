import { useNavigate, useLocation } from 'react-router-dom'
import Btn from '../components/common/Btn'
import { ArrowLeft, Home } from 'lucide-react'

const NotFound = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const role = location.pathname.startsWith('/admin')
    ? 'admin' : location.pathname.startsWith('/staff')
    ? 'staff' : location.pathname.startsWith('/student')
    ? 'student' : null

  const homeMap = { student: '/student/dashboard', staff: '/staff/dashboard', admin: '/admin/dashboard' }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 40, textAlign: 'center',
      background: 'var(--page-bg)', fontFamily: 'var(--font)'
    }}>
      <div style={{
        fontSize: 96, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1,
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: 16, userSelect: 'none'
      }}>
        404
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.02em' }}>
        Page not found
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 380, lineHeight: 1.7, marginBottom: 36 }}>
        The page at{' '}
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--page-bg-2)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--card-border)' }}>
          {location.pathname}
        </code>{' '}
        does not exist or you do not have access to it.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="secondary" icon={<ArrowLeft size={14} />} onClick={() => navigate(-1)}>Go Back</Btn>
        <Btn icon={<Home size={14} />} onClick={() => navigate(role ? homeMap[role] : '/')}>
          {role ? 'Back to ' + role.charAt(0).toUpperCase() + role.slice(1) + ' Dashboard' : 'Back to Home'}
        </Btn>
      </div>
    </div>
  )
}

export default NotFound
