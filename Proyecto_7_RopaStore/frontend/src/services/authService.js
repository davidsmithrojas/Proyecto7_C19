import axios from 'axios'

const API_URL = '/api/v1'

// Configurar axios con token por defecto
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token a las peticiones
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

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await api.post('/users/login', { email, password })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Register
  async register(userData) {
    try {
      const response = await api.post('/users/register', userData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Verify Token
  async verifyToken() {
    try {
      const response = await api.get('/users/verify-user')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update Profile
  async updateProfile(userData) {
    try {
      const response = await api.put('/users/update', userData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get User Profile
  async getProfile() {
    try {
      const response = await api.get('/users/verify-user')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Change Password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/users/change-password', {
        currentPassword,
        newPassword
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Request Role Change
  async requestRoleChange(motivation) {
    try {
      const response = await api.post('/users/request-role', { motivation })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Role Requests (Admin only)
  async getRoleRequests() {
    try {
      const response = await api.get('/users/role-requests')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Handle Role Request (Admin only)
  async handleRoleRequest(requestId, decision, reviewNotes = '') {
    try {
      const response = await api.put(`/users/role-requests/${requestId}`, {
        decision,
        reviewNotes
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}
