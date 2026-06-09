import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Megaphone, Plus, Trash2, Pin } from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import Modal from '../../components/common/Modal'
import Field from '../../components/common/Field'
import { SkRow } from '../../components/common/Skeleton'
import { formatRelativeTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminAnnouncements = () => {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', targetRole: 'all', isPinned: false })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const { data, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => { const r = await api.get('/admin/announcements'); return r.data }
  })

  const createMutation = useMutation({
    mutationFn: async (d) => { const r = await api.post('/admin/announcements', d); return r.data },
    onSuccess: () => {
      toast.success('Announcement posted')
      queryClient.invalidateQueries(['admin-announcements'])
      setShowCreate(false)
      setForm({ title: '', content: '', targetRole: 'all', isPinned: false })
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => { const r = await api.delete(`/admin/announcements/${id}`); return r.data },
    onSuccess: () => { toast.success('Announcement removed'); queryClient.invalidateQueries(['admin-announcements']) },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Announcements</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>System-wide notices for students and staff</p>
        </div>
        <Btn onClick={() => setShowCreate(true)} icon={<Plus size={15} />}>Post Announcement</Btn>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
        {isLoading ? (
          <div style={{ padding: '8px 12px' }}>{[1,2,3].map(i => <SkRow key={i} />)}</div>
        ) : data?.announcements?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Megaphone size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 20 }}>No announcements yet</p>
            <Btn onClick={() => setShowCreate(true)} icon={<Plus size={14} />}>Post First Announcement</Btn>
          </div>
        ) : data?.announcements?.map((a, i) => (
          <div key={a._id} style={{
            padding: '16px 20px',
            borderBottom: i < data.announcements.length - 1 ? '1px solid var(--card-border)' : 'none',
            borderLeft: `3px solid ${a.isPinned ? '#f59e0b' : 'var(--blue-500)'}`,
            background: a.isPinned ? '#fffbeb' : 'transparent'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {a.isPinned && <Pin size={13} color="#f59e0b" />}
                <h3 style={{ fontSize: 14, fontWeight: 700 }}>{a.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge color={a.targetRole === 'all' ? 'blue' : a.targetRole === 'student' ? 'blue' : 'green'}>
                  {a.targetRole === 'all' ? 'Everyone' : a.targetRole === 'student' ? 'Students' : 'Staff'}
                </Badge>
                {a.isPinned && <Badge color="yellow">Pinned</Badge>}
                <Btn size="xs" variant="ghost" onClick={() => deleteMutation.mutate(a._id)}
                  loading={deleteMutation.isPending} icon={<Trash2 size={12} />}
                  style={{ color: '#ef4444' }}>Remove</Btn>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{a.content}</p>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              By {a.createdBy?.fullName} · {formatRelativeTime(a.createdAt)}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Post Announcement"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Btn>
            <Btn loading={createMutation.isPending} onClick={() => {
              if (!form.title.trim() || !form.content.trim()) return toast.error('Title and content required')
              createMutation.mutate(form)
            }}>Post Announcement</Btn>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Title" value={form.title} onChange={set('title')} placeholder="e.g. Exam Timetable Released" required />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Audience</label>
            <select value={form.targetRole} onChange={set('targetRole')}
              style={{ padding: '10px 14px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)' }}>
              <option value="all">Everyone</option>
              <option value="student">Students only</option>
              <option value="faculty">Staff only</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Content <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea value={form.content} onChange={set('content')} rows={5}
              placeholder="Write your announcement..."
              style={{ padding: '10px 14px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', fontFamily: 'var(--font)' }}
              onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
              onBlur={e => e.target.style.borderColor = 'var(--card-border)'} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isPinned}
              onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Pin this announcement (shows at top)</span>
          </label>
        </div>
      </Modal>
    </div>
  )
}
export default AdminAnnouncements
