import { useQuery } from '@tanstack/react-query'
import { Upload, Download, Eye, Clock, CheckCircle, FileText, TrendingUp, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import StatCard from '../../components/common/StatCard'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import { SkStat, SkRow } from '../../components/common/Skeleton'
import { getFileIcon, getResourceTypeLabel, getResourceTypeColor, formatRelativeTime, truncate } from '../../utils/helpers'

const StaffDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['staff-dashboard'],
    queryFn: async () => { const r = await api.get('/staff/dashboard'); return r.data }
  })

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
          Welcome back, <span style={{ color: '#10b981' }}>{user?.fullName?.split(' ')[0]}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Staff Portal · Computer Science Department · ID: {user?.employeeId}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {isLoading ? [1,2,3].map(i => <SkStat key={i} />) : (
          <>
            <StatCard label="Total Uploads" value={data?.stats?.totalUploads ?? 0} icon={Upload} color="#10b981" sub={`${data?.stats?.approved ?? 0} approved`} />
            <StatCard label="Total Downloads" value={data?.stats?.totalDownloads ?? 0} icon={Download} color="var(--blue-600)" sub="Across all resources" />
            <StatCard label="Pending Review" value={data?.stats?.pendingApproval ?? 0} icon={Clock} color="#f59e0b" sub="Awaiting admin approval" />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Recent uploads */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>My Recent Uploads</h2>
            <Btn variant="ghost" size="sm" onClick={() => navigate('/staff/uploads')} icon={<ArrowRight size={14} />}>View all</Btn>
          </div>
          <div style={{ padding: '8px 8px' }}>
            {isLoading ? [1,2,3,4].map(i => <SkRow key={i} />) : data?.recentUploads?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                <Upload size={36} style={{ margin: '0 auto 12px', opacity: 0.25, display: 'block' }} />
                <p>No uploads yet. Start sharing resources!</p>
              </div>
            ) : data?.recentUploads?.map(r => (
              <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8 }}>
                <div style={{ fontSize: 22, width: 38, height: 38, borderRadius: 9, background: `${getResourceTypeColor(r.resourceType)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getFileIcon(r.fileFormat)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{truncate(r.title, 42)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.courseCode} · {formatRelativeTime(r.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <Badge color={r.isApproved ? 'green' : 'yellow'} dot>{r.isApproved ? 'Live' : 'Pending'}</Badge>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.downloadCount} downloads</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)', padding: '18px 20px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Upload Resource', sub: 'Share a new material', icon: Upload, path: '/staff/upload', color: '#10b981' },
                { label: 'My Uploads', sub: 'Manage resources', icon: FileText, path: '/staff/uploads', color: 'var(--blue-600)' },
                { label: 'View Analytics', sub: 'Download stats', icon: TrendingUp, path: '/staff/analytics', color: '#8b5cf6' },
                { label: 'Student Requests', sub: `${data?.stats?.openRequests ?? 0} open`, icon: CheckCircle, path: '/staff/requests', color: '#f59e0b' }
              ].map(({ label, sub, icon: Icon, path, color }) => (
                <div
                  key={label}
                  onClick={() => navigate(path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 9, border: '1.5px solid var(--card-border)', cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = 'var(--page-bg-2)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ width: 33, height: 33, borderRadius: 8, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default StaffDashboard
