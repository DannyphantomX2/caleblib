import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookMarked, Plus, Trash2, Search } from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import Modal from '../../components/common/Modal'
import Field from '../../components/common/Field'
import { SkRow } from '../../components/common/Skeleton'
import toast from 'react-hot-toast'

const AdminCourses = () => {
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [levelFilter, setLevelFilter] = useState('')
  const [form, setForm] = useState({ code: '', title: '', academicLevel: '100', semester: 'first', units: '3' })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const { data, isLoading } = useQuery({
    queryKey: ['admin-courses', levelFilter],
    queryFn: async () => {
      const params = {}
      if (levelFilter) params.level = levelFilter
      const r = await api.get('/admin/courses', { params })
      return r.data
    }
  })

  const addMutation = useMutation({
    mutationFn: async (d) => { const r = await api.post('/admin/courses', d); return r.data },
    onSuccess: () => {
      toast.success('Course added')
      queryClient.invalidateQueries(['admin-courses'])
      setShowAdd(false)
      setForm({ code: '', title: '', academicLevel: '100', semester: 'first', units: '3' })
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => { const r = await api.delete(`/admin/courses/${id}`); return r.data },
    onSuccess: () => { toast.success('Course removed'); queryClient.invalidateQueries(['admin-courses']) },
    onError: e => toast.error(e.response?.data?.error || 'Failed')
  })

  const sel = { padding: '8px 12px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }

  const grouped = {}
  data?.courses?.forEach(c => {
    const key = c.academicLevel
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(c)
  })

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Course Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {data?.courses?.length ? `${data.courses.length} courses` : 'Manage department courses'}
          </p>
        </div>
        <Btn onClick={() => setShowAdd(true)} icon={<Plus size={15} />}>Add Course</Btn>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 20, boxShadow: 'var(--card-shadow)' }}>
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={sel}>
          <option value="">All Levels</option>
          {[100,200,300,400].map(l => <option key={l} value={l}>{l} Level</option>)}
        </select>
      </div>

      {isLoading ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>
          {[1,2,3,4,5].map(i => <SkRow key={i} />)}
        </div>
      ) : data?.courses?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)' }}>
          <BookMarked size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No courses yet</p>
          <Btn onClick={() => setShowAdd(true)} icon={<Plus size={14} />}>Add First Course</Btn>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.keys(grouped).sort().map(level => (
            <div key={level} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ padding: '12px 20px', background: 'var(--page-bg-2)', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{level} Level</span>
                <Badge color="blue">{grouped[level].length} courses</Badge>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    {['Code', 'Title', 'Semester', 'Units', ''].map(h => (
                      <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped[level].map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--page-bg-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{c.code}</td>
                      <td style={{ padding: '10px 16px' }}>{c.title}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <Badge color="gray">{c.semester === 'first' ? '1st' : '2nd'} Sem</Badge>
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{c.units} units</td>
                      <td style={{ padding: '10px 16px' }}>
                        <Btn size="xs" variant="ghost" onClick={() => deleteMutation.mutate(c._id)}
                          loading={deleteMutation.isPending} icon={<Trash2 size={12} />}
                          style={{ color: '#ef4444' }}>Remove</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Course"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn loading={addMutation.isPending} onClick={() => {
              if (!form.code || !form.title) return toast.error('Code and title required')
              addMutation.mutate({ ...form, academicLevel: parseInt(form.academicLevel), units: parseInt(form.units) })
            }}>Add Course</Btn>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Course Code" value={form.code} onChange={set('code')} placeholder="CSC401" required />
            <Field label="Units" type="number" value={form.units} onChange={set('units')} placeholder="3" />
          </div>
          <Field label="Course Title" value={form.title} onChange={set('title')} placeholder="Software Engineering" required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Level</label>
              <select value={form.academicLevel} onChange={set('academicLevel')}
                style={{ padding: '10px 14px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)' }}>
                {[100,200,300,400].map(l => <option key={l} value={l}>{l} Level</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Semester</label>
              <select value={form.semester} onChange={set('semester')}
                style={{ padding: '10px 14px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)' }}>
                <option value="first">First Semester</option>
                <option value="second">Second Semester</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default AdminCourses
