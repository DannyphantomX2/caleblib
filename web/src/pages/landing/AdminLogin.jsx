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
    } catch (err) {
      toast.error(err.response?.data?.error || 'Access denied')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>
      <div style={{ width: 420, background: '#0f1b2d', display: 'flex', flexDirection: 'column', padding: '40px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: 250, height: 250, borderRadius: '50%', background: 'rgba(245,158,11,0.06)' }} />
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#94b4d1', fontSize: 13, marginBottom: 48, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Shield size={28} color="#f59e0b" />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>Admin Panel</h1>
          <p style={{ fontSize: 14, color: '#94b4d1', lineHeight: 1.7, marginBottom: 36 }}>
            System administration — manage users, resources, departments, and maintain full institutional oversight.
          </p>
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px' }}>
            <p style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.6 }}>
              <strong>Restricted Access.</strong> Admin accounts are manually seeded. All login attempts are logged and monitored.
            </p>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#3a506b' }}>Caleb University · CS Dept · 2026</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Admin Sign In</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>Restricted — administrator access only</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="Admin Email" type="email" value={form.email} onChange={set('email')} placeholder="admin@calebuniversity.edu.ng" icon={<Mail size={15} />} required />
            <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Administrator password" icon={<Lock size={15} />} required />
            <Btn type="submit" fullWidth size="lg" style={{ background: '#f59e0b', color: '#fff' }} loading={loading}>
              Access Admin Panel
            </Btn>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
            <Link to="/login/student" style={{ color: '#3b82f6', fontWeight: 600 }}>Student login</Link>
            {' '}·{' '}
            <Link to="/login/staff" style={{ color: '#10b981', fontWeight: 600 }}>Staff login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default AdminLogin
