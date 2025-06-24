import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v2',
  timeout: 10_000,
})

http.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('normal_user_access_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})
