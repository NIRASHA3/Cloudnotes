import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Auth API calls
export const register = (userData) => {
  return api.post('/auth/register', userData)
}

export const login = (credentials) => {
  return api.post('/auth/login', credentials)
}

// Notes API calls
export const getNotes = (category = null) => {
  const params = category ? { category } : {}
  return api.get('/notes', { params })
}
export const createNote = (noteData) => api.post('/notes', noteData)
export const updateNote = (id, noteData) => api.put(`/notes/${id}`, noteData)
export const deleteNote = (id) => api.delete(`/notes/${id}`)

// User profile
export const getUserProfile = () => api.get('/auth/me')

export default api