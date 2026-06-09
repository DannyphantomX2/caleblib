import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Search, Trash2, Plus, Upload } from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import Modal from '../../components/common/Modal'
import Field from '../../components/common/Field'
import { SkRow } from '../../components/common/Skeleton'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminRegistry = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', matricNumber: '', academicLevel: '400' })

  const { data, isLoading } = useQuery({
    queryKey: ['registry', search, page, filter],
    queryFn: async () => {
      const params = { page, limit: 25 }
      if (search) params.search = search
      if (filter !== '') params.registered = filter
      const r = await api.get('/admin/registry', { params })
      return r.data
    }
  })

  const addMutation = useMutation({
    mutationFn: async (d) => { const r = await api.post('/admin/registry', d); return r.data },
    onSuccess: () => {
      toast.success('Student added to registry')
      queryClient.invalidateQueries(['registry'])
      setShowAdd(false)
      setForm({ fullName: '', email: '', matricNumber: '', academicLevel: '400' })
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => { const r = await api.delete(`/admin/registry/${id}`); return r.data },
    onSuccess: () => { toast.success('Entry removed'); queryClient.invalidateQueries(['registry']) },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const sel = { padding: '8px 12px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Student Registry</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {data?.total ? `${data.total} entries` : 'Pre-approved students who can register'}
          </p>
        </div>
        <Btn onClick={() => setShowAdd(true)} icon={<Plus size={15} />}>Add Student</Btn>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 20, boxShadow: 'var(--card-shadow)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, matric or email..."
            style={{ width: '100%', padding: '9px 14px 9px 36px', background: 'var(--page-bg-2)', border: '1.5px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font)' }} />
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }} style={sel}>
          <option value="">All Status</option>
          <option value="true">Registered</option>
          <option value="false">Not Yet Registered</option>
        </select>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--card-border)', background: 'var(--page-bg-2)' }}>
              {['Name', 'Matric No.', 'Email', 'Level', 'Status', 'Added', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ padding: 20 }}>{[1,2,3,4,5].map(i => <SkRow key={i} />)}</td></tr>
            ) : data?.entries?.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>No entries found</td></tr>
            ) : data?.entries?.map(e => (
              <tr key={e._id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'var(--transition)' }}
                onMouseEnter={ev => ev.currentTarget.style.background = 'var(--page-bg-2)'}
                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '10px 16px', fontWeight: 600 }}>{e.fullName}</td>
                <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{e.matricNumber}</td>
                <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 12 }}>{e.email || '—'}</td>
                <td style={{ padding: '10px 16px' }}>{e.academicLevel}L</td>
                <td style={{ padding: '10px 16px' }}>
                  <Badge color={e.isRegistered ? 'green' : 'gray'} dot>
                    {e.isRegistered ? 'Registered' : 'Pending'}
                  </Badge>
                </td>
                <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(e.createdAt)}</td>
                <td style={{ padding: '10px 16px' }}>
                  {!e.isRegistered && (
                    <Btn size="xs" variant="ghost" onClick={() => deleteMutation.mutate(e._id)}
                      loading={deleteMutation.isPending} icon={<Trash2 size={12} />}
                      style={{ color: '#ef4444' }}>Remove</Btn>
                  )}
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

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Student to Registry"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn loading={addMutation.isPending} onClick={() => {
              if (!form.fullName || !form.matricNumber) return toast.error('Name and matric number required')
              addMutation.mutate({ ...form, academicLevel: parseInt(form.academicLevel) })
            }}>Add Student</Btn>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full Name" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Full name as on admission letter" required />
          <Field label="Matric Number" value={form.matricNumber} onChange={e => setForm(p => ({ ...p, matricNumber: e.target.value }))} placeholder="22/10125" required />
          <Field label="Email (optional)" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="student@calebuniversity.edu.ng" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Academic Level</label>
            <select value={form.academicLevel} onChange={e => setForm(p => ({ ...p, academicLevel: e.target.value }))}
              style={{ padding: '10px 14px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)' }}>
              {[100,200,300,400].map(l => <option key={l} value={l}>{l} Level</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default AdminRegistry
