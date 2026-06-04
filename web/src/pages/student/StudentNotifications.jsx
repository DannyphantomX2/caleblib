import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import api from '../../services/api'
import Btn from '../../components/common/Btn'
import { SkRow } from '../../components/common/Skeleton'
import { formatRelativeTime, truncate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const StudentNotifications = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => { const r = await api.get('/notifications'); return r.data }
  })

  const markAllMutation = useMutation({
    mutationFn: async () => { const r = await api.put('/notifications/read-all'); return r.data },
    onSuccess: () => { toast.success('All marked as read'); queryClient.invalidateQueries(['notifications']) }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => { const r = await api.delete(`/notifications/${id}`); return r.data },
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  })

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {data?.unreadCount > 0 ? `${data.unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {data?.unreadCount > 0 && (
          <Btn variant="secondary" size="sm" icon={<CheckCheck size={14} />}
            onClick={() => markAllMutation.mutate()} loading={markAllMutation.isPending}>
            Mark all read
          </Btn>
        )}
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
        {isLoading ? (
          <div style={{ padding: '8px 12px' }}>{[1,2,3].map(i => <SkRow key={i} />)}</div>
        ) : data?.notifications?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Bell size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No notifications</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>You'll be notified about new resources and announcements</p>
          </div>
        ) : (
          data?.notifications?.map((n, i) => (
            <div key={n._id} style={{
              display: 'flex', gap: 14, padding: '14px 20px',
              borderBottom: i < data.notifications.length - 1 ? '1px solid var(--card-border)' : 'none',
              background: !n.isRead ? 'var(--blue-50)' : 'transparent',
              transition: 'var(--transition)'
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: !n.isRead ? 'var(--blue-100)' : 'var(--page-bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bell size={15} color={!n.isRead ? 'var(--blue-600)' : 'var(--text-muted)'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: n.isRead ? 500 : 700, marginBottom: 3 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.5 }}>{truncate(n.message, 100)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRelativeTime(n.createdAt)}</div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(n._id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'var(--page-bg-2)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
export default StudentNotifications
