import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, BookOpen, ArrowRight, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { downloadResource } from '../../services/downloadService'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import { SkRow } from '../../components/common/Skeleton'
import { getFileIcon, getResourceTypeLabel, getResourceTypeColor, formatRelativeTime, formatDate, truncate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const typeColorMap = {
  lecture_notes:'blue', past_questions:'yellow', project_report:'green',
  code_example:'purple', dataset:'red', tutorial:'teal', technical_doc:'gray', other:'gray'
}

const StudentDownloads = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [downloading, setDownloading] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ['download-history', page],
    queryFn: async () => {
      const r = await api.get('/student/downloads/history', { params: { page, limit: 20 } })
      return r.data
    }
  })

  const handleDownload = async (e, id) => {
    e.stopPropagation()
    if (downloading[id]) return
    setDownloading(p => ({ ...p, [id]: true }))
    try {
      await downloadResource(id)
      toast.success('Download started')
    } catch {
      toast.error('Download failed')
    } finally {
      setDownloading(p => ({ ...p, [id]: false }))
    }
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Download History</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {data?.total ? `${data.total} resource${data.total !== 1 ? 's' : ''} downloaded` : 'Everything you have downloaded'}
        </p>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
        {isLoading ? (
          <div style={{ padding: '8px 12px' }}>
            {[1,2,3,4,5].map(i => <SkRow key={i} />)}
          </div>
        ) : data?.logs?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Download size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              No downloads yet
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Resources you download will be tracked here
            </p>
            <Btn onClick={() => navigate('/student/library')} icon={<ArrowRight size={14} />}>
              Browse Library
            </Btn>
          </div>
        ) : (
          <>
            {data.logs.map((log, i) => {
              const r = log.resourceId
              return (
                <div
                  key={log._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px',
                    borderBottom: i < data.logs.length - 1 ? '1px solid var(--card-border)' : 'none',
                    transition: 'var(--transition)',
                    cursor: r ? 'pointer' : 'default'
                  }}
                  onMouseEnter={e => { if (r) e.currentTarget.style.background = 'var(--page-bg-2)' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => r && navigate(`/student/resources/${r._id}`)}
                >
                  {/* File icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    background: r ? `${getResourceTypeColor(r.resourceType)}12` : 'var(--page-bg-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                  }}>
                    {r ? getFileIcon(r.fileFormat) : <BookOpen size={18} color="var(--text-muted)" />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
                      {r ? truncate(r.title, 55) : log.description || 'Resource deleted'}
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      {r?.courseCode && <span>{r.courseCode}</span>}
                      {r?.academicLevel && <span>{r.academicLevel}L</span>}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={11} />
                        {formatRelativeTime(log.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Right side */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {r && (
                      <Badge color={typeColorMap[r.resourceType] || 'gray'}>
                        {getResourceTypeLabel(r.resourceType).split(' ')[0]}
                      </Badge>
                    )}
                    {r && (
                      <Btn
                        size="xs"
                        variant="outline"
                        icon={<Download size={12} />}
                        loading={!!downloading[r._id]}
                        onClick={e => handleDownload(e, r._id)}
                      >
                        Again
                      </Btn>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {data?.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {Array.from({ length: data.pages }, (_, i) => (
            <Btn key={i} size="sm" variant={page === i+1 ? 'primary' : 'secondary'} onClick={() => setPage(i+1)}>
              {i+1}
            </Btn>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentDownloads
