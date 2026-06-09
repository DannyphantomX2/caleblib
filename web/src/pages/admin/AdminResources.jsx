import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Eye, Trash2, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import Modal from '../../components/common/Modal'
import Field from '../../components/common/Field'
import { SkRow } from '../../components/common/Skeleton'
import { getFileIcon, getResourceTypeLabel, getResourceTypeColor, formatFileSize, formatRelativeTime, truncate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const typeColorMap = { lecture_notes:'blue', past_questions:'yellow', project_report:'green', code_example:'purple', dataset:'red', tutorial:'teal', technical_doc:'gray', other:'gray' }

const AdminResources = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState(null)
  const [reason, setReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending'],
    queryFn: async () => { const r = await api.get('/admin/resources/pending'); return r.data }
  })

  const approveMutation = useMutation({
    mutationFn: async (id) => { const r = await api.put(`/admin/resources/${id}/approve`); return r.data },
    onSuccess: () => { toast.success('Resource approved and published'); queryClient.invalidateQueries(['admin-pending']); queryClient.invalidateQueries(['admin-dashboard']) },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }) => { const r = await api.put(`/admin/resources/${id}/reject`, { reason }); return r.data },
    onSuccess: () => { toast.success('Resource rejected'); queryClient.invalidateQueries(['admin-pending']); setAction(null); setReason('') },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => { const r = await api.delete(`/admin/resources/${id}`); return r.data },
    onSuccess: () => { toast.success('Resource deleted'); queryClient.invalidateQueries(['admin-pending']); setAction(null) },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Resource Approval</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {data?.total ? `${data.total} resource${data.total !== 1 ? 's' : ''} awaiting approval` : 'Review and approve uploaded resources'}
        </p>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
        {isLoading ? (
          <div style={{ padding: '8px 12px' }}>{[1,2,3].map(i => <SkRow key={i} />)}</div>
        ) : data?.resources?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>All caught up!</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No resources pending approval</p>
          </div>
        ) : (
          data?.resources?.map((r, i) => (
            <div key={r._id} style={{ padding: '18px 20px', borderBottom: i < data.resources.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${getResourceTypeColor(r.resourceType)}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {getFileIcon(r.fileFormat)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <Badge color={typeColorMap[r.resourceType] || 'gray'}>{getResourceTypeLabel(r.resourceType)}</Badge>
                    <Badge color="blue">{r.academicLevel}L</Badge>
                    <Badge color="gray">{r.semester === 'first' ? '1st' : '2nd'} Sem</Badge>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{r.title}</h3>
                  {r.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.5 }}>{truncate(r.description, 100)}</p>}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>{r.courseCode}{r.courseTitle ? ` — ${r.courseTitle}` : ''}</span>
                    <span>By: {r.contributor?.fullName} ({r.contributor?.role})</span>
                    <span>{formatFileSize(r.fileSize)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{formatRelativeTime(r.createdAt)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Btn size="sm" onClick={() => approveMutation.mutate(r._id)}
                    loading={approveMutation.isPending} icon={<CheckCircle size={14} />}>
                    Approve
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={() => { setSelected(r); setAction('reject') }}
                    icon={<XCircle size={14} />} style={{ color: '#f59e0b' }}>
                    Reject
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={() => { setSelected(r); setAction('delete') }}
                    icon={<Trash2 size={14} />} style={{ color: '#ef4444' }}>
                    Delete
                  </Btn>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={action === 'reject'} onClose={() => { setAction(null); setReason('') }} title="Reject Resource"
        footer={
          <>
            <Btn variant="secondary" onClick={() => { setAction(null); setReason('') }}>Cancel</Btn>
            <Btn variant="danger" loading={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate({ id: selected._id, reason })}>
              Reject Resource
            </Btn>
          </>
        }>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Rejecting: <strong>{selected?.title}</strong>
        </p>
        <Field label="Reason for rejection" value={reason} onChange={e => setReason(e.target.value)}
          placeholder="e.g. Incorrect course code, duplicate resource..." hint="This will be logged in the audit trail" />
      </Modal>

      <Modal open={action === 'delete'} onClose={() => setAction(null)} title="Delete Resource"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setAction(null)}>Cancel</Btn>
            <Btn variant="danger" loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(selected._id)}>Delete Permanently</Btn>
          </>
        }>
        <div style={{ padding: '12px 16px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#991b1b', fontWeight: 600 }}>⚠️ This cannot be undone.</p>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Delete <strong>{selected?.title}</strong> permanently?</p>
      </Modal>
    </div>
  )
}
export default AdminResources
