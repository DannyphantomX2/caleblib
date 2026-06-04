import { createContext, useState, useEffect, useCallback, useContext } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('caleblib_theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('caleblib_theme', theme)
  }, [theme])

  useEffect(() => {
    const token = localStorage.getItem('caleblib_token')
    const saved = localStorage.getItem('caleblib_user')
    if (token && saved) {
      setUser(JSON.parse(saved))
      authService.getMe()
        .then(d => { setUser(d.user); localStorage.setItem('caleblib_user', JSON.stringify(d.user)) })
        .catch(() => { localStorage.removeItem('caleblib_token'); localStorage.removeItem('caleblib_user'); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password, role) => {
    const data = await authService.login(email, password, role)
    localStorage.setItem('caleblib_token', data.token)
    localStorage.setItem('caleblib_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const registerStudent = useCallback(async (formData) => {
    const data = await authService.registerStudent(formData)
    localStorage.setItem('caleblib_token', data.token)
    localStorage.setItem('caleblib_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, registerStudent, logout, setUser, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
