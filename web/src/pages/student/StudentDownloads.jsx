import { BookOpen, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Btn from '../../components/common/Btn'

// Downloads are tracked server-side via audit logs
// This page will show the student's download history once we wire the audit endpoint
const StudentDownloads = () => {
  const navigate = useNavigate()
  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Download History</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Resources you have downloaded</p>
      </div>
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)', textAlign: 'center', padding: '60px 20px' }}>
        <BookOpen size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No downloads yet</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Resources you download will be tracked here
        </p>
        <Btn onClick={() => navigate('/student/library')} icon={<ArrowRight size={14} />}>Browse Library</Btn>
      </div>
    </div>
  )
}
export default StudentDownloads
