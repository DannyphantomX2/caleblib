import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

const PrivacyPolicy = () => (
  <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px', fontFamily: 'var(--font)' }}>
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', marginBottom: 32, textDecoration: 'none' }}>
      <ArrowLeft size={14} /> Back
    </Link>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
      <Shield size={28} color="#3b82f6" />
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>Last updated: January 1, 2026</p>
      </div>
    </div>
    {[
      { title: '1. Data We Collect', body: 'We collect your full name, institutional email address, matric/employee number, academic level, and system usage logs. No payment information is collected.' },
      { title: '2. How We Use Your Data', body: 'Your data is used solely to authenticate your identity, organize resources relevant to your academic level, and maintain system security through audit logging.' },
      { title: '3. Data Storage', body: 'All data is stored securely on MongoDB Atlas cloud servers with TLS encryption in transit. Access is restricted to authorized administrators only.' },
      { title: '4. Data Retention', body: 'Student and staff data is retained for the duration of your enrollment or employment, plus two academic years afterward. Audit logs are retained for 90 days.' },
      { title: '5. Activity Logging', body: 'All login attempts, resource uploads, downloads, and administrative actions are logged for security and audit purposes. Logs include timestamps and IP addresses.' },
      { title: '6. Access Rights', body: 'You may request access to your personal data or request correction of inaccurate information by contacting the system administrator.' },
      { title: '7. No Third-Party Sharing', body: 'Your personal data is never sold, shared, or disclosed to third parties outside Caleb University Computer Science Department.' },
      { title: '8. Security Measures', body: 'Passwords are hashed using bcrypt. JWT tokens expire after 7 days. Accounts are locked after 5 consecutive failed login attempts. All routes enforce role-based access control.' },
      { title: '9. Contact', body: 'For privacy-related inquiries, contact cs.admin@calebuniversity.edu.ng or visit the CS Department office.' }
    ].map(({ title, body }) => (
      <div key={title} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>{body}</p>
      </div>
    ))}
  </div>
)
export default PrivacyPolicy
