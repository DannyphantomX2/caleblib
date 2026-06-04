import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('caleblib_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('caleblib_token')
      localStorage.removeItem('caleblib_user')
      const path = window.location.pathname
      if (path.startsWith('/student')) window.location.href = '/login/student'
      else if (path.startsWith('/staff')) window.location.href = '/login/staff'
      else if (path.startsWith('/admin')) window.location.href = '/login/admin'
      else window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api
