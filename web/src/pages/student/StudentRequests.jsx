import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Plus, Clock, CheckCircle, XCircle } from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import Field from '../../components/common/Field'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import { SkRow } from '../../components/common/Skeleton'
import { formatRelativeTime, getResourceTypeLabel } from '../../utils/helpers'
import toast from 'react-hot-toast'

const statusConfig = {
  pending: { color: 'yellow', icon: Clock, label: 'Pending' },
  assigned: { color: 'blue', icon: Clock, label: 'Assigned' },
  fulfilled: { color: 'green', icon: CheckCircle, label: 'Fulfilled' },
  rejected: { color: 'red', icon: XCircle, label: 'Rejected' }
}

const StudentRequests = () => {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', courseCode: '', academicLevel: '', resourceType: '' })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const { data, isLoading } = useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => { const r = await api.get('/student/requests'); return r.data }
  })

  const createMutation = useMutation({
    mutationFn: async (data) => { const r = await api.post('/student/requests', data); return r.data },
    onSuccess: () => {
      toast.success('Request submitted')
      queryClient.invalidateQueries(['my-requests'])
      setShowModal(false)
      setForm({ title: '', description: '', courseCode: '', academicLevel: '', resourceType: '' })
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed to submit')
  })

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>My Requests</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Request resources that are missing from the library</p>
        </div>
        <Btn onClick={() => setShowModal(true)} icon={<Plus size={15} />}>New Request</Btn>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
        {isLoading ? (
          <div style={{ padding: '8px 12px' }}>{[1,2,3].map(i => <SkRow key={i} />)}</div>
        ) : data?.requests?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <MessageSquare size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No requests yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Can't find a resource? Submit a request and staff will upload it.</p>
            <Btn onClick={() => setShowModal(true)} icon={<Plus size={14} />}>Submit Request</Btn>
          </div>
        ) : (
          data?.requests?.map((req, i) => {
            const s = statusConfig[req.status] || statusConfig.pending
            const Icon = s.icon
            return (
              <div key={req._id} style={{ padding: '16px 20px', borderBottom: i < data.requests.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>{req.title}</h3>
                  <Badge color={s.color} dot>{s.label}</Badge>
                </div>
                {req.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.5 }}>{req.description}</p>}
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  {req.courseCode && <span>{req.courseCode}</span>}
                  {req.resourceType && <span>{getResourceTypeLabel(req.resourceType)}</span>}
                  <span>{formatRelativeTime(req.createdAt)}</span>
                </div>
                {req.adminNote && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--page-bg-2)', borderRadius: 6, fontSize: 12, color: 'var(--text-secondary)', borderLeft: '3px solid var(--blue-500)' }}>
                    <strong>Admin note:</strong> {req.adminNote}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Request a Resource"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn loading={createMutation.isPending} onClick={() => {
              if (!form.title.trim()) return toast.error('Title is required')
              createMutation.mutate(form)
            }}>Submit Request</Btn>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Resource Title" value={form.title} onChange={set('title')}
            placeholder="e.g. CSC401 Past Questions 2023" required
            hint="Be as specific as possible" />
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Course Code" value={form.courseCode} onChange={set('courseCode')}
              placeholder="CSC401" style={{ flex: 1 }} />
            <Select label="Level" value={form.academicLevel} onChange={set('academicLevel')}
              style={{ flex: 1 }}
              options={[
                { value: '', label: 'Any level' },
                { value: '100', label: '100 Level' },
                { value: '200', label: '200 Level' },
                { value: '300', label: '300 Level' },
                { value: '400', label: '400 Level' }
              ]} />
          </div>
          <Select label="Resource Type" value={form.resourceType} onChange={set('resourceType')}
            options={[
              { value: '', label: 'Any type' },
              { value: 'lecture_notes', label: 'Lecture Notes' },
              { value: 'past_questions', label: 'Past Questions' },
              { value: 'project_report', label: 'Project Report' },
              { value: 'code_example', label: 'Code Example' },
              { value: 'tutorial', label: 'Tutorial' },
              { value: 'other', label: 'Other' }
            ]} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Additional Details</label>
            <textarea value={form.description} onChange={set('description')}
              placeholder="Any extra context that would help staff find or create this resource..."
              rows={3}
              style={{ padding: '10px 14px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', fontFamily: 'var(--font)' }} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default StudentRequests
