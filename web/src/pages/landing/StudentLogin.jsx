import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Hash, User, ArrowLeft, GraduationCap, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Field from '../../components/common/Field'
import Btn from '../../components/common/Btn'
import Select from '../../components/common/Select'
import toast from 'react-hot-toast'

const StudentLogin = () => {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', fullName: '', matricNumber: '', academicLevel: '' })
  const { login, registerStudent } = useAuth()
  const navigate = useNavigate()
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleLogin = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password, 'student')
      toast.success('Welcome back!')
      navigate('/student/dashboard')
    } catch (err) { toast.error(err.response?.data?.error || 'Login failed') }
    finally { setLoading(false) }
  }

  const handleRegister = async e => {
    e.preventDefault()
    if (!form.academicLevel) return toast.error('Select your academic level')
    setLoading(true)
    try {
      await registerStudent({ fullName: form.fullName, email: form.email, password: form.password, matricNumber: form.matricNumber, academicLevel: parseInt(form.academicLevel) })
      toast.success('Account created!')
      navigate('/student/dashboard')
    } catch (err) { toast.error(err.response?.data?.error || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Onest', sans-serif", position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, #060e1c 0%, #0a1a35 40%, #071428 100%)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.20) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="login-split" style={{ maxWidth: 920 }}>

          {/* Left — branding glass panel */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: '44px 40px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)'
          }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 44, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
              <ArrowLeft size={13} /> Back
            </Link>
            <div style={{ width: 56, height: 56, borderRadius: 17, background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(37,99,235,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 0 30px rgba(37,99,235,0.2)' }}>
              <GraduationCap size={28} color="#60a5fa" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>Student Portal</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: 36 }}>
              Access course materials, lecture notes, past questions, and project archives for the CS department.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {['Browse resources by course & level','Download lecture notes & past questions','Bookmark and request materials','Track your download history'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 6px #3b82f6', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 44, padding: '12px 16px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10 }}>
              <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.8)', lineHeight: 1.6 }}>
                Registration requires your matric number to be pre-approved by the system administrator.
              </p>
            </div>
          </div>

          {/* Right — form glass panel */}
          <div style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(28px) saturate(200%)',
            WebkitBackdropFilter: 'blur(28px) saturate(200%)',
            border: '1px solid rgba(255,255,255,0.75)',
            borderRadius: 24, padding: '36px 36px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1)'
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', background: 'rgba(241,245,249,0.8)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
              {['login','register'].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  flex: 1, padding: '9px 14px', borderRadius: 8, border: 'none',
                  fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Onest',sans-serif", transition: 'all 0.15s',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#0f172a' : '#64748b',
                  boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' : 'none'
                }}>
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {mode === 'login' ? (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 5, letterSpacing: '-0.02em' }}>Welcome back</h2>
                <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 26 }}>Sign in with your student credentials</p>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@calebuniversity.edu.ng" icon={<Mail size={15} />} required />
                  <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Enter your password" icon={<Lock size={15} />} required />
                  <Btn type="submit" fullWidth size="lg" loading={loading}>Sign In to Student Portal</Btn>
                </form>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 5, letterSpacing: '-0.02em' }}>Create Account</h2>
                <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 26 }}>Your matric number must be registered by admin</p>
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                  <Field label="Full Name" value={form.fullName} onChange={set('fullName')} placeholder="Daniel Ndabai" icon={<User size={15} />} required />
                  <Field label="School Email" type="email" value={form.email} onChange={set('email')} placeholder="you@calebuniversity.edu.ng" icon={<Mail size={15} />} required />
                  <Field label="Matric Number" value={form.matricNumber} onChange={set('matricNumber')} placeholder="22/10125" icon={<Hash size={15} />} required />
                  <Select label="Academic Level" value={form.academicLevel} onChange={set('academicLevel')} required options={[{value:'',label:'Select your level'},{value:'100',label:'100 Level'},{value:'200',label:'200 Level'},{value:'300',label:'300 Level'},{value:'400',label:'400 Level'}]} />
                  <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" icon={<Lock size={15} />} required />
                  <Btn type="submit" fullWidth size="lg" loading={loading}>Create Student Account</Btn>
                </form>
              </div>
            )}

            <p style={{ textAlign: 'center', marginTop: 22, fontSize: 12, color: '#94a3b8' }}>
              <Link to="/login/staff" style={{ color: '#059669', fontWeight: 600 }}>Staff</Link>
              {' · '}
              <Link to="/login/admin" style={{ color: '#b45309', fontWeight: 600 }}>Admin</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default StudentLogin
