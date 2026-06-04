export const formatDate = (d) => new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })

export const formatRelativeTime = (d) => {
  const diff = Date.now() - new Date(d)
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(d)
}

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const s = ['B','KB','MB','GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${s[i]}`
}

export const getResourceTypeLabel = (t) => ({
  lecture_notes: 'Lecture Notes',
  past_questions: 'Past Questions',
  project_report: 'Project Report',
  code_example: 'Code Example',
  dataset: 'Dataset',
  tutorial: 'Tutorial',
  technical_doc: 'Technical Doc',
  other: 'Other'
}[t] || t)

export const getResourceTypeColor = (t) => ({
  lecture_notes: '#3b82f6',
  past_questions: '#f59e0b',
  project_report: '#10b981',
  code_example: '#8b5cf6',
  dataset: '#ef4444',
  tutorial: '#06b6d4',
  technical_doc: '#64748b',
  other: '#94a3b8'
}[t] || '#94a3b8')

export const getFileIcon = (fmt) => ({
  pdf: '📄', doc: '📝', docx: '📝',
  ppt: '📊', pptx: '📊', xls: '📈', xlsx: '📈',
  zip: '🗜️', txt: '📃', jpg: '🖼️', jpeg: '🖼️',
  png: '🖼️', mp4: '🎥', py: '🐍', js: '📜'
}[fmt?.toLowerCase()] || '📁')

export const truncate = (s, n = 60) => s?.length > n ? s.slice(0, n) + '...' : s
