import axios from 'axios'

// Instance axios configurée pour appeler l'API Laravel
// Le proxy Vite redirige /api vers http://localhost:8000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Intercepteur : ajoute automatiquement le token Sanctum si présent dans le localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
