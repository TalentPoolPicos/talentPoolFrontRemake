import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    if (config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

export default api

export const setAuthorizationHeader = (token: string) => {
  localStorage.setItem('access_token', token)
}
