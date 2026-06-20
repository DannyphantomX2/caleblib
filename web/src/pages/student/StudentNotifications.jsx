import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Megaphone, Pin, CheckCheck, Trash2 } from 'lucide-react'
import api from '../../services/api'
import Btn from '../../components/common/Btn'
import Badge from '../../components/common/Badge'
import { SkRow } from '../../components/common/Skeleton'
import { formatRelativeTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const getViewedAnnouncements = () => {
  try { return JSON.parse(localStorage.getItem('viewed_announcements_' + (JSON.parse(localStorage.getItem('caleblib_user') || '{}')._id || 'guest')) || '[]') }
  catch { return [] }
}

const markAnnouncementsViewed = (ids) => {
  try {
    const existing = getViewedAnnouncements()
    const merged = [...new Set([...existing, ...ids])]
    localStorage.setItem('viewed_announcements_' + (JSON.parse(localStorage.getItem('caleblib_user') || '{}')._id || 'guest'), JSON.stringify(merged))
  } catch {}
}

const StudentNotifications = () => {
  const queryClient = useQueryClient()

  const { data: annData, isLoading: loadingAnn } = useQuery({
    queryKey: ['student-announcements'],
    queryFn: async () => { const r = await api.get('/student/announcements'); return r.data }
  })

  const { data: notifData, isLoading: loadingNotif } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => { const r = await api.get('/notifications'); return r.data }
  })

  // Mark all currently loaded announcements as viewed when page opens
  useEffect(() => {
    if (annData?.announcements?.length > 0) {
      const ids = annData.announcements.map(a => a._id)
      markAnnouncementsViewed(ids)
      // Invalidate dashboard so the count updates immediately
      queryClient.invalidateQueries(['student-dashboard'])
    }
  }, [annData])

  const markAllMutation = useMutation({
    mutationFn: async () => { const r = await api.put('/notifications/read-all'); return r.data },
    onSuccess: () => {
      toast.success('All marked as read')
      queryClient.invalidateQueries(['notifications'])
    }
  })

  const deleteNotifMutation = useMutation({
    mutationFn: async (id) => { const r = await api.delete(`/notifications/${id}`); return r.data },
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  })

  const isLoading = loadingAnn || loadingNotif
  const announcements = annData?.announcements || []
  const notifications = notifData?.notifications || []
  const unreadCount = notifData?.unreadCount || 0
  const hasContent = announcements.length > 0 || notifications.length > 0

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {announcements.length > 0
              ? `${announcements.length} announcement${announcements.length !== 1 ? 's' : ''}`
              : 'All caught up'}
            {unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Btn variant="secondary" size="sm" icon={<CheckCheck size={14} />}
            onClick={() => markAllMutation.mutate()} loading={markAllMutation.isPending}>
            Mark all read
          </Btn>
        )}
      </div>

      {isLoading ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>
          {[1,2,3].map(i => <SkRow key={i} />)}
        </div>
      ) : !hasContent ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)', textAlign: 'center', padding: '60px 20px' }}>
          <Bell size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No notifications</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Announcements from your lecturers will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {announcements.length > 0 && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--card-border)', background: 'var(--page-bg-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Megaphone size={15} color="var(--blue-600)" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Announcements</span>
                <Badge color="blue" style={{ marginLeft: 4 }}>{announcements.length}</Badge>
              </div>
              {announcements.map((a, i) => (
                <div key={a._id} style={{
                  padding: '16px 20px',
                  borderBottom: i < announcements.length - 1 ? '1px solid var(--card-border)' : 'none',
                  borderLeft: `3px solid ${a.isPinned ? '#f59e0b' : 'var(--blue-500)'}`,
                  background: a.isPinned ? '#fffbeb' : 'transparent'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      {a.isPinned && <Pin size={13} color="#f59e0b" />}
                      <h3 style={{ fontSize: 14, fontWeight: 700 }}>{a.title}</h3>
                    </div>
                    {a.isPinned && <Badge color="yellow">Pinned</Badge>}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
                    {a.content}
                  </p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Posted by {a.createdBy?.fullName} · {formatRelativeTime(a.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--card-border)', background: 'var(--page-bg-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={15} color="var(--text-muted)" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>System Notifications</span>
              </div>
              {notifications.map((n, i) => (
                <div key={n._id} style={{
                  display: 'flex', gap: 14, padding: '14px 20px',
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--card-border)' : 'none',
                  background: !n.isRead ? 'var(--blue-50)' : 'transparent'
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: !n.isRead ? 'var(--blue-100)' : 'var(--page-bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={15} color={!n.isRead ? 'var(--blue-600)' : 'var(--text-muted)'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: n.isRead ? 500 : 700, marginBottom: 3 }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRelativeTime(n.createdAt)}</div>
                  </div>
                  <button
                    onClick={() => deleteNotifMutation.mutate(n._id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'var(--transition)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'var(--page-bg-2)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default StudentNotifications
