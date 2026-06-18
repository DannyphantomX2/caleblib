import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Search, UserX, UserCheck, Trash2, Key, Plus, X } from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import Modal from '../../components/common/Modal'
import Field from '../../components/common/Field'
import { SkRow } from '../../components/common/Skeleton'
import { formatDate, formatRelativeTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminStudents = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState(null)
  const [reason, setReason] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showSeed, setShowSeed] = useState(false)
  const [seedForm, setSeedForm] = useState({ fullName: '', email: '', matricNumber: '', academicLevel: '400' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', search, page],
    queryFn: async () => {
      const params = { role: 'student', page, limit: 20 }
      if (search) params.search = search
      const r = await api.get('/admin/users', { params })
      return r.data
    }
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ id, reason }) => { const r = await api.put(`/admin/users/${id}/suspend`, { reason }); return r.data },
    onSuccess: () => { toast.success('Student suspended'); queryClient.invalidateQueries(['admin-students']); setAction(null); setReason('') },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const unsuspendMutation = useMutation({
    mutationFn: async (id) => { const r = await api.put(`/admin/users/${id}/unsuspend`); return r.data },
    onSuccess: () => { toast.success('Student unsuspended'); queryClient.invalidateQueries(['admin-students']) },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => { const r = await api.delete(`/admin/users/${id}`); return r.data },
    onSuccess: () => { toast.success('Student deleted'); queryClient.invalidateQueries(['admin-students']); setAction(null) },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }) => { const r = await api.put(`/admin/users/${id}/reset-password`, { newPassword }); return r.data },
    onSuccess: () => { toast.success('Password reset'); setAction(null); setNewPassword('') },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const seedMutation = useMutation({
    mutationFn: async (data) => { const r = await api.post('/admin/registry', data); return r.data },
    onSuccess: () => {
      toast.success('Student added to registry')
      queryClient.invalidateQueries(['admin-students'])
      setShowSeed(false)
      setSeedForm({ fullName: '', email: '', matricNumber: '', academicLevel: '400' })
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const openAction = (student, act) => { setSelected(student); setAction(act) }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Manage Students</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {data?.total ? `${data.total} registered students` : 'All registered students'}
          </p>
        </div>
        <Btn onClick={() => setShowSeed(true)} icon={<Plus size={15} />}>Add to Registry</Btn>
      </div>

      {/* Search */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 20, boxShadow: 'var(--card-shadow)' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, email or matric number..."
            style={{ width: '100%', padding: '9px 14px 9px 36px', background: 'var(--page-bg-2)', border: '1.5px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-scroll" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--card-border)', background: 'var(--page-bg-2)' }}>
              {['Student', 'Matric No.', 'Level', 'Status', 'Joined', 'Last Login', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ padding: 20 }}>{[1,2,3,4,5].map(i => <SkRow key={i} />)}</td></tr>
            ) : data?.users?.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>No students found</td></tr>
            ) : data?.users?.map(u => (
              <tr key={u._id}
                style={{ borderBottom: '1px solid var(--card-border)', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700 }}>{u.fullName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{u.matricNumber || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{u.academicLevel ? `${u.academicLevel}L` : '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge color={u.isSuspended ? 'red' : 'green'} dot>
                    {u.isSuspended ? 'Suspended' : 'Active'}
                  </Badge>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(u.createdAt)}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                  {u.lastLogin ? formatRelativeTime(u.lastLogin) : 'Never'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {u.isSuspended ? (
                      <Btn size="xs" variant="success" onClick={() => unsuspendMutation.mutate(u._id)}
                        loading={unsuspendMutation.isPending} icon={<UserCheck size={12} />}
                        style={{ background: '#10b981', color: '#fff' }}>
                        Restore
                      </Btn>
                    ) : (
                      <Btn size="xs" variant="ghost" onClick={() => openAction(u, 'suspend')}
                        icon={<UserX size={12} />} style={{ color: '#f59e0b' }}>
                        Suspend
                      </Btn>
                    )}
                    <Btn size="xs" variant="ghost" onClick={() => openAction(u, 'password')}
                      icon={<Key size={12} />} style={{ color: 'var(--blue-600)' }}>
                      Reset PW
                    </Btn>
                    <Btn size="xs" variant="ghost" onClick={() => openAction(u, 'delete')}
                      icon={<Trash2 size={12} />} style={{ color: '#ef4444' }}>
                      Delete
                    </Btn>
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

      {/* Suspend modal */}
      <Modal open={action === 'suspend'} onClose={() => { setAction(null); setReason('') }} title="Suspend Student"
        footer={
          <>
            <Btn variant="secondary" onClick={() => { setAction(null); setReason('') }}>Cancel</Btn>
            <Btn variant="danger" loading={suspendMutation.isPending}
              onClick={() => suspendMutation.mutate({ id: selected._id, reason })}>
              Suspend Account
            </Btn>
          </>
        }>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Suspending <strong>{selected?.fullName}</strong> ({selected?.matricNumber}). They will not be able to log in.
        </p>
        <Field label="Reason" value={reason} onChange={e => setReason(e.target.value)}
          placeholder="e.g. Academic misconduct" hint="This will be shown to the student on login" />
      </Modal>

      {/* Reset password modal */}
      <Modal open={action === 'password'} onClose={() => { setAction(null); setNewPassword('') }} title="Reset Password"
        footer={
          <>
            <Btn variant="secondary" onClick={() => { setAction(null); setNewPassword('') }}>Cancel</Btn>
            <Btn loading={resetPasswordMutation.isPending}
              onClick={() => {
                if (!newPassword || newPassword.length < 6) return toast.error('Min 6 characters')
                resetPasswordMutation.mutate({ id: selected._id, newPassword })
              }}>
              Reset Password
            </Btn>
          </>
        }>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Reset password for <strong>{selected?.fullName}</strong>
        </p>
        <Field label="New Password" type="password" value={newPassword}
          onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" required />
      </Modal>

      {/* Delete modal */}
      <Modal open={action === 'delete'} onClose={() => setAction(null)} title="Delete Student"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setAction(null)}>Cancel</Btn>
            <Btn variant="danger" loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(selected._id)}>
              Permanently Delete
            </Btn>
          </>
        }>
        <div style={{ padding: '12px 16px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#991b1b', fontWeight: 600 }}>⚠️ This action cannot be undone.</p>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Delete <strong>{selected?.fullName}</strong> ({selected?.matricNumber}) permanently from the system?
        </p>
      </Modal>

      {/* Add to registry modal */}
      <Modal open={showSeed} onClose={() => setShowSeed(false)} title="Add Student to Registry"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setShowSeed(false)}>Cancel</Btn>
            <Btn loading={seedMutation.isPending}
              onClick={() => {
                if (!seedForm.fullName || !seedForm.matricNumber) return toast.error('Name and matric number required')
                seedMutation.mutate({ ...seedForm, academicLevel: parseInt(seedForm.academicLevel) })
              }}>
              Add to Registry
            </Btn>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full Name" value={seedForm.fullName} onChange={e => setSeedForm(p => ({ ...p, fullName: e.target.value }))} placeholder="e.g. John Doe" required />
          <Field label="Matric Number" value={seedForm.matricNumber} onChange={e => setSeedForm(p => ({ ...p, matricNumber: e.target.value }))} placeholder="e.g. 22/10125" required />
          <Field label="Email (optional)" type="email" value={seedForm.email} onChange={e => setSeedForm(p => ({ ...p, email: e.target.value }))} placeholder="student@calebuniversity.edu.ng" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Academic Level</label>
            <select value={seedForm.academicLevel} onChange={e => setSeedForm(p => ({ ...p, academicLevel: e.target.value }))}
              style={{ padding: '10px 14px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)' }}>
              {[100,200,300,400].map(l => <option key={l} value={l}>{l} Level</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default AdminStudents
