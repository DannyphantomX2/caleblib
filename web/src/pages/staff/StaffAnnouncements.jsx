import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Megaphone, Plus, Pin } from 'lucide-react'
import api from '../../services/api'
import Field from '../../components/common/Field'
import Select from '../../components/common/Select'
import Btn from '../../components/common/Btn'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'
import { SkRow } from '../../components/common/Skeleton'
import { formatRelativeTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const StaffAnnouncements = () => {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', targetRole: 'student' })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const { data, isLoading } = useQuery({
    queryKey: ['staff-announcements'],
    queryFn: async () => { const r = await api.get('/staff/announcements'); return r.data }
  })

  const createMutation = useMutation({
    mutationFn: async (d) => { const r = await api.post('/staff/announcements', d); return r.data },
    onSuccess: () => {
      toast.success('Announcement posted')
      queryClient.invalidateQueries(['staff-announcements'])
      setShowModal(false)
      setForm({ title: '', content: '', targetRole: 'student' })
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Announcements</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Post notices to students</p>
        </div>
        <Btn onClick={() => setShowModal(true)} icon={<Plus size={15} />}>New Announcement</Btn>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
        {isLoading ? (
          <div style={{ padding: '8px 12px' }}>{[1,2,3].map(i => <SkRow key={i} />)}</div>
        ) : data?.announcements?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Megaphone size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No announcements yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Post an announcement to notify students</p>
            <Btn onClick={() => setShowModal(true)} icon={<Plus size={14} />}>Post First Announcement</Btn>
          </div>
        ) : (
          data?.announcements?.map((a, i) => (
            <div key={a._id} style={{ padding: '16px 20px', borderBottom: i < data.announcements.length - 1 ? '1px solid var(--card-border)' : 'none', borderLeft: a.isPinned ? '3px solid #f59e0b' : '3px solid transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {a.isPinned && <Pin size={13} color="#f59e0b" />}
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>{a.title}</h3>
                </div>
                <Badge color={a.targetRole === 'all' ? 'blue' : 'green'}>{a.targetRole === 'all' ? 'Everyone' : a.targetRole}</Badge>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>{a.content}</p>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                By {a.createdBy?.fullName} · {formatRelativeTime(a.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Post Announcement"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn loading={createMutation.isPending} onClick={() => {
              if (!form.title.trim() || !form.content.trim()) return toast.error('Title and content are required')
              createMutation.mutate(form)
            }}>Post Announcement</Btn>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Title" value={form.title} onChange={set('title')} placeholder="e.g. CSC401 Assignment Deadline Extended" required />
          <Select label="Audience" value={form.targetRole} onChange={set('targetRole')}
            options={[
              { value: 'student', label: 'Students only' },
              { value: 'all', label: 'Everyone' }
            ]} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Content <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea value={form.content} onChange={set('content')} placeholder="Write your announcement here..." rows={5}
              style={{ padding: '10px 14px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', fontFamily: 'var(--font)' }}
              onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
              onBlur={e => e.target.style.borderColor = 'var(--card-border)'} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default StaffAnnouncements
