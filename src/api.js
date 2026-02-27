import axios from 'axios'

// Create axios instance pointing to our fitness tracker backend
const api = axios.create({
    baseURL: 'https://fitness-tracker-api-l50w.onrender.com'
});


// Attach the JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
