import { useQuery } from '@tanstack/react-query'
import { BookOpen, Download, Bookmark, Bell, Search, ArrowRight, FileText } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import StatCard from '../../components/common/StatCard'
import Badge from '../../components/common/Badge'
import { SkStat, SkRow } from '../../components/common/Skeleton'
import { getFileIcon, getResourceTypeLabel, getResourceTypeColor, formatRelativeTime, truncate } from '../../utils/helpers'

const typeColorMap = {
  lecture_notes:'blue', past_questions:'yellow', project_report:'green',
  code_example:'purple', dataset:'red', tutorial:'teal', technical_doc:'gray', other:'gray'
}

// Get viewed announcement IDs from localStorage
const getViewedAnnouncements = () => {
  try {
    return JSON.parse(localStorage.getItem('viewed_announcements_' + (JSON.parse(localStorage.getItem('caleblib_user') || '{}')._id || 'guest')) || '[]')
  } catch { return [] }
}

const StudentDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => { const r = await api.get('/student/dashboard'); return r.data }
  })

  // Count only announcements the student hasn't viewed yet
  const viewedIds = getViewedAnnouncements()
  const unreadAnnouncements = (data?.announcements || []).filter(
    a => !viewedIds.includes(a._id)
  ).length

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span style={{ color: 'var(--blue-600)' }}>{user?.fullName?.split(' ')[0]}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {user?.academicLevel} Level · Computer Science · {new Date().toLocaleDateString('en-NG', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="stat-grid-3">
        {isLoading ? [1,2,3].map(i => <SkStat key={i} />) : (
          <>
            <StatCard label="Total Resources" value={data?.stats?.totalResources ?? 0}
              icon={BookOpen} color="var(--blue-600)" sub="Available in library" />
            <StatCard label="My Bookmarks" value={data?.stats?.bookmarkCount ?? 0}
              icon={Bookmark} color="#8b5cf6" sub="Saved resources" />
            <StatCard
              label="New Announcements"
              value={unreadAnnouncements}
              icon={Bell}
              color={unreadAnnouncements > 0 ? '#f59e0b' : 'var(--text-muted)'}
              sub={unreadAnnouncements > 0 ? 'Tap to view' : 'All caught up'}
            />
          </>
        )}
      </div>

      <div className="dashboard-main">
        {/* Recent resources */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recently Added</h2>
            <button onClick={() => navigate('/student/library')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--blue-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font)' }}>
              Browse all <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ padding: '8px 8px' }}>
            {isLoading ? [1,2,3,4,5].map(i => <SkRow key={i} />) :
              data?.recentResources?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <BookOpen size={36} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
                  <p>No resources uploaded yet</p>
                </div>
              ) : data?.recentResources?.map(r => (
                <div
                  key={r._id}
                  onClick={() => navigate(`/student/resources/${r._id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: `${getResourceTypeColor(r.resourceType)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {getFileIcon(r.fileFormat)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{truncate(r.title, 45)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.courseCode} · {formatRelativeTime(r.createdAt)}</div>
                  </div>
                  <Badge color={typeColorMap[r.resourceType] || 'gray'}>
                    {getResourceTypeLabel(r.resourceType).split(' ')[0]}
                  </Badge>
                </div>
              ))
            }
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick actions */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)', padding: '18px 20px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Browse Library', sub: 'Search all resources', icon: Search, path: '/student/library', color: 'var(--blue-600)' },
                { label: `${user?.academicLevel}L Resources`, sub: 'Filter by your level', icon: BookOpen, path: `/student/library?level=${user?.academicLevel}`, color: '#8b5cf6' },
                { label: 'Past Questions', sub: 'Exam prep materials', icon: FileText, path: '/student/library?type=past_questions', color: '#f59e0b' },
                { label: 'My Bookmarks', sub: 'Saved resources', icon: Bookmark, path: '/student/bookmarks', color: '#10b981' }
              ].map(({ label, sub, icon: Icon, path, color }) => (
                <div
                  key={label}
                  onClick={() => navigate(path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 9, border: '1.5px solid var(--card-border)', cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = 'var(--page-bg-2)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements preview — show unread ones only */}
          {unreadAnnouncements > 0 && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700 }}>New Announcements</h2>
                <button
                  onClick={() => navigate('/student/notifications')}
                  style={{ fontSize: 12, color: 'var(--blue-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font)' }}>
                  View all
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data?.announcements?.filter(a => !viewedIds.includes(a._id)).map(a => (
                  <div
                    key={a._id}
                    onClick={() => navigate('/student/notifications')}
                    style={{ padding: '10px 12px', background: a.isPinned ? '#fffbeb' : 'var(--page-bg-2)', borderRadius: 8, borderLeft: `3px solid ${a.isPinned ? '#f59e0b' : 'var(--blue-500)'}`, cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{truncate(a.content, 70)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{formatRelativeTime(a.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default StudentDashboard
