import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowLeft, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Field from '../../components/common/Field'
import Btn from '../../components/common/Btn'
import toast from 'react-hot-toast'

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleLogin = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password, 'admin')
      toast.success('Admin access granted')
      navigate('/admin/dashboard')
    } catch (err) { toast.error(err.response?.data?.error || 'Access denied') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Onest', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, #0d0800 0%, #1c1100 40%, #110d00 100%)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-8%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,83,9,0.22) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', top: '50%', right: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 65%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="login-split" style={{ maxWidth: 860 }}>

          <div className="login-left-panel" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px) saturate(150%)', WebkitBackdropFilter: 'blur(24px) saturate(150%)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24, padding: '44px 40px', boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 44, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
              <ArrowLeft size={13} /> Back
            </Link>
            <div style={{ width: 56, height: 56, borderRadius: 17, background: 'rgba(180,83,9,0.18)', border: '1px solid rgba(245,158,11,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 0 30px rgba(180,83,9,0.25)' }}>
              <Shield size={28} color="#fbbf24" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>Admin Panel</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: 36 }}>
              Full system control — manage users and resources, review audit trails, and maintain institutional oversight.
            </p>
            <div style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10 }}>
              <p style={{ fontSize: 12, color: 'rgba(252,165,165,0.75)', lineHeight: 1.6 }}>
                <strong style={{ color: 'rgba(252,165,165,0.9)' }}>Restricted.</strong> Admin accounts are manually provisioned. All login attempts — successful or otherwise — are recorded in the system audit log with IP address and timestamp.
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(28px) saturate(200%)', WebkitBackdropFilter: 'blur(28px) saturate(200%)', border: '1px solid rgba(255,255,255,0.75)', borderRadius: 24, padding: '44px 36px', boxShadow: '0 24px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,1)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Admin Sign In</h2>
            <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 30 }}>Restricted — administrator access only</p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Admin Email" type="email" value={form.email} onChange={set('email')} placeholder="admin@calebuniversity.edu.ng" icon={<Mail size={15} />} required />
              <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Administrator password" icon={<Lock size={15} />} required />
              <Btn type="submit" fullWidth size="lg" loading={loading} style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 50%, transparent 100%), linear-gradient(135deg, #fbbf24, #d97706)', color: '#1c1100', boxShadow: '0 4px 14px rgba(180,83,9,0.45), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
                Access Admin Panel
              </Btn>
            </form>
            <p style={{ textAlign: 'center', marginTop: 22, fontSize: 12, color: '#94a3b8' }}>
              <Link to="/login/student" style={{ color: '#2563eb', fontWeight: 600 }}>Student</Link>
              {' · '}
              <Link to="/login/staff" style={{ color: '#059669', fontWeight: 600 }}>Staff</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminLogin
