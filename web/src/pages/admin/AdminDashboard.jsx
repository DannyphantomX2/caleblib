import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, Download, Clock, Shield, AlertTriangle, CheckCircle, Activity, ArrowRight, UserCheck, FileText } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import StatCard from '../../components/common/StatCard'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import { SkStat, SkRow } from '../../components/common/Skeleton'
import { formatRelativeTime, truncate, getFileIcon } from '../../utils/helpers'

const actionColors = {
  LOGIN: 'green', LOGOUT: 'gray', FAILED_LOGIN: 'red', REGISTER: 'blue',
  UPLOAD_RESOURCE: 'blue', DELETE_RESOURCE: 'red', APPROVE_RESOURCE: 'green',
  REJECT_RESOURCE: 'red', DOWNLOAD_RESOURCE: 'teal', CREATE_USER: 'purple',
  UPDATE_USER: 'yellow', DELETE_USER: 'red', SUSPEND_USER: 'yellow',
  ACCOUNT_LOCKED: 'red', PASSWORD_CHANGED: 'purple', SEED_STUDENT: 'green',
  CREATE_ANNOUNCEMENT: 'blue', DELETE_ANNOUNCEMENT: 'red', VIEW_AUDIT_LOG: 'gray'
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => { const r = await api.get('/admin/dashboard'); return r.data }
  })

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          System overview · Caleb University CS Department · {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {isLoading ? [1,2,3,4,5,6].map(i => <SkStat key={i} />) : (
          <>
            <StatCard label="Total Students" value={data?.stats?.totalStudents ?? 0} icon={Users} color="var(--blue-600)" sub="Active registrations" />
            <StatCard label="Total Staff" value={data?.stats?.totalStaff ?? 0} icon={UserCheck} color="#10b981" sub="Faculty members" />
            <StatCard label="Resources" value={data?.stats?.totalResources ?? 0} icon={BookOpen} color="#8b5cf6" sub="Approved & published" />
            <StatCard label="Pending Approval" value={data?.stats?.pendingResources ?? 0} icon={Clock} color="#f59e0b" sub="Awaiting review" />
            <StatCard label="Total Downloads" value={data?.stats?.totalDownloads ?? 0} icon={Download} color="var(--blue-600)" sub="All time" />
            <StatCard label="Open Requests" value={data?.stats?.pendingRequests ?? 0} icon={AlertTriangle} color="#ef4444" sub="Student requests" />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Pending resources */}
        <div style={{ background: 'var(--card-bg)', border: '1.5px solid #fde68a', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--card-border)', background: '#fffbeb', borderRadius: '12px 12px 0 0' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="#f59e0b" /> Pending Approval
              {data?.stats?.pendingResources > 0 && (
                <span style={{ background: '#f59e0b', color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 800, padding: '1px 7px' }}>{data.stats.pendingResources}</span>
              )}
            </h2>
            <Btn variant="ghost" size="sm" onClick={() => navigate('/admin/resources')}>Review all</Btn>
          </div>
          <div style={{ padding: '8px 8px' }}>
            {isLoading ? [1,2,3].map(i => <SkRow key={i} />) :
              data?.recentUploads?.filter(r => !r.isApproved).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--text-muted)' }}>
                  <CheckCircle size={30} color="#10b981" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ fontSize: 13 }}>All caught up!</p>
                </div>
              ) : data?.recentUploads?.filter(r => !r.isApproved).slice(0, 4).map(r => (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8 }}>
                  <span style={{ fontSize: 20 }}>{getFileIcon(r.fileFormat)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{truncate(r.title, 36)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.contributor?.fullName} · {formatRelativeTime(r.createdAt)}</div>
                  </div>
                  <Btn size="xs" onClick={() => navigate('/admin/resources')}>Review</Btn>
                </div>
              ))
            }
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} color="var(--blue-600)" /> Recent Activity
            </h2>
            <Btn variant="ghost" size="sm" onClick={() => navigate('/admin/audit-logs')}>View logs</Btn>
          </div>
          <div style={{ padding: '8px 8px' }}>
            {isLoading ? [1,2,3,4,5].map(i => <SkRow key={i} />) :
              data?.recentAudit?.map(log => (
                <div key={log._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--page-bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {log.userId?.fullName?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{log.userId?.fullName || log.userEmail || 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{truncate(log.description || log.action, 40)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                    <Badge color={actionColors[log.action] || 'gray'} style={{ fontSize: 9 }}>{log.action.replace(/_/g,' ')}</Badge>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatRelativeTime(log.createdAt)}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '18px 20px', boxShadow: 'var(--card-shadow)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Admin Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Manage Students', icon: Users, path: '/admin/users/students', color: 'var(--blue-600)' },
            { label: 'Manage Staff', icon: UserCheck, path: '/admin/users/staff', color: '#10b981' },
            { label: 'Approve Resources', icon: CheckCircle, path: '/admin/resources', color: '#f59e0b' },
            { label: 'Audit Logs', icon: Shield, path: '/admin/audit-logs', color: '#8b5cf6' },
            { label: 'Analytics', icon: Activity, path: '/admin/analytics', color: 'var(--blue-600)' },
            { label: 'Courses', icon: BookOpen, path: '/admin/courses', color: '#10b981' },
            { label: 'Announcements', icon: FileText, path: '/admin/announcements', color: '#ef4444' },
            { label: 'Student Registry', icon: UserCheck, path: '/admin/registry', color: '#f59e0b' }
          ].map(({ label, icon: Icon, path, color }) => (
            <div
              key={label}
              onClick={() => navigate(path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 12px', borderRadius: 10, border: '1.5px solid var(--card-border)', cursor: 'pointer', transition: 'var(--transition)', textAlign: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = 'var(--page-bg-2)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={19} color={color} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default AdminDashboard
