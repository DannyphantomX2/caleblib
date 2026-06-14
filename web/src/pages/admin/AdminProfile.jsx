import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMutation } from '@tanstack/react-query'
import api from '../../services/api'
import Field from '../../components/common/Field'
import Btn from '../../components/common/Btn'
import Badge from '../../components/common/Badge'
import { User, Mail, Hash, Lock, Shield, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/helpers'

const AdminProfile = () => {
  const { user } = useAuth()
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const pwMutation = useMutation({
    mutationFn: async (data) => { const r = await api.put('/users/profile/password', data); return r.data },
    onSuccess: () => { toast.success('Password changed'); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const card = {
    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
    borderRadius: 'var(--radius)', padding: 24,
    boxShadow: 'var(--card-shadow)', marginBottom: 20
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Admin Profile</h1>

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'var(--admin-bg)',
            border: '2px solid #fde68a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: 'var(--admin-color)'
          }}>
            {user?.fullName?.[0]}
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{user?.fullName}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge color="yellow">Administrator</Badge>
              <Badge color="gray">Computer Science</Badge>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { icon: Mail, label: 'Email', value: user?.email },
            { icon: Hash, label: 'Employee ID', value: user?.employeeId || 'ADMIN' },
            { icon: Shield, label: 'Role', value: 'System Administrator' },
            { icon: Calendar, label: 'Joined', value: formatDate(user?.createdAt) }
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ padding: '12px 14px', background: 'var(--page-bg-2)', borderRadius: 8, border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <Icon size={13} color="var(--text-muted)" />
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={16} color="var(--admin-color)" /> Change Password
        </h3>
        <form onSubmit={e => {
          e.preventDefault()
          if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match')
          if (pwForm.newPassword.length < 6) return toast.error('Minimum 6 characters')
          pwMutation.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
        }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Current Password" type="password" value={pwForm.currentPassword}
            onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required />
          <Field label="New Password" type="password" value={pwForm.newPassword}
            onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required />
          <Field label="Confirm New Password" type="password" value={pwForm.confirmPassword}
            onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
          <Btn type="submit" variant="secondary" loading={pwMutation.isPending}>Update Password</Btn>
        </form>
      </div>

      <div style={{ ...card, background: '#fffbeb', border: '1px solid #fde68a' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Shield size={16} color="var(--admin-color)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Admin Account Security</p>
            <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.7 }}>
              Admin accounts cannot be self-created or modified by other users. Your email and role can only be changed directly in the database. All your actions are permanently recorded in the audit log.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminProfile
