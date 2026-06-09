import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import Modal from '../../components/common/Modal'
import Field from '../../components/common/Field'
import { SkRow } from '../../components/common/Skeleton'
import { getResourceTypeLabel, formatRelativeTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const statusConfig = {
  pending: { color: 'yellow', label: 'Pending' },
  assigned: { color: 'blue', label: 'Assigned' },
  fulfilled: { color: 'green', label: 'Fulfilled' },
  rejected: { color: 'red', label: 'Rejected' }
}

const AdminRequests = () => {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState(null)
  const [note, setNote] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-requests', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? { status: statusFilter } : {}
      const r = await api.get('/admin/requests', { params })
      return r.data
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, adminNote }) => { const r = await api.put(`/admin/requests/${id}`, { status, adminNote }); return r.data },
    onSuccess: (_, vars) => {
      toast.success(`Request ${vars.status}`)
      queryClient.invalidateQueries(['admin-requests'])
      setAction(null); setNote('')
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const sel = { padding: '8px 12px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Resource Requests</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {data?.total ? `${data.total} request${data.total !== 1 ? 's' : ''}` : 'Student resource requests'}
        </p>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 20, boxShadow: 'var(--card-shadow)' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={sel}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
        {isLoading ? (
          <div style={{ padding: '8px 12px' }}>{[1,2,3].map(i => <SkRow key={i} />)}</div>
        ) : data?.requests?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <MessageSquare size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No requests found</p>
          </div>
        ) : data?.requests?.map((req, i) => {
          const s = statusConfig[req.status] || statusConfig.pending
          return (
            <div key={req._id} style={{ padding: '16px 20px', borderBottom: i < data.requests.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700 }}>{req.title}</h3>
                <Badge color={s.color} dot>{s.label}</Badge>
              </div>
              {req.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{req.description}</p>}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: req.status === 'pending' ? 10 : 0, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>By: <strong>{req.requestedBy?.fullName}</strong> ({req.requestedBy?.matricNumber})</span>
                {req.courseCode && <span>{req.courseCode}</span>}
                {req.resourceType && <span>{getResourceTypeLabel(req.resourceType)}</span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{formatRelativeTime(req.createdAt)}</span>
              </div>
              {req.adminNote && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--page-bg-2)', borderRadius: 6, fontSize: 12, borderLeft: '3px solid var(--blue-500)' }}>
                  <strong>Note:</strong> {req.adminNote}
                </div>
              )}
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Btn size="xs" variant="success" icon={<CheckCircle size={12} />}
                    onClick={() => updateMutation.mutate({ id: req._id, status: 'fulfilled', adminNote: 'Fulfilled by admin' })}
                    loading={updateMutation.isPending} style={{ background: '#10b981', color: '#fff' }}>
                    Mark Fulfilled
                  </Btn>
                  <Btn size="xs" variant="ghost" icon={<XCircle size={12} />}
                    onClick={() => { setSelected(req); setAction('reject') }}
                    style={{ color: '#ef4444' }}>
                    Reject
                  </Btn>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Modal open={action === 'reject'} onClose={() => { setAction(null); setNote('') }} title="Reject Request"
        footer={
          <>
            <Btn variant="secondary" onClick={() => { setAction(null); setNote('') }}>Cancel</Btn>
            <Btn variant="danger" loading={updateMutation.isPending}
              onClick={() => updateMutation.mutate({ id: selected._id, status: 'rejected', adminNote: note || 'Request rejected' })}>
              Reject Request
            </Btn>
          </>
        }>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Rejecting: <strong>{selected?.title}</strong>
        </p>
        <Field label="Reason (optional)" value={note} onChange={e => setNote(e.target.value)}
          placeholder="Explain why this cannot be fulfilled..." />
      </Modal>
    </div>
  )
}
export default AdminRequests
