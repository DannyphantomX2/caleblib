import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Search, Download, Bookmark, Filter, X, BookOpen } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import { SkCard } from '../../components/common/Skeleton'
import { getFileIcon, getResourceTypeLabel, getResourceTypeColor, formatFileSize, formatRelativeTime, truncate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const typeColorMap = { lecture_notes: 'blue', past_questions: 'yellow', project_report: 'green', code_example: 'purple', dataset: 'red', tutorial: 'teal', technical_doc: 'gray', other: 'gray' }

const StudentLibrary = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    academicLevel: searchParams.get('level') || '',
    semester: '',
    resourceType: searchParams.get('type') || '',
    courseCode: ''
  })
  const [page, setPage] = useState(1)

  const params = { page, limit: 12, ...filters }
  if (search) params.search = search

  const { data, isLoading } = useQuery({
    queryKey: ['student-resources', params],
    queryFn: async () => { const r = await api.get('/student/resources', { params }); return r.data }
  })

  const downloadMutation = useMutation({
    mutationFn: async ({ id, fileName }) => {
      const res = await api.get(`/student/resources/${id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    },
    onSuccess: () => toast.success('Download started'),
    onError: () => toast.error('Download failed')
  })

  const hasFilters = Object.values(filters).some(Boolean) || search
  const sel = { padding: '8px 12px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Resource Library</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {data?.total ? `${data.total.toLocaleString()} resources available` : 'Browse academic materials'}
        </p>
      </div>

      {/* Search & filters */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 24, boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by title, course, topic..."
              style={{ width: '100%', padding: '9px 14px 9px 36px', background: 'var(--page-bg-2)', border: '1.5px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font)' }}
            />
          </div>
          <select value={filters.academicLevel} onChange={e => { setFilters(p => ({ ...p, academicLevel: e.target.value })); setPage(1) }} style={sel}>
            <option value="">All Levels</option>
            {[100,200,300,400].map(l => <option key={l} value={l}>{l}L</option>)}
          </select>
          <select value={filters.semester} onChange={e => { setFilters(p => ({ ...p, semester: e.target.value })); setPage(1) }} style={sel}>
            <option value="">All Semesters</option>
            <option value="first">1st Semester</option>
            <option value="second">2nd Semester</option>
          </select>
          <select value={filters.resourceType} onChange={e => { setFilters(p => ({ ...p, resourceType: e.target.value })); setPage(1) }} style={sel}>
            <option value="">All Types</option>
            {['lecture_notes','past_questions','project_report','code_example','dataset','tutorial','technical_doc','other'].map(t => (
              <option key={t} value={t}>{getResourceTypeLabel(t)}</option>
            ))}
          </select>
          {hasFilters && (
            <Btn variant="ghost" size="sm" onClick={() => { setFilters({ academicLevel:'',semester:'',resourceType:'',courseCode:'' }); setSearch(''); setPage(1) }} icon={<X size={13} />}>
              Clear
            </Btn>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <SkCard key={i} />)}
        </div>
      ) : data?.resources?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}>
          <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.25, display: 'block' }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>No resources found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16, marginBottom: 24 }}>
            {data.resources.map(r => (
              <div
                key={r._id}
                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 18, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: 'var(--card-shadow)', transition: 'all 0.15s ease', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--card-shadow-md)'; e.currentTarget.style.borderColor = 'var(--blue-200)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--card-shadow)'; e.currentTarget.style.borderColor = 'var(--card-border)' }}
                onClick={() => navigate(`/student/resources/${r._id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${getResourceTypeColor(r.resourceType)}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {getFileIcon(r.fileFormat)}
                  </div>
                  <Badge color={typeColorMap[r.resourceType] || 'gray'}>{getResourceTypeLabel(r.resourceType).split(' ')[0]}</Badge>
                </div>

                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.35 }}>{truncate(r.title, 52)}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.courseCode}{r.courseTitle ? ` · ${truncate(r.courseTitle, 22)}` : ''}</p>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Badge color="blue">{r.academicLevel}L</Badge>
                  <Badge color="gray">{r.semester === 'first' ? '1st' : '2nd'} Sem</Badge>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{formatFileSize(r.fileSize)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Download size={12} /> {r.downloadCount}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatRelativeTime(r.createdAt)}</span>
                  </div>
                  <Btn
                    size="xs"
                    variant="outline"
                    icon={<Download size={12} />}
                    onClick={e => { e.stopPropagation(); downloadMutation.mutate({ id: r._id, fileName: r.fileName }) }}
                    loading={downloadMutation.isPending}
                  >
                    Download
                  </Btn>
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
export default StudentLibrary
