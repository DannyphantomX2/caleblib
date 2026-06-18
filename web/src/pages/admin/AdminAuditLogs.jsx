import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Shield, Search } from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import { SkRow } from '../../components/common/Skeleton'
import { formatDate, formatRelativeTime } from '../../utils/helpers'

const actionColors = {
  LOGIN: 'green', LOGOUT: 'gray', FAILED_LOGIN: 'red', REGISTER: 'blue',
  UPLOAD_RESOURCE: 'blue', DELETE_RESOURCE: 'red', APPROVE_RESOURCE: 'green',
  REJECT_RESOURCE: 'red', DOWNLOAD_RESOURCE: 'teal', CREATE_USER: 'purple',
  UPDATE_USER: 'yellow', DELETE_USER: 'red', SUSPEND_USER: 'yellow',
  ACCOUNT_LOCKED: 'red', PASSWORD_CHANGED: 'purple', SEED_STUDENT: 'green',
  CREATE_ANNOUNCEMENT: 'blue', DELETE_ANNOUNCEMENT: 'red',
  VIEW_AUDIT_LOG: 'gray'
}

const AdminAuditLogs = () => {
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, actionFilter],
    queryFn: async () => {
      const params = { page, limit: 50 }
      if (actionFilter) params.action = actionFilter
      const r = await api.get('/admin/audit-logs', { params })
      return r.data
    }
  })

  const actions = [
    'LOGIN','LOGOUT','FAILED_LOGIN','REGISTER',
    'UPLOAD_RESOURCE','DELETE_RESOURCE','APPROVE_RESOURCE','REJECT_RESOURCE',
    'DOWNLOAD_RESOURCE','CREATE_USER','UPDATE_USER','DELETE_USER','SUSPEND_USER',
    'ACCOUNT_LOCKED','PASSWORD_CHANGED','SEED_STUDENT','CREATE_ANNOUNCEMENT','DELETE_ANNOUNCEMENT'
  ]

  const sel = { padding: '8px 12px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Audit Logs</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Complete record of all system activity · {data?.total ? `${data.total} entries` : ''}
        </p>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 20, boxShadow: 'var(--card-shadow)', display: 'flex', gap: 10 }}>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1) }} style={sel}>
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="table-scroll" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--card-border)', background: 'var(--page-bg-2)' }}>
              {['Time', 'User', 'Role', 'Action', 'Description', 'Status', 'IP'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ padding: 20 }}>{[1,2,3,4,5].map(i => <SkRow key={i} />)}</td></tr>
            ) : data?.logs?.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No logs found</td></tr>
            ) : data?.logs?.map((log, i) => (
              <tr key={log._id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '9px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  <div>{formatRelativeTime(log.createdAt)}</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{formatDate(log.createdAt)}</div>
                </td>
                <td style={{ padding: '9px 14px' }}>
                  <div style={{ fontWeight: 600 }}>{log.userId?.fullName || '—'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{log.userEmail}</div>
                </td>
                <td style={{ padding: '9px 14px' }}>
                  {log.userRole && <Badge color={log.userRole === 'admin' ? 'yellow' : log.userRole === 'faculty' ? 'green' : 'blue'}>{log.userRole}</Badge>}
                </td>
                <td style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}>
                  <Badge color={actionColors[log.action] || 'gray'} style={{ fontSize: 9 }}>
                    {log.action.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td style={{ padding: '9px 14px', color: 'var(--text-secondary)', maxWidth: 280 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.description || '—'}
                  </div>
                </td>
                <td style={{ padding: '9px 14px' }}>
                  <Badge color={log.status === 'SUCCESS' ? 'green' : 'red'} dot>{log.status}</Badge>
                </td>
                <td style={{ padding: '9px 14px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  {log.ipAddress || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {Array.from({ length: Math.min(data.pages, 10) }, (_, i) => (
            <Btn key={i} size="sm" variant={page === i+1 ? 'primary' : 'secondary'} onClick={() => setPage(i+1)}>{i+1}</Btn>
          ))}
        </div>
      )}
    </div>
  )
}
export default AdminAuditLogs
