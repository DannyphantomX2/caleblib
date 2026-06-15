import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Search, Trash2 } from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Btn from '../../components/common/Btn'
import Modal from '../../components/common/Modal'
import Field from '../../components/common/Field'
import { SkRow } from '../../components/common/Skeleton'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminRegistry = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
const [form, setForm] = useState({ fullName: '', email: '', matricNumber: '', academicLevel: '400' })

  const { data, isLoading } = useQuery({
    queryKey: ['registry', search, page, filter],
    queryFn: async () => {
      const params = { page, limit: 25 }
      if (search) params.search = search
      if (filter !== '') params.registered = filter
      const r = await api.get('/admin/registry', { params })
      return r.data
    }
  })
} placeholder="Full name as on admission letter" required />
          <Field label="Matric Number" value={form.matricNumber} onChange={e => setForm(p => ({ ...p, matricNumber: e.target.value }))} placeholder="22/10125" required />
          <Field label="Email (optional)" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="student@calebuniversity.edu.ng" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Academic Level</label>
            <select value={form.academicLevel} onChange={e => setForm(p => ({ ...p, academicLevel: e.target.value }))}
              style={{ padding: '10px 14px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font)' }}>
              {[100,200,300,400].map(l => <option key={l} value={l}>{l} Level</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default AdminRegistry
