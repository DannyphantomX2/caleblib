import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, UserX, UserCheck, Trash2, Key, Plus, Upload, X } from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import Modal from '../../components/common/Modal'
import Field from '../../components/common/Field'
import Select from '../../components/common/Select'
import { SkRow } from '../../components/common/Skeleton'
import { formatDate, formatRelativeTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminStudents = () => {
  const queryClient = useQueryClient()
  const fileRef = useRef()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState(null)
  const [reason, setReason] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [bulkPreview, setBulkPreview] = useState([])
  const [bulkFile, setBulkFile] = useState(null)
  const [addForm, setAddForm] = useState({ fullName: '', matricNumber: '', email: '', academicLevel: '400' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', search, page],
    queryFn: async () => {
      const params = { role: 'student', page, limit: 20 }
      if (search) params.search = search
      const r = await api.get('/admin/users', { params })
      return r.data
    }
  })

  const addMutation = useMutation({
    mutationFn: async (d) => { const r = await api.post('/admin/registry', d); return r.data },
    onSuccess: () => {
      toast.success('Student added to registry')
      queryClient.invalidateQueries(['admin-students'])
      setShowAdd(false)
      setAddForm({ fullName: '', matricNumber: '', email: '', academicLevel: '400' })
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const bulkMutation = useMutation({
    mutationFn: async (students) => {
      const r = await api.post('/admin/registry/bulk', { students }, { timeout: 60000 })
      return r.data
    },
    onSuccess: (data) => {
      toast.success(`${data.results?.added || 0} students added, ${data.results?.skipped || 0} already existed`)
      queryClient.invalidateQueries(['admin-students'])
      setShowBulk(false)
      setBulkPreview([])
      setBulkFile(null)
    },
    onError: e => toast.error(e.response?.data?.error || 'Bulk upload failed')
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ id, reason }) => { const r = await api.put(`/admin/users/${id}/suspend`, { reason }); return r.data },
    onSuccess: () => { toast.success('Student suspended'); queryClient.invalidateQueries(['admin-students']); setAction(null); setReason('') },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const unsuspendMutation = useMutation({
    mutationFn: async (id) => { const r = await api.put(`/admin/users/${id}/unsuspend`); return r.data },
    onSuccess: () => { toast.success('Student unsuspended'); queryClient.invalidateQueries(['admin-students']) },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => { const r = await api.delete(`/admin/users/${id}`); return r.data },
    onSuccess: () => { toast.success('Student deleted'); queryClient.invalidateQueries(['admin-students']); setAction(null) },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }) => { const r = await api.put(`/admin/users/${id}/reset-password`, { newPassword }); return r.data },
    onSuccess: () => { toast.success('Password reset'); setAction(null); setNewPassword('') },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const openAction = (student, act) => { setSelected(student); setAction(act) }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setBulkFile(file)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })

        // Try to detect columns
        // Find header row (might not be row 0)
        let headerRowIdx = 0
        let headers = []
        for (let i = 0; i < Math.min(5, rows.length); i++) {
          const row = rows[i]?.map(h => String(h || '').toLowerCase().trim()) || []
          if (row.some(h => h.includes('name') || h.includes('matric'))) {
            headers = row
            headerRowIdx = i
            break
          }
        }

        const nameIdx = headers.findIndex(h => h.includes('name'))
        const matricIdx = headers.findIndex(h => h.includes('matric') || h.includes('reg no') || h.includes('matric no'))
        const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'))
        const levelIdx = headers.findIndex(h => h.includes('level'))

        if (nameIdx === -1 || matricIdx === -1) {
          toast.error('Could not find Name or Matric Number columns in the file')
          return
        }

        const students = rows.slice(headerRowIdx + 1)
          .filter(row => {
            // Skip group label rows and empty rows
            if (!row || row.length === 0) return false
            const nameVal = String(row[nameIdx] || '').trim()
            const matricVal = String(row[matricIdx] || '').trim()
            // Skip rows where matric looks like a group label (no slash or numbers only pattern)
            if (!matricVal || !matricVal.includes('/')) return false
            if (!nameVal || nameVal.toUpperCase().includes('GROUP')) return false
            return true
          })
          .map(row => ({
            fullName: String(row[nameIdx]).trim(),
            matricNumber: String(row[matricIdx]).trim(),
            email: emailIdx >= 0 && row[emailIdx] ? String(row[emailIdx]).trim() : '',
            academicLevel: levelIdx >= 0 && row[levelIdx] ? parseInt(row[levelIdx]) || 400 : 400
          }))
          .filter(s => s.fullName && s.matricNumber)

        setBulkPreview(students)
        toast.success(`Found ${students.length} students in file`)
      } catch (err) {
        toast.error('Could not read file — make sure it is a valid Excel file')
      }
    }
    reader.readAsBinaryString(file)
  }

  const set = k => e => setAddForm(p => ({ ...p, [k]: e.target.value }))

  const card = {
    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
    borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)'
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Manage Students</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {data?.total ? `${data.total} registered students` : 'All registered students'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="secondary" onClick={() => setShowBulk(true)} icon={<Upload size={15} />}>
            Upload Excel
          </Btn>
          <Btn onClick={() => setShowAdd(true)} icon={<Plus size={15} />}>
            Add to Registry
          </Btn>
        </div>
      </div>

      <div style={{ ...card, padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, email or matric number..."
            style={{ width: '100%', padding: '9px 14px 9px 36px', background: 'var(--page-bg-2)', border: '1.5px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font)' }} />
        </div>
      </div>

      <div className="table-scroll" style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--card-border)', background: 'var(--page-bg-2)' }}>
              {['Student', 'Matric No.', 'Level', 'Status', 'Joined', 'Last Login', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ padding: 20 }}>{[1,2,3].map(i => <SkRow key={i} />)}</td></tr>
            ) : data?.users?.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>No students found</td></tr>
            ) : data?.users?.map(u => (
              <tr key={u._id}
                style={{ borderBottom: '1px solid var(--card-border)', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700 }}>{u.fullName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{u.matricNumber}</td>
                <td style={{ padding: '12px 16px' }}>{u.academicLevel}L</td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge color={u.isSuspended ? 'red' : 'green'} dot>{u.isSuspended ? 'Suspended' : 'Active'}</Badge>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(u.createdAt)}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>{u.lastLogin ? formatRelativeTime(u.lastLogin) : 'Never'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {u.isSuspended ? (
                      <Btn size="xs" onClick={() => unsuspendMutation.mutate(u._id)} loading={unsuspendMutation.isPending} icon={<UserCheck size={12} />} style={{ background: '#10b981', color: '#fff' }}>Restore</Btn>
                    ) : (
                      <Btn size="xs" variant="ghost" onClick={() => openAction(u, 'suspend')} icon={<UserX size={12} />} style={{ color: '#f59e0b' }}>Suspend</Btn>
                    )}
                    <Btn size="xs" variant="ghost" onClick={() => openAction(u, 'password')} icon={<Key size={12} />} style={{ color: 'var(--blue-600)' }}>Reset PW</Btn>
                    <Btn size="xs" variant="ghost" onClick={() => openAction(u, 'delete')} icon={<Trash2 size={12} />} style={{ color: '#ef4444' }}>Delete</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {Array.from({ length: data.pages }, (_, i) => (
            <Btn key={i} size="sm" variant={page === i+1 ? 'primary' : 'secondary'} onClick={() => setPage(i+1)}>{i+1}</Btn>
          ))}
        </div>
      )}

      {/* Bulk Upload Modal */}
      <Modal open={showBulk} onClose={() => { setShowBulk(false); setBulkPreview([]); setBulkFile(null) }}
        title="Bulk Upload Students from Excel" size="lg"
        footer={
          <>
            <Btn variant="secondary" onClick={() => { setShowBulk(false); setBulkPreview([]); setBulkFile(null) }}>Cancel</Btn>
            <Btn loading={bulkMutation.isPending} disabled={bulkPreview.length === 0}
              onClick={() => bulkMutation.mutate(bulkPreview)}>
              Add {bulkPreview.length > 0 ? `${bulkPreview.length} Students` : 'Students'} to Registry
            </Btn>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '14px 16px', background: 'var(--blue-50)', border: '1px solid var(--blue-200)', borderRadius: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-600)', marginBottom: 6 }}>How it works</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Upload any Excel file (.xlsx or .xls) with student data. The system will automatically detect columns for <strong>Name</strong>, <strong>Matric Number</strong>, <strong>Email</strong>, and <strong>Level</strong>. You can upload your attendance sheet directly — no reformatting needed.
            </p>
          </div>

          {/* File drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${bulkFile ? 'var(--blue-500)' : 'var(--card-border)'}`,
              borderRadius: 12, padding: '32px 20px', textAlign: 'center',
              cursor: 'pointer', transition: 'var(--transition)',
              background: bulkFile ? 'var(--blue-50)' : 'var(--page-bg-2)'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue-500)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = bulkFile ? 'var(--blue-500)' : 'var(--card-border)'}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
            <Upload size={28} color={bulkFile ? 'var(--blue-500)' : 'var(--text-muted)'} style={{ margin: '0 auto 10px' }} />
            {bulkFile ? (
              <div>
                <p style={{ fontWeight: 700, color: 'var(--blue-600)', marginBottom: 4 }}>{bulkFile.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{bulkPreview.length} students detected — click to change file</p>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Click to upload Excel file</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Supports .xlsx and .xls files</p>
              </div>
            )}
          </div>

          {/* Preview table */}
          {bulkPreview.length > 0 && (
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)' }}>
                Preview — first 5 of {bulkPreview.length} students:
              </p>
              <div className="table-scroll" style={{ border: '1px solid var(--card-border)', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--page-bg-2)', borderBottom: '1px solid var(--card-border)' }}>
                      {['Name', 'Matric No.', 'Email', 'Level'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bulkPreview.slice(0, 5).map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{s.fullName}</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{s.matricNumber}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: 12 }}>{s.email || '—'}</td>
                        <td style={{ padding: '8px 12px' }}>{s.academicLevel}L</td>
                      </tr>
                    ))}
                    {bulkPreview.length > 5 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                          + {bulkPreview.length - 5} more students
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Add single student modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Student to Registry" size="sm"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn loading={addMutation.isPending} onClick={() => {
              if (!addForm.fullName || !addForm.matricNumber) return toast.error('Name and matric number required')
              addMutation.mutate({ ...addForm, academicLevel: parseInt(addForm.academicLevel) })
            }}>Add to Registry</Btn>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full Name" value={addForm.fullName} onChange={set('fullName')} placeholder="e.g. John Doe" required />
          <Field label="Matric Number" value={addForm.matricNumber} onChange={set('matricNumber')} placeholder="e.g. 22/10125" required />
          <Field label="Email (optional)" type="email" value={addForm.email} onChange={set('email')} placeholder="student@calebuniversity.edu.ng" />
          <Select label="Academic Level" value={addForm.academicLevel} onChange={set('academicLevel')} options={[
            { value: '100', label: '100 Level' }, { value: '200', label: '200 Level' },
            { value: '300', label: '300 Level' }, { value: '400', label: '400 Level' }
          ]} />
        </div>
      </Modal>

      {/* Action modals */}
      <Modal open={action === 'suspend'} onClose={() => { setAction(null); setReason('') }} title="Suspend Student" size="sm"
        footer={<><Btn variant="secondary" onClick={() => { setAction(null); setReason('') }}>Cancel</Btn><Btn variant="danger" loading={suspendMutation.isPending} onClick={() => suspendMutation.mutate({ id: selected._id, reason })}>Suspend</Btn></>}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Suspending <strong>{selected?.fullName}</strong></p>
        <Field label="Reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for suspension" />
      </Modal>

      <Modal open={action === 'password'} onClose={() => { setAction(null); setNewPassword('') }} title="Reset Password" size="sm"
        footer={<><Btn variant="secondary" onClick={() => { setAction(null); setNewPassword('') }}>Cancel</Btn><Btn loading={resetPasswordMutation.isPending} onClick={() => { if (!newPassword || newPassword.length < 6) return toast.error('Min 6 characters'); resetPasswordMutation.mutate({ id: selected._id, newPassword }) }}>Reset</Btn></>}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Reset password for <strong>{selected?.fullName}</strong></p>
        <Field label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" required />
      </Modal>

      <Modal open={action === 'delete'} onClose={() => setAction(null)} title="Delete Student" size="sm"
        footer={<><Btn variant="secondary" onClick={() => setAction(null)}>Cancel</Btn><Btn variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(selected._id)}>Delete Permanently</Btn></>}>
        <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>⚠️ This cannot be undone.</p>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Delete <strong>{selected?.fullName}</strong> permanently?</p>
      </Modal>
    </div>
  )
}

export default AdminStudents
