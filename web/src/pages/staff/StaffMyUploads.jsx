import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2, Edit2, Eye, Download } from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import Modal from '../../components/common/Modal'
import Field from '../../components/common/Field'
import { SkRow } from '../../components/common/Skeleton'
import { formatDate, formatFileSize, getFileIcon, getResourceTypeLabel } from '../../utils/helpers'
import toast from 'react-hot-toast'

const typeColorMap = {
  lecture_notes: 'blue', past_questions: 'yellow', project_report: 'green',
  code_example: 'purple', dataset: 'red', tutorial: 'teal',
  technical_doc: 'gray', other: 'gray'
}

const resourceTypes = [
  { value: 'lecture_notes', label: 'Lecture Notes' },
  { value: 'past_questions', label: 'Past Questions' },
  { value: 'project_report', label: 'Project Report' },
  { value: 'code_example', label: 'Code Example' },
  { value: 'dataset', label: 'Dataset' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'technical_doc', label: 'Technical Document' },
  { value: 'other', label: 'Other' }
]

const StaffMyUploads = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '', description: '', courseCode: '',
    courseTitle: '', tags: '', academicYear: '', resourceType: ''
  })

  const { data, isLoading } = useQuery({
    queryKey: ['staff-uploads', search, page],
    queryFn: async () => {
      const params = { page, limit: 15 }
      if (search) params.search = search
      const r = await api.get('/staff/uploads', { params })
      return r.data
    }
  })

  useEffect(() => {
    if (editing) {
      setEditForm({
        title: editing.title || '',
        description: editing.description || '',
        courseCode: editing.courseCode || '',
        courseTitle: editing.courseTitle || '',
        tags: editing.tags?.join(', ') || '',
        academicYear: editing.academicYear || '',
        resourceType: editing.resourceType || ''
      })
    }
  }, [editing])

  const editMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const r = await api.put('/staff/uploads/' + id, data)
      return r.data
    },
    onSuccess: () => {
      toast.success('Resource updated')
      queryClient.invalidateQueries(['staff-uploads'])
      setEditing(null)
    },
    onError: e => toast.error(e.response?.data?.error || 'Update failed')
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const r = await api.delete('/staff/uploads/' + id)
      return r.data
    },
    onSuccess: () => {
      toast.success('Resource deleted')
      queryClient.invalidateQueries(['staff-uploads'])
      setDeleting(null)
    },
    onError: e => toast.error(e.response?.data?.error || 'Delete failed')
  })

  const set = k => e => setEditForm(p => ({ ...p, [k]: e.target.value }))

  const statusBadge = (resource) => {
    if (resource.isApproved) return <Badge color="green" dot>Approved</Badge>
    if (resource.isApproved === false && resource.rejectionReason) return <Badge color="red" dot>Rejected</Badge>
    return <Badge color="yellow" dot>Pending</Badge>
  }

  const card = {
    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
    borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow)'
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>My Uploads</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {data?.total ? data.total + ' resource' + (data.total !== 1 ? 's' : '') + ' uploaded' : 'Your uploaded resources'}
        </p>
      </div>

      <div style={{ ...card, padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search your uploads..."
            style={{ width: '100%', padding: '9px 14px 9px 36px', background: 'var(--page-bg-2)', border: '1.5px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font)' }}
          />
        </div>
      </div>

      <div className="table-scroll" style={{ ...card }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--card-border)', background: 'var(--page-bg-2)' }}>
              {['Resource', 'Course', 'Type', 'Size', 'Views/DLs', 'Status', 'Uploaded', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{ padding: 20 }}>{[1,2,3,4,5].map(i => <SkRow key={i} />)}</td></tr>
            ) : data?.resources?.length === 0 ? (
              <tr><td colSpan={8}>
                <div style={{ textAlign: 'center', padding: '52px 20px' }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>📂</div>
                  <p style={{ fontWeight: 700, marginBottom: 6 }}>No uploads yet</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Go to Upload Resource to add your first material.</p>
                </div>
              </td></tr>
            ) : data?.resources?.map(res => (
              <tr key={res._id}
                style={{ borderBottom: '1px solid var(--card-border)', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 14px', maxWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{getFileIcon(res.fileFormat)}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{res.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 1 }}>{res.fileFormat}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{res.courseCode}</div>
                  {res.courseTitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.courseTitle}</div>}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <Badge color={typeColorMap[res.resourceType] || 'gray'} size="sm">{getResourceTypeLabel(res.resourceType)}</Badge>
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: 12, whiteSpace: 'nowrap' }}>{formatFileSize(res.fileSize)}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}><Eye size={12} /> {res.viewCount || 0}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}><Download size={12} /> {res.downloadCount || 0}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {statusBadge(res)}
                  {res.rejectionReason && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 3, maxWidth: 120 }}>{res.rejectionReason}</div>}
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(res.createdAt)}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn size="xs" variant="ghost" onClick={() => setEditing(res)} icon={<Edit2 size={12} />} style={{ color: 'var(--staff-color)' }}>Edit</Btn>
                    <Btn size="xs" variant="ghost" onClick={() => setDeleting(res)} icon={<Trash2 size={12} />} style={{ color: '#ef4444' }}>Delete</Btn>
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

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Resource" size="md"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
            <Btn loading={editMutation.isPending} onClick={() => {
              if (!editForm.title.trim()) return toast.error('Title is required')
              if (!editForm.courseCode.trim()) return toast.error('Course code is required')
              editMutation.mutate({ id: editing._id, data: editForm })
            }}>Save Changes</Btn>
          </>
        }>
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--page-bg-2)', border: '1px solid var(--card-border)', borderRadius: 10 }}>
              <span style={{ fontSize: 26 }}>{getFileIcon(editing.fileFormat)}</span>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attached file (cannot be changed)</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{editing.title} · {formatFileSize(editing.fileSize)}</div>
              </div>
            </div>
            <Field label="Title" value={editForm.title} onChange={set('title')} placeholder="Resource title" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Course Code" value={editForm.courseCode} onChange={set('courseCode')} placeholder="e.g. CSC 401" required />
              <Field label="Course Title" value={editForm.courseTitle} onChange={set('courseTitle')} placeholder="e.g. Operating Systems" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Resource Type</label>
              <select value={editForm.resourceType} onChange={set('resourceType')}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--page-bg-2)', border: '1.5px solid var(--card-border)', borderRadius: 9, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)', cursor: 'pointer' }}>
                {resourceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <Field label="Description" value={editForm.description} onChange={set('description')} placeholder="Brief description" multiline rows={3} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Tags" value={editForm.tags} onChange={set('tags')} placeholder="e.g. exam, 2023" hint="Comma-separated" />
              <Field label="Academic Year" value={editForm.academicYear} onChange={set('academicYear')} placeholder="e.g. 2024/2025" />
            </div>
            {editing.isApproved === false && editing.rejectionReason && (
              <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: '#991b1b', fontWeight: 700, marginBottom: 3 }}>Previously rejected — reason:</p>
                <p style={{ fontSize: 13, color: '#b91c1c' }}>{editing.rejectionReason}</p>
                <p style={{ fontSize: 11, color: '#dc2626', marginTop: 6 }}>Saving changes will resubmit this resource for admin approval.</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Resource" size="sm"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setDeleting(null)}>Cancel</Btn>
            <Btn variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleting._id)}>Delete Permanently</Btn>
          </>
        }>
        <div style={{ padding: '12px 14px', marginBottom: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>This cannot be undone.</p>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Delete <strong style={{ color: 'var(--text-primary)' }}>{deleting?.title}</strong>? The file will be permanently removed from the server.
        </p>
      </Modal>
    </div>
  )
}

export default StaffMyUploads
