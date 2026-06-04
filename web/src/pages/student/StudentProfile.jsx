import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMutation } from '@tanstack/react-query'
import api from '../../services/api'
import Field from '../../components/common/Field'
import Btn from '../../components/common/Btn'
import Badge from '../../components/common/Badge'
import { User, Mail, Hash, BookOpen, Lock, Shield, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/helpers'

const StudentProfile = () => {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ fullName: user?.fullName || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const updateMutation = useMutation({
    mutationFn: async (data) => { const r = await api.put('/auth/me', data); return r.data },
    onSuccess: (data) => { setUser(data.user); toast.success('Profile updated') },
    onError: (e) => toast.error(e.response?.data?.error || 'Update failed')
  })

  const pwMutation = useMutation({
    mutationFn: async (data) => { const r = await api.put('/users/profile/password', data); return r.data },
    onSuccess: () => { toast.success('Password changed'); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed')
  })

  const card = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--card-shadow)', marginBottom: 20 }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>My Profile</h1>

      {/* Identity card */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--student-bg)', border: '2px solid var(--blue-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'var(--student-color)' }}>
            {user?.fullName?.[0]}
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{user?.fullName}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge color="blue">Student</Badge>
              <Badge color="gray">{user?.academicLevel} Level</Badge>
              <Badge color="gray">Computer Science</Badge>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { icon: Mail, label: 'Email', value: user?.email },
            { icon: Hash, label: 'Matric Number', value: user?.matricNumber },
            { icon: BookOpen, label: 'Department', value: user?.department || 'Computer Science' },
            { icon: Calendar, label: 'Registered', value: formatDate(user?.createdAt) }
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ padding: '12px 14px', background: 'var(--page-bg-2)', borderRadius: 8, border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <Icon size={13} color="var(--text-muted)" />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit name */}
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={16} color="var(--blue-600)" /> Edit Profile
        </h3>
        <form onSubmit={e => { e.preventDefault(); updateMutation.mutate({ fullName: form.fullName }) }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Full Name" value={form.fullName}
            onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
            icon={<User size={15} />} />
          <Field label="Email Address" value={user?.email} disabled icon={<Mail size={15} />}
            hint="Email cannot be changed. Contact admin if needed." />
          <Btn type="submit" loading={updateMutation.isPending} size="md">Save Changes</Btn>
        </form>
      </div>

      {/* Change password */}
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={16} color="var(--blue-600)" /> Change Password
        </h3>
        <form onSubmit={e => {
          e.preventDefault()
          if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match')
          if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
          pwMutation.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
        }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Current Password" type="password" value={pwForm.currentPassword}
            onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required />
          <Field label="New Password" type="password" value={pwForm.newPassword}
            onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
            hint="Minimum 6 characters" required />
          <Field label="Confirm New Password" type="password" value={pwForm.confirmPassword}
            onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
          <Btn type="submit" variant="secondary" loading={pwMutation.isPending}>Update Password</Btn>
        </form>
      </div>

      {/* Security info */}
      <div style={{ ...card, background: '#f0f7ff', border: '1px solid var(--blue-200)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Shield size={16} color="var(--blue-600)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-700)', marginBottom: 4 }}>Account Security</p>
            <p style={{ fontSize: 12, color: '#3b5998', lineHeight: 1.6 }}>
              Your account is protected with bcrypt password hashing and JWT authentication. All login attempts and downloads are logged for security. After 5 failed login attempts your account will be locked for 15 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default StudentProfile
