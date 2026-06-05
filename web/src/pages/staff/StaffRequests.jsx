import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, CheckCircle, XCircle, Upload, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

const StaffRequests = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['staff-requests'],
    queryFn: async () => { const r = await api.get('/staff/requests'); return r.data }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, adminNote }) => {
      const r = await api.put(`/staff/requests/${id}`, { status, adminNote })
      return r.data
    },
    onSuccess: (_, vars) => {
      toast.success(vars.status === 'fulfilled' ? 'Marked as fulfilled' : 'Request updated')
      queryClient.invalidateQueries(['staff-requests'])
      setSelected(null)
      setNote('')
    },
    onError: e => toast.error(e.response?.data?.error || 'Update failed')
  })

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Student Requests</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Resources students have requested — upload them and mark as fulfilled
        </p>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
        {isLoading ? (
          <div style={{ padding: '8px 12px' }}>{[1,2,3].map(i => <SkRow key={i} />)}</div>
        ) : data?.requests?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <MessageSquare size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No pending requests</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Student requests will appear here</p>
          </div>
        ) : (
          data?.requests?.map((req, i) => {
            const s = statusConfig[req.status] || statusConfig.pending
            return (
              <div key={req._id} style={{
                padding: '16px 20px',
                borderBottom: i < data.requests.length - 1 ? '1px solid var(--card-border)' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>{req.title}</h3>
                  <Badge color={s.color} dot>{s.label}</Badge>
                </div>

                {req.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
                    {req.description}
                  </p>
                )}

                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                  By: <strong>{req.requestedBy?.fullName}</strong> ({req.requestedBy?.matricNumber})
                  {req.courseCode && <span> · {req.courseCode}</span>}
                  {req.resourceType && <span> · {getResourceTypeLabel(req.resourceType)}</span>}
                  <span> · {formatRelativeTime(req.createdAt)}</span>
                </div>

                {req.adminNote && (
                  <div style={{ marginBottom: 10, padding: '8px 12px', background: 'var(--page-bg-2)', borderRadius: 6, fontSize: 12, color: 'var(--text-secondary)', borderLeft: '3px solid var(--blue-500)' }}>
                    <strong>Note:</strong> {req.adminNote}
                  </div>
                )}

                {req.status !== 'fulfilled' && req.status !== 'rejected' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn size="xs" variant="outline" onClick={() => navigate('/staff/upload')} icon={<Upload size={12} />}>
                      Upload Resource
                    </Btn>
                    <Btn size="xs" variant="success"
                      onClick={() => updateMutation.mutate({ id: req._id, status: 'fulfilled', adminNote: 'Request fulfilled' })}
                      loading={updateMutation.isPending}
                      icon={<CheckCircle size={12} />}
                      style={{ background: '#10b981', color: '#fff' }}>
                      Mark Fulfilled
                    </Btn>
                    <Btn size="xs" variant="ghost"
                      onClick={() => setSelected(req)}
                      icon={<XCircle size={12} />}
                      style={{ color: '#ef4444' }}>
                      Reject
                    </Btn>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Reject modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setNote('') }}
        title="Reject Request"
        footer={
          <>
            <Btn variant="secondary" onClick={() => { setSelected(null); setNote('') }}>Cancel</Btn>
            <Btn variant="danger" loading={updateMutation.isPending}
              onClick={() => updateMutation.mutate({ id: selected._id, status: 'rejected', adminNote: note || 'Request rejected' })}>
              Confirm Rejection
            </Btn>
          </>
        }>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Rejecting: <strong>{selected?.title}</strong>
        </p>
        <Field label="Reason (optional)" value={note} onChange={e => setNote(e.target.value)}
          placeholder="Explain why this request cannot be fulfilled..." />
      </Modal>
    </div>
  )
}
export default StaffRequests
