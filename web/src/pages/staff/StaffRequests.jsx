import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import { SkRow } from '../../components/common/Skeleton'
import { getResourceTypeLabel, formatRelativeTime } from '../../utils/helpers'

const StaffRequests = () => {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['staff-requests'],
    queryFn: async () => { const r = await api.get('/staff/requests'); return r.data }
  })

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Student Requests</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Resources students have requested — upload them to fulfil requests
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
          data?.requests?.map((req, i) => (
            <div key={req._id} style={{ padding: '16px 20px', borderBottom: i < data.requests.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700 }}>{req.title}</h3>
                <Badge color="yellow" dot>Pending</Badge>
              </div>
              {req.description && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{req.description}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>By: {req.requestedBy?.fullName} ({req.requestedBy?.matricNumber})</span>
                  {req.courseCode && <span>{req.courseCode}</span>}
                  {req.resourceType && <span>{getResourceTypeLabel(req.resourceType)}</span>}
                  <span>{formatRelativeTime(req.createdAt)}</span>
                </div>
                <Btn size="xs" variant="outline" onClick={() => navigate('/staff/upload')} icon={<ArrowRight size={12} />}>
                  Upload
                </Btn>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
export default StaffRequests
