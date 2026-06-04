import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Hash, User, BookOpen, ArrowLeft, GraduationCap } from 'lucide-react'
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
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleRegister = async e => {
    e.preventDefault()
    if (!form.academicLevel) return toast.error('Select your academic level')
    setLoading(true)
    try {
      await registerStudent({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        matricNumber: form.matricNumber,
        academicLevel: parseInt(form.academicLevel)
      })
      toast.success('Account created successfully!')
      navigate('/student/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>
      {/* Left panel */}
      <div style={{ width: 420, background: '#0f1b2d', display: 'flex', flexDirection: 'column', padding: '40px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: 250, height: 250, borderRadius: '50%', background: 'rgba(59,130,246,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: 180, height: 180, borderRadius: '50%', background: 'rgba(59,130,246,0.04)' }} />

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#94b4d1', fontSize: 13, marginBottom: 48, textDecoration: 'none', position: 'relative' }}>
          <ArrowLeft size={14} /> Back to portal selection
        </Link>

        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <GraduationCap size={28} color="#3b82f6" />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>Student Portal</h1>
          <p style={{ fontSize: 14, color: '#94b4d1', lineHeight: 1.7, marginBottom: 36 }}>
            Access your academic resources, lecture notes, past questions, and project archives for the CS department.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Browse Resources', desc: 'By course, level & semester' },
              { label: 'Download Materials', desc: 'Lecture notes, past questions' },
              { label: 'Bookmark & Track', desc: 'Save and revisit resources' },
              { label: 'Request Resources', desc: 'Ask for missing materials' }
            ].map(({ label, desc }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{label}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#3a506b', position: 'relative' }}>
          Caleb University · CS Dept · 2026
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 32 }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '9px 16px', borderRadius: 8, border: 'none',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font)', transition: 'var(--transition)',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#0f172a' : '#64748b',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {mode === 'login' ? (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Welcome back</h2>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>Sign in with your student credentials</p>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Field label="Email Address" type="email" value={form.email} onChange={set('email')} placeholder="you@calebuniversity.edu.ng" icon={<Mail size={15} />} required />
                <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Enter your password" icon={<Lock size={15} />} required />
                <Btn type="submit" fullWidth size="lg" loading={loading}>Sign In to Student Portal</Btn>
              </form>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Create Account</h2>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
                Your matric number and email must be pre-registered by admin
              </p>
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Full Name" value={form.fullName} onChange={set('fullName')} placeholder="Daniel Ndabai" icon={<User size={15} />} required />
                <Field label="School Email" type="email" value={form.email} onChange={set('email')} placeholder="you@calebuniversity.edu.ng" icon={<Mail size={15} />} required />
                <Field label="Matric Number" value={form.matricNumber} onChange={set('matricNumber')} placeholder="22/10125" icon={<Hash size={15} />} required />
                <Select
                  label="Academic Level"
                  value={form.academicLevel}
                  onChange={set('academicLevel')}
                  required
                  options={[
                    { value: '', label: 'Select your level' },
                    { value: '100', label: '100 Level' },
                    { value: '200', label: '200 Level' },
                    { value: '300', label: '300 Level' },
                    { value: '400', label: '400 Level' }
                  ]}
                />
                <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" icon={<Lock size={15} />} required />
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e' }}>
                  ⚠️ Your matric number and email must be registered by the administrator before you can create an account.
                </div>
                <Btn type="submit" fullWidth size="lg" loading={loading}>Create Student Account</Btn>
              </form>
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
            Not a student?{' '}
            <Link to="/login/staff" style={{ color: '#3b82f6', fontWeight: 600 }}>Staff login</Link>
            {' '}or{' '}
            <Link to="/login/admin" style={{ color: '#f59e0b', fontWeight: 600 }}>Admin login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default StudentLogin
