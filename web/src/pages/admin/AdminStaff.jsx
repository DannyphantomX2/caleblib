import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Search, UserX, UserCheck, Trash2, Key, Plus } from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import Modal from '../../components/common/Modal'
import Field from '../../components/common/Field'
import { SkRow } from '../../components/common/Skeleton'
import { formatDate, formatRelativeTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminStaff = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState(null)
  const [reason, setReason] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ fullName: '', email: '', password: '', employeeId: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-staff', search, page],
    queryFn: async () => {
      const params = { role: 'faculty', page, limit: 20 }
      if (search) params.search = search
      const r = await api.get('/admin/users', { params })
      return r.data
    }
  })

  const createMutation = useMutation({
    mutationFn: async (d) => { const r = await api.post('/admin/users/staff', d); return r.data },
    onSuccess: () => {
      toast.success('Staff account created')
      queryClient.invalidateQueries(['admin-staff'])
      setShowCreate(false)
      setCreateForm({ fullName: '', email: '', password: '', employeeId: '' })
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ id, reason }) => { const r = await api.put(`/admin/users/${id}/suspend`, { reason }); return r.data },
    onSuccess: () => { toast.success('Staff suspended'); queryClient.invalidateQueries(['admin-staff']); setAction(null); setReason('') },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const unsuspendMutation = useMutation({
    mutationFn: async (id) => { const r = await api.put(`/admin/users/${id}/unsuspend`); return r.data },
    onSuccess: () => { toast.success('Staff unsuspended'); queryClient.invalidateQueries(['admin-staff']) },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => { const r = await api.delete(`/admin/users/${id}`); return r.data },
    onSuccess: () => { toast.success('Staff deleted'); queryClient.invalidateQueries(['admin-staff']); setAction(null) },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }) => { const r = await api.put(`/admin/users/${id}/reset-password`, { newPassword }); return r.data },
    onSuccess: () => { toast.success('Password reset'); setAction(null); setNewPassword('') },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const openAction = (staff, act) => { setSelected(staff); setAction(act) }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Manage Staff</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {data?.total ? `${data.total} staff members` : 'All faculty members'}
          </p>
        </div>
        <Btn onClick={() => setShowCreate(true)} icon={<Plus size={15} />}>Create Staff Account</Btn>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 20, boxShadow: 'var(--card-shadow)' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or email..."
            style={{ width: '100%', padding: '9px 14px 9px 36px', background: 'var(--page-bg-2)', border: '1.5px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font)' }} />
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--card-border)', background: 'var(--page-bg-2)' }}>
              {['Staff Member', 'Employee ID', 'Status', 'Joined', 'Last Login', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ padding: 20 }}>{[1,2,3].map(i => <SkRow key={i} />)}</td></tr>
            ) : data?.users?.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>No staff found</td></tr>
            ) : data?.users?.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700 }}>{u.fullName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{u.employeeId || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge color={u.isSuspended ? 'red' : 'green'} dot>{u.isSuspended ? 'Suspended' : 'Active'}</Badge>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(u.createdAt)}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>{u.lastLogin ? formatRelativeTime(u.lastLogin) : 'Never'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {u.isSuspended ? (
                      <Btn size="xs" onClick={() => unsuspendMutation.mutate(u._id)}
                        loading={unsuspendMutation.isPending} icon={<UserCheck size={12} />}
                        style={{ background: '#10b981', color: '#fff' }}>Restore</Btn>
                    ) : (
                      <Btn size="xs" variant="ghost" onClick={() => openAction(u, 'suspend')}
                        icon={<UserX size={12} />} style={{ color: '#f59e0b' }}>Suspend</Btn>
                    )}
                    <Btn size="xs" variant="ghost" onClick={() => openAction(u, 'password')}
                      icon={<Key size={12} />} style={{ color: 'var(--blue-600)' }}>Reset PW</Btn>
                    <Btn size="xs" variant="ghost" onClick={() => openAction(u, 'delete')}
                      icon={<Trash2 size={12} />} style={{ color: '#ef4444' }}>Delete</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {Array.from({ length: data.pages }, (_, i) => (
            <Btn key={i} size="sm" variant={page === i+1 ? 'primary' : 'secondary'} onClick={() => setPage(i+1)}>{i+1}</Btn>
          ))}
        </div>
      )}

      {/* Create staff modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Staff Account"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Btn>
            <Btn loading={createMutation.isPending} onClick={() => {
              const { fullName, email, password, employeeId } = createForm
              if (!fullName || !email || !password || !employeeId) return toast.error('All fields required')
              if (password.length < 6) return toast.error('Password min 6 characters')
              createMutation.mutate(createForm)
            }}>Create Account</Btn>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full Name" value={createForm.fullName} onChange={e => setCreateForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Dr. John Doe" required />
          <Field label="Email" type="email" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} placeholder="staff@calebuniversity.edu.ng" required />
          <Field label="Employee ID" value={createForm.employeeId} onChange={e => setCreateForm(p => ({ ...p, employeeId: e.target.value }))} placeholder="CSC/STAFF/002" required />
          <Field label="Initial Password" type="password" value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" required hint="Staff should change this on first login" />
        </div>
      </Modal>

      {/* Suspend modal */}
      <Modal open={action === 'suspend'} onClose={() => { setAction(null); setReason('') }} title="Suspend Staff"
        footer={
          <>
            <Btn variant="secondary" onClick={() => { setAction(null); setReason('') }}>Cancel</Btn>
            <Btn variant="danger" loading={suspendMutation.isPending} onClick={() => suspendMutation.mutate({ id: selected._id, reason })}>Suspend</Btn>
          </>
        }>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Suspending <strong>{selected?.fullName}</strong></p>
        <Field label="Reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for suspension" />
      </Modal>

      {/* Reset password modal */}
      <Modal open={action === 'password'} onClose={() => { setAction(null); setNewPassword('') }} title="Reset Password"
        footer={
          <>
            <Btn variant="secondary" onClick={() => { setAction(null); setNewPassword('') }}>Cancel</Btn>
            <Btn loading={resetPasswordMutation.isPending} onClick={() => {
              if (!newPassword || newPassword.length < 6) return toast.error('Min 6 characters')
              resetPasswordMutation.mutate({ id: selected._id, newPassword })
            }}>Reset Password</Btn>
          </>
        }>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Reset password for <strong>{selected?.fullName}</strong></p>
        <Field label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" required />
      </Modal>

      {/* Delete modal */}
      <Modal open={action === 'delete'} onClose={() => setAction(null)} title="Delete Staff"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setAction(null)}>Cancel</Btn>
            <Btn variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(selected._id)}>Delete Permanently</Btn>
          </>
        }>
        <div style={{ padding: '12px 16px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#991b1b', fontWeight: 600 }}>⚠️ This cannot be undone.</p>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Delete <strong>{selected?.fullName}</strong> permanently?</p>
      </Modal>
    </div>
  )
}
export default AdminStaff
