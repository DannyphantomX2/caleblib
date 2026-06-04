import api from './api'

export const authService = {
  login: async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role })
    return res.data
  },
  registerStudent: async (data) => {
    const res = await api.post('/auth/register/student', data)
    return res.data
  },
  getMe: async () => {
    const res = await api.get('/auth/me')
    return res.data
  },
  logout: async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('caleblib_token')
    localStorage.removeItem('caleblib_user')
  }
}
