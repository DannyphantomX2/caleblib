import api from './api'

export const downloadResource = async (id) => {
  try {
    const res = await api.get(`/student/resources/${id}/download`, {
      responseType: 'blob'
    })

    // Get filename from Content-Disposition header
    const disposition = res.headers['content-disposition']
    let filename = 'download'

    if (disposition) {
      const match = disposition.match(/filename="(.+)"/)
      if (match) filename = match[1]
    }

    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)

    return filename
  } catch (error) {
    throw error
  }
}
