import { useQuery } from '@tanstack/react-query'
import { BarChart2, Download, BookOpen, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import api from '../../services/api'
import { SkStat } from '../../components/common/Skeleton'
import { getResourceTypeLabel, truncate } from '../../utils/helpers'

const AdminAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => { const r = await api.get('/admin/analytics'); return r.data }
  })

  const { data: overview } = useQuery({
    queryKey: ['overview'],
    queryFn: async () => { const r = await api.get('/admin/dashboard'); return r.data }
  })

  const card = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--card-shadow)' }

  const maxByLevel = data?.byLevel?.reduce((max, b) => b.count > max ? b.count : max, 0) || 1
  const maxByType = data?.byType?.reduce((max, b) => b.count > max ? b.count : max, 0) || 1

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>System-wide usage statistics</p>
      </div>

      {/* Overview stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {isLoading ? [1,2,3,4].map(i => <SkStat key={i} />) : (
          <>
            {[
              { label: 'Total Resources', value: overview?.stats?.totalResources ?? 0, icon: BookOpen, color: 'var(--blue-600)' },
              { label: 'Total Downloads', value: overview?.stats?.totalDownloads ?? 0, icon: Download, color: '#10b981' },
              { label: 'Total Users', value: overview?.stats?.totalUsers ?? 0, icon: Users, color: '#8b5cf6' },
              { label: 'Pending Approval', value: overview?.stats?.pendingResources ?? 0, icon: AlertTriangle, color: '#f59e0b' }
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={17} color={color} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>{value}</div>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* By level */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Resources by Level</h3>
          {data?.byLevel?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>
          ) : data?.byLevel?.map(({ _id, count }) => (
            <div key={_id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, width: 70, color: 'var(--text-secondary)' }}>{_id}L</span>
              <div style={{ flex: 1, height: 10, background: 'var(--page-bg-2)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 20, background: 'var(--blue-600)', width: `${(count / maxByLevel) * 100}%`, transition: 'width 0.5s ease' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, width: 28, textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>

        {/* By type */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Resources by Type</h3>
          {data?.byType?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</p>
          ) : data?.byType?.map(({ _id, count }) => (
            <div key={_id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 12, width: 110, color: 'var(--text-secondary)', flexShrink: 0 }}>{getResourceTypeLabel(_id)}</span>
              <div style={{ flex: 1, height: 10, background: 'var(--page-bg-2)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 20, background: '#10b981', width: `${(count / maxByType) * 100}%`, transition: 'width 0.5s ease' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, width: 28, textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Most downloaded */}
      {data?.mostDownloaded?.length > 0 && (
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Most Downloaded Resources</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--card-border)' }}>
                {['#', 'Resource', 'Course', 'Downloads'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.mostDownloaded.map((r, i) => (
                <tr key={r._id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--text-muted)', width: 30 }}>{i+1}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{truncate(r.title, 50)}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{r.courseCode}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--blue-600)' }}>{r.downloadCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
export default AdminAnalytics
