import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Download, Eye, Trash2, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import { SkCard } from '../../components/common/Skeleton'
import { getFileIcon, getResourceTypeLabel, getResourceTypeColor, formatFileSize, formatRelativeTime, truncate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const typeColorMap = { lecture_notes:'blue', past_questions:'yellow', project_report:'green', code_example:'purple', dataset:'red', tutorial:'teal', technical_doc:'gray', other:'gray' }

const StaffMyUploads = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['staff-uploads', page],
    queryFn: async () => { const r = await api.get('/staff/uploads', { params: { page, limit: 12 } }); return r.data }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => { const r = await api.delete(`/staff/uploads/${id}`); return r.data },
    onSuccess: () => {
      toast.success('Resource deleted')
      queryClient.invalidateQueries(['staff-uploads'])
      queryClient.invalidateQueries(['staff-dashboard'])
    },
    onError: e => toast.error(e.response?.data?.error || 'Delete failed')
  })

  const confirmDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>My Uploads</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {data?.total ? `${data.total} resource${data.total !== 1 ? 's' : ''} uploaded` : 'Manage your uploaded resources'}
          </p>
        </div>
        <Btn onClick={() => navigate('/staff/upload')} icon={<Upload size={15} />}>Upload New</Btn>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <SkCard key={i} />)}
        </div>
      ) : data?.resources?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }}>
          <Upload size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No uploads yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Start sharing resources with your students</p>
          <Btn onClick={() => navigate('/staff/upload')} icon={<Upload size={14} />}>Upload First Resource</Btn>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16, marginBottom: 24 }}>
            {data.resources.map(r => (
              <div key={r._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 18, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: 'var(--card-shadow)', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--card-shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--card-shadow)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${getResourceTypeColor(r.resourceType)}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {getFileIcon(r.fileFormat)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Badge color={typeColorMap[r.resourceType] || 'gray'}>{getResourceTypeLabel(r.resourceType).split(' ')[0]}</Badge>
                    <Badge color={r.isApproved ? 'green' : 'yellow'} dot>{r.isApproved ? 'Live' : 'Pending'}</Badge>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.35 }}>{truncate(r.title, 52)}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.courseCode} · {r.academicLevel}L · {formatFileSize(r.fileSize)}</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ padding: '8px 10px', background: 'var(--page-bg-2)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--blue-600)' }}>{r.downloadCount}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Downloads</div>
                  </div>
                  <div style={{ padding: '8px 10px', background: 'var(--page-bg-2)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#8b5cf6' }}>{r.viewCount || 0}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Views</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRelativeTime(r.createdAt)}</span>
                  <button
                    onClick={() => confirmDelete(r._id, r.title)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '4px 8px', borderRadius: 6, transition: 'var(--transition)', fontFamily: 'var(--font)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {Array.from({ length: data.pages }, (_, i) => (
                <Btn key={i} size="sm" variant={page === i+1 ? 'primary' : 'secondary'} onClick={() => setPage(i+1)}>
                  {i+1}
                </Btn>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
export default StaffMyUploads
