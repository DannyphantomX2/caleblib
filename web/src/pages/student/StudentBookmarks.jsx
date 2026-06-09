import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, BookmarkX, Download, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { downloadResource } from '../../services/downloadService'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import { SkRow } from '../../components/common/Skeleton'
import { getFileIcon, getResourceTypeLabel, getResourceTypeColor, formatFileSize, formatRelativeTime, truncate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const typeColorMap = {
  lecture_notes:'blue', past_questions:'yellow', project_report:'green',
  code_example:'purple', dataset:'red', tutorial:'teal', technical_doc:'gray', other:'gray'
}

const StudentBookmarks = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const r = await api.get('/student/bookmarks')
      return r.data
    }
  })

  const removeMutation = useMutation({
    mutationFn: async (id) => {
      const r = await api.post(`/student/bookmarks/${id}`)
      return r.data
    },
    onSuccess: () => {
      toast.success('Bookmark removed')
      queryClient.invalidateQueries(['bookmarks'])
    }
  })

  const handleDownload = async (e, id) => {
    e.stopPropagation()
    try {
      await downloadResource(id)
      toast.success('Download started')
    } catch {
      toast.error('Download failed')
    }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>My Bookmarks</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {data?.bookmarks?.length
            ? `${data.bookmarks.length} saved resource${data.bookmarks.length !== 1 ? 's' : ''}`
            : 'Resources you save will appear here'}
        </p>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
        {isLoading ? (
          <div style={{ padding: '8px 12px' }}>{[1,2,3,4].map(i => <SkRow key={i} />)}</div>
        ) : data?.bookmarks?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Bookmark size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No bookmarks yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Browse the library and bookmark resources to find them quickly later
            </p>
            <Btn onClick={() => navigate('/student/library')} icon={<ArrowRight size={14} />}>
              Browse Library
            </Btn>
          </div>
        ) : (
          <div>
            {data.bookmarks.map((b, i) => {
              const r = b.resource
              if (!r) return null
              return (
                <div
                  key={b._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px',
                    borderBottom: i < data.bookmarks.length - 1 ? '1px solid var(--card-border)' : 'none',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${getResourceTypeColor(r.resourceType)}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {getFileIcon(r.fileFormat)}
                  </div>
                  <div
                    style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                    onClick={() => navigate(`/student/resources/${r._id}`)}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{truncate(r.title, 55)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {r.courseCode}{r.courseTitle ? ` · ${r.courseTitle}` : ''} · {formatRelativeTime(b.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge color={typeColorMap[r.resourceType] || 'gray'}>
                      {getResourceTypeLabel(r.resourceType).split(' ')[0]}
                    </Badge>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatFileSize(r.fileSize)}</span>
                    <Btn
                      size="xs"
                      variant="outline"
                      icon={<Download size={12} />}
                      onClick={e => handleDownload(e, r._id)}
                    >
                      Download
                    </Btn>
                    <Btn
                      size="xs"
                      variant="ghost"
                      icon={<BookmarkX size={13} />}
                      onClick={() => removeMutation.mutate(r._id)}
                      loading={removeMutation.isPending}
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Remove
                    </Btn>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentBookmarks
