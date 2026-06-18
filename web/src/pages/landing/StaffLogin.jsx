import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowLeft, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Field from '../../components/common/Field'
import Btn from '../../components/common/Btn'
import toast from 'react-hot-toast'

const StaffLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleLogin = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password, 'faculty')
      toast.success('Welcome back!')
      navigate('/staff/dashboard')
    } catch (err) { toast.error(err.response?.data?.error || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Onest', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, #031510 0%, #071f18 40%, #041410 100%)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-8%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.22) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 65%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="login-split" style={{ maxWidth: 860 }}>

          <div className="login-left-panel" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px) saturate(150%)', WebkitBackdropFilter: 'blur(24px) saturate(150%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '44px 40px', boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.38)', fontSize: 13, marginBottom: 44, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}>
              <ArrowLeft size={13} /> Back
            </Link>
            <div style={{ width: 56, height: 56, borderRadius: 17, background: 'rgba(5,150,105,0.18)', border: '1px solid rgba(5,150,105,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 0 30px rgba(5,150,105,0.2)' }}>
              <Users size={28} color="#34d399" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>Staff Portal</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, marginBottom: 36 }}>
              Upload course materials, track student engagement, and manage academic resources for your courses.
            </p>
            <div style={{ padding: '14px 16px', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.25)', borderRadius: 10 }}>
              <p style={{ fontSize: 12, color: 'rgba(110,231,183,0.7)', lineHeight: 1.6 }}>
                <strong style={{ color: 'rgba(110,231,183,0.9)' }}>Note:</strong> Staff accounts are created exclusively by the system administrator. Contact your department admin if you need access.
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(28px) saturate(200%)', WebkitBackdropFilter: 'blur(28px) saturate(200%)', border: '1px solid rgba(255,255,255,0.75)', borderRadius: 24, padding: '44px 36px', boxShadow: '0 24px 80px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,1)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Staff Sign In</h2>
            <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 30 }}>Sign in with your institutional credentials</p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Email Address" type="email" value={form.email} onChange={set('email')} placeholder="staff@calebuniversity.edu.ng" icon={<Mail size={15} />} required />
              <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Enter your password" icon={<Lock size={15} />} required />
              <Btn type="submit" fullWidth size="lg" loading={loading} style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 50%, transparent 100%), linear-gradient(135deg, #34d399, #059669)', boxShadow: '0 4px 14px rgba(5,150,105,0.45), inset 0 1px 0 rgba(255,255,255,0.22)' }}>
                Sign In to Staff Portal
              </Btn>
            </form>
            <p style={{ textAlign: 'center', marginTop: 22, fontSize: 12, color: '#94a3b8' }}>
              <Link to="/login/student" style={{ color: '#2563eb', fontWeight: 600 }}>Student</Link>
              {' · '}
              <Link to="/login/admin" style={{ color: '#b45309', fontWeight: 600 }}>Admin</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default StaffLogin
