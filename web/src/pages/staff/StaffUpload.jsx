import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import Field from '../../components/common/Field'
import Select from '../../components/common/Select'
import Btn from '../../components/common/Btn'
import { formatFileSize, getResourceTypeLabel } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ALLOWED = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt,.jpg,.jpeg,.png,.mp4'

const StaffUpload = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', academicLevel: '',
    semester: 'first', courseCode: '', courseTitle: '',
    resourceType: 'lecture_notes', tags: '', academicYear: '2025/2026'
  })

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      fd.append('file', file)
      const r = await api.post('/staff/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return r.data
    },
    onSuccess: () => {
      toast.success('Resource uploaded successfully')
      queryClient.invalidateQueries(['staff-dashboard'])
      queryClient.invalidateQueries(['staff-uploads'])
      navigate('/staff/uploads')
    },
    onError: e => toast.error(e.response?.data?.error || 'Upload failed')
  })

  const handleSubmit = e => {
    e.preventDefault()
    if (!file) return toast.error('Please select a file')
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.academicLevel) return toast.error('Academic level is required')
    if (!form.courseCode.trim()) return toast.error('Course code is required')
    uploadMutation.mutate()
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  const card = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--card-shadow)', marginBottom: 20 }

  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Upload Resource</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Share academic materials with students. All uploads are immediately published.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* File drop zone */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Select File</h3>
          {!file ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--blue-500)' : 'var(--card-border)'}`,
                borderRadius: 12, padding: '40px 20px',
                textAlign: 'center', cursor: 'pointer',
                background: dragOver ? 'var(--blue-50)' : 'var(--page-bg-2)',
                transition: 'var(--transition)'
              }}
            >
              <Upload size={32} color={dragOver ? 'var(--blue-500)' : 'var(--text-muted)'} style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Drop file here or click to browse
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                PDF, Word, PowerPoint, Excel, ZIP, Images — max 50MB
              </p>
              <input id="file-input" type="file" accept={ALLOWED} style={{ display: 'none' }}
                onChange={e => setFile(e.target.files[0])} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--blue-50)', borderRadius: 10, border: '1.5px solid var(--blue-200)' }}>
              <FileText size={28} color="var(--blue-600)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatFileSize(file.size)}</div>
              </div>
              <button type="button" onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 6 }}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Resource details */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Resource Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Title" value={form.title} onChange={set('title')}
              placeholder="e.g. Introduction to Data Structures — Week 1" required />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Description</label>
              <textarea value={form.description} onChange={set('description')}
                placeholder="What does this resource cover? Any important notes for students..."
                rows={3} style={{ padding: '10px 14px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', fontFamily: 'var(--font)', transition: 'var(--transition)' }}
                onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
                onBlur={e => e.target.style.borderColor = 'var(--card-border)'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Select label="Academic Level" value={form.academicLevel} onChange={set('academicLevel')} required
                options={[
                  { value: '', label: 'Select level' },
                  { value: '100', label: '100 Level' },
                  { value: '200', label: '200 Level' },
                  { value: '300', label: '300 Level' },
                  { value: '400', label: '400 Level' }
                ]} />
              <Select label="Semester" value={form.semester} onChange={set('semester')}
                options={[
                  { value: 'first', label: 'First Semester' },
                  { value: 'second', label: 'Second Semester' }
                ]} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Course Code" value={form.courseCode} onChange={set('courseCode')}
                placeholder="CSC401" required />
              <Field label="Course Title" value={form.courseTitle} onChange={set('courseTitle')}
                placeholder="Software Engineering" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Select label="Resource Type" value={form.resourceType} onChange={set('resourceType')}
                options={[
                  { value: 'lecture_notes', label: 'Lecture Notes' },
                  { value: 'past_questions', label: 'Past Questions' },
                  { value: 'project_report', label: 'Project Report' },
                  { value: 'code_example', label: 'Code Example' },
                  { value: 'dataset', label: 'Dataset' },
                  { value: 'tutorial', label: 'Tutorial' },
                  { value: 'technical_doc', label: 'Technical Document' },
                  { value: 'other', label: 'Other' }
                ]} />
              <Field label="Academic Year" value={form.academicYear} onChange={set('academicYear')}
                placeholder="2025/2026" />
            </div>

            <Field label="Tags (comma separated)" value={form.tags} onChange={set('tags')}
              placeholder="algorithms, sorting, data structures"
              hint="Helps students find this resource through search" />
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Btn variant="secondary" type="button" onClick={() => navigate('/staff/uploads')}>Cancel</Btn>
          <Btn type="submit" loading={uploadMutation.isPending} icon={<Upload size={15} />} size="lg">
            Upload Resource
          </Btn>
        </div>
      </form>
    </div>
  )
}
export default StaffUpload
