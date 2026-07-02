import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Spinner from './components/common/Spinner'
import PageShell from './components/common/PageShell'

import LandingPage from './pages/landing/LandingPage'
import StudentLogin from './pages/landing/StudentLogin'
import StaffLogin from './pages/landing/StaffLogin'
import AdminLogin from './pages/landing/AdminLogin'
import PrivacyPolicy from './pages/landing/PrivacyPolicy'

import StudentDashboard from './pages/student/StudentDashboard'
import StudentLibrary from './pages/student/StudentLibrary'
import StudentProfile from './pages/student/StudentProfile'
import StudentBookmarks from './pages/student/StudentBookmarks'
import StudentRequests from './pages/student/StudentRequests'
import StudentNotifications from './pages/student/StudentNotifications'
import StudentDownloads from './pages/student/StudentDownloads'
import StudentSettings from './pages/student/StudentSettings'
import StudentResourceDetail from './pages/student/StudentResourceDetail'

import StaffDashboard from './pages/staff/StaffDashboard'
import StaffUpload from './pages/staff/StaffUpload'
import StaffMyUploads from './pages/staff/StaffMyUploads'
import StaffAnalytics from './pages/staff/StaffAnalytics'
import StaffRequests from './pages/staff/StaffRequests'
import StaffAnnouncements from './pages/staff/StaffAnnouncements'
import StaffProfile from './pages/staff/StaffProfile'
import StaffSettings from './pages/staff/StaffSettings'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStudents from './pages/admin/AdminStudents'
import AdminStaff from './pages/admin/AdminStaff'
import AdminRegistry from './pages/admin/AdminRegistry'
import AdminResources from './pages/admin/AdminResources'
import AdminCourses from './pages/admin/AdminCourses'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'
import AdminMLAnalytics from './pages/admin/AdminMLAnalytics'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminRequests from './pages/admin/AdminRequests'
import AdminProfile from './pages/admin/AdminProfile'
import AdminSettings from './pages/admin/AdminSettings'

import {
  LayoutDashboard, BookOpen, Bookmark, Download,
  MessageSquare, Bell, User, Settings,
  Upload, FileText, BarChart2, Megaphone,
  Users, Brain, Shield, CheckCircle, BookMarked,
  UserCheck, ClipboardList
} from 'lucide-react'

const studentNav = [
  { label: 'Main', items: [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/library', icon: BookOpen, label: 'Resource Library' },
    { to: '/student/bookmarks', icon: Bookmark, label: 'My Bookmarks' },
    { to: '/student/downloads', icon: Download, label: 'Download History' },
  ]},
  { label: 'Support', items: [
    { to: '/student/requests', icon: MessageSquare, label: 'My Requests' },
    { to: '/student/notifications', icon: Bell, label: 'Notifications' },
  ]},
  { label: 'Account', items: [
    { to: '/student/profile', icon: User, label: 'Profile' },
    { to: '/student/settings', icon: Settings, label: 'Settings' },
  ]}
]

const staffNav = [
  { label: 'Main', items: [
    { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/staff/upload', icon: Upload, label: 'Upload Resource' },
    { to: '/staff/uploads', icon: FileText, label: 'My Uploads' },
  ]},
  { label: 'Manage', items: [
    { to: '/staff/requests', icon: MessageSquare, label: 'Student Requests' },
    { to: '/staff/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/staff/announcements', icon: Megaphone, label: 'Announcements' },
  ]},
  { label: 'Account', items: [
    { to: '/staff/profile', icon: User, label: 'Profile' },
    { to: '/staff/settings', icon: Settings, label: 'Settings' },
  ]}
]

const adminNav = [
  { label: 'Overview', items: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/admin/audit-logs', icon: Shield, label: 'Audit Logs' },
      { to: '/admin/ml-analytics', icon: Brain, label: 'ML Analytics' },
  ]},
  { label: 'Users', items: [
    { to: '/admin/users/students', icon: Users, label: 'Students' },
    { to: '/admin/users/staff', icon: UserCheck, label: 'Staff' },
    { to: '/admin/registry', icon: ClipboardList, label: 'Student Registry' },
  ]},
  { label: 'Content', items: [
    { to: '/admin/resources', icon: CheckCircle, label: 'Approve Resources' },
    { to: '/admin/courses', icon: BookMarked, label: 'Courses' },
    { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/admin/requests', icon: MessageSquare, label: 'Requests' },
  ]},
  { label: 'Account', items: [
    { to: '/admin/profile', icon: User, label: 'Profile' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ]}
]

const Loading = () => (
  <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:'100vh' }}>
    <Spinner size={32} />
  </div>
)

const ComingSoon = ({ title }) => (
  <div style={{ textAlign:'center', padding: 60 }}>
    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
    <p style={{ color:'var(--text-muted)', fontSize: 14 }}>This page is coming soon.</p>
  </div>
)

const StudentRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login/student" replace />
  if (user.role !== 'student') return <Navigate to="/" replace />
  return children
}

const StaffRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login/staff" replace />
  if (user.role !== 'faculty') return <Navigate to="/" replace />
  return children
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login/admin" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

const AutoRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <LandingPage />
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />
  if (user.role === 'faculty') return <Navigate to="/staff/dashboard" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <LandingPage />
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<AutoRedirect />} />
    <Route path="/login/student" element={<StudentLogin />} />
    <Route path="/login/staff" element={<StaffLogin />} />
    <Route path="/login/admin" element={<AdminLogin />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />

    <Route path="/student/*" element={
      <StudentRoute>
        <PageShell nav={studentNav} role="student">
          <Routes>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="bookmarks" element={<StudentBookmarks />} />
            <Route path="downloads" element={<StudentDownloads />} />
            <Route path="requests" element={<StudentRequests />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="settings" element={<StudentSettings />} />
            <Route path="resources/:id" element={<StudentResourceDetail />} />
            <Route index element={<Navigate to="dashboard" />} />
          </Routes>
        </PageShell>
      </StudentRoute>
    } />

    <Route path="/staff/*" element={
      <StaffRoute>
        <PageShell nav={staffNav} role="staff">
          <Routes>
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="upload" element={<StaffUpload />} />
            <Route path="uploads" element={<StaffMyUploads />} />
            <Route path="requests" element={<StaffRequests />} />
            <Route path="analytics" element={<StaffAnalytics />} />
            <Route path="announcements" element={<StaffAnnouncements />} />
            <Route path="profile" element={<StaffProfile />} />
            <Route path="settings" element={<StaffSettings />} />
            <Route index element={<Navigate to="dashboard" />} />
          </Routes>
        </PageShell>
      </StaffRoute>
    } />

    <Route path="/admin/*" element={
      <AdminRoute>
        <PageShell nav={adminNav} role="admin">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users/students" element={<AdminStudents />} />
            <Route path="users/staff" element={<AdminStaff />} />
            <Route path="registry" element={<AdminRegistry />} />
            <Route path="resources" element={<AdminResources />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="ml-analytics" element={<AdminMLAnalytics />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route index element={<Navigate to="dashboard" />} />
          </Routes>
        </PageShell>
      </AdminRoute>
    } />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
)

export default App
