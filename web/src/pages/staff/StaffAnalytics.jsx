import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Download, Eye, FileText, Star } from 'lucide-react'
import api from '../../services/api'
import { SkStat } from '../../components/common/Skeleton'
import { getResourceTypeLabel, truncate } from '../../utils/helpers'

const StaffAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['staff-analytics'],
    queryFn: async () => { const r = await api.get('/staff/analytics'); return r.data }
  })

  const card = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--card-shadow)' }

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Performance metrics for your uploaded resources</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {isLoading ? [1,2,3].map(i => <SkStat key={i} />) : (
          <>
            {[
              { label: 'Total Resources', value: data?.stats?.totalResources ?? 0, icon: FileText, color: 'var(--blue-600)' },
              { label: 'Total Downloads', value: data?.stats?.totalDownloads ?? 0, icon: Download, color: '#10b981' },
              { label: 'Total Views', value: data?.stats?.totalViews ?? 0, icon: Eye, color: '#8b5cf6' }
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={color} />
                  </div>
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{value}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Resource performance table */}
      <div style={card}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Resource Performance</h2>
        {isLoading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
        ) : data?.resources?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <TrendingUp size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p>No data yet. Upload resources to see analytics.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--card-border)' }}>
                  {['Resource', 'Type', 'Level', 'Downloads', 'Views', 'Rating'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.resources.map((r, i) => (
                  <tr key={r._id} style={{ borderBottom: i < data.resources.length - 1 ? '1px solid var(--card-border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{truncate(r.title, 40)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.courseCode}</div>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text-secondary)' }}>{getResourceTypeLabel(r.resourceType)}</td>
                    <td style={{ padding: '12px 12px', color: 'var(--text-secondary)' }}>{r.academicLevel}L</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--blue-600)' }}>{r.downloadCount}</span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{r.viewCount || 0}</span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      {r.averageRating > 0 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                          <Star size={13} fill="#f59e0b" color="#f59e0b" />
                          {r.averageRating}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No ratings</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
export default StaffAnalytics
