import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Bookmark, BookmarkCheck, ArrowLeft, Star, User, Calendar, FileText, Tag, Eye } from 'lucide-react'
import api from '../../services/api'
import { downloadResource } from '../../services/downloadService'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import { Sk } from '../../components/common/Skeleton'
import { getFileIcon, getResourceTypeLabel, getResourceTypeColor, formatFileSize, formatDate, formatRelativeTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const typeColorMap = {
  lecture_notes:'blue', past_questions:'yellow', project_report:'green',
  code_example:'purple', dataset:'red', tutorial:'teal', technical_doc:'gray', other:'gray'
}

const StudentResourceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [comment, setComment] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const r = await api.get(`/student/resources/${id}`)
      return r.data
    }
  })

    const downloadMutation = useMutation({
    mutationFn: async () => {
      await downloadResource(id)
    },
    onSuccess: () => {
      toast.success('Download started')
      queryClient.invalidateQueries(['resource', id])
    },
    onError: () => toast.error('Download failed')
  })

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const r = await api.post(`/student/bookmarks/${id}`)
      return r.data
    },
    onSuccess: (d) => {
      toast.success(d.bookmarked ? 'Bookmarked' : 'Bookmark removed')
      queryClient.invalidateQueries(['resource', id])
      queryClient.invalidateQueries(['bookmarks'])
    }
  })

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const r = await api.post(`/student/resources/${id}/review`, { rating, comment })
      return r.data
    },
    onSuccess: () => {
      toast.success('Review submitted')
      setRating(0)
      setComment('')
      queryClient.invalidateQueries(['resource', id])
    },
    onError: e => toast.error(e.response?.data?.error || 'Review failed')
  })

  if (isLoading) return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 20 }}><Sk w={80} h={32} /></div>
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 28 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <Sk w={64} h={64} r={14} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Sk w="70%" h={22} />
            <Sk w="45%" h={14} />
          </div>
        </div>
        <Sk w="100%" h={80} />
      </div>
    </div>
  )

  const r = data?.resource
  if (!r) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <p style={{ color: 'var(--text-muted)' }}>Resource not found</p>
      <Btn variant="ghost" onClick={() => navigate('/student/library')} style={{ marginTop: 16 }}>
        Back to Library
      </Btn>
    </div>
  )

  const card = {
    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
    borderRadius: 'var(--radius)', padding: 24,
    boxShadow: 'var(--card-shadow)', marginBottom: 16
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <Btn variant="ghost" size="sm" onClick={() => navigate('/student/library')}
        icon={<ArrowLeft size={14} />} style={{ marginBottom: 20 }}>
        Back to Library
      </Btn>

      <div style={card}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 14,
            background: `${getResourceTypeColor(r.resourceType)}12`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, flexShrink: 0
          }}>
            {getFileIcon(r.fileFormat)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <Badge color={typeColorMap[r.resourceType] || 'gray'}>{getResourceTypeLabel(r.resourceType)}</Badge>
              <Badge color="blue">{r.academicLevel}L</Badge>
              <Badge color="gray">{r.semester === 'first' ? '1st' : '2nd'} Semester</Badge>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, lineHeight: 1.3 }}>{r.title}</h1>
            {r.description && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.description}</p>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { icon: FileText, label: 'Course', value: `${r.courseCode}${r.courseTitle ? ' — ' + r.courseTitle : ''}` },
            { icon: User, label: 'Uploaded by', value: r.contributor?.fullName || 'Unknown' },
            { icon: Calendar, label: 'Uploaded', value: formatDate(r.createdAt) },
            { icon: Download, label: 'Downloads', value: r.downloadCount },
            { icon: Eye, label: 'Views', value: r.viewCount || 0 },
            { icon: FileText, label: 'File size', value: formatFileSize(r.fileSize) }
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ padding: '10px 14px', background: 'var(--page-bg-2)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <Icon size={12} color="var(--text-muted)" />
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        {r.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
            <Tag size={13} color="var(--text-muted)" />
            {r.tags.map(t => (
              <span key={t} style={{
                fontSize: 12, padding: '3px 10px',
                background: 'var(--page-bg-2)', borderRadius: 20,
                border: '1px solid var(--card-border)',
                color: 'var(--text-secondary)'
              }}>{t}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn size="lg" onClick={() => downloadMutation.mutate()}
            loading={downloadMutation.isPending} icon={<Download size={16} />}>
            Download File
          </Btn>
          <Btn size="lg" variant="secondary"
            onClick={() => bookmarkMutation.mutate()}
            loading={bookmarkMutation.isPending}
            icon={data?.isBookmarked
              ? <BookmarkCheck size={16} color="var(--blue-600)" />
              : <Bookmark size={16} />
            }>
            {data?.isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Btn>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Rate this Resource</h2>
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={28}
              fill={(hoveredStar || rating) >= s ? '#f59e0b' : 'transparent'}
              color={(hoveredStar || rating) >= s ? '#f59e0b' : 'var(--card-border)'}
              style={{ cursor: 'pointer', transition: 'var(--transition)' }}
              onMouseEnter={() => setHoveredStar(s)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(s)}
            />
          ))}
          {rating > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8, alignSelf: 'center' }}>
              {['','Poor','Fair','Good','Very Good','Excellent'][rating]}
            </span>
          )}
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your thoughts about this resource (optional)..."
          rows={3}
          style={{
            width: '100%', padding: '10px 14px',
            background: 'var(--page-bg-2)',
            border: '1.5px solid var(--card-border)',
            borderRadius: 10, color: 'var(--text-primary)',
            fontSize: 14, resize: 'vertical',
            fontFamily: 'var(--font)', marginBottom: 12
          }}
          onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
          onBlur={e => e.target.style.borderColor = 'var(--card-border)'}
        />
        <Btn
          onClick={() => {
            if (!rating) return toast.error('Please select a rating first')
            reviewMutation.mutate()
          }}
          loading={reviewMutation.isPending}
          disabled={!rating}
        >
          Submit Review
        </Btn>
      </div>
    </div>
  )
}

export default StudentResourceDetail
