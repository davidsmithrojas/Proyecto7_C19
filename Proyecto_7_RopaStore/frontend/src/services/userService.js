import axios from 'axios'

const API_URL = '/api/v1'

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

export const userService = {
  // Get Users (Admin only)
  async getUsers(params = {}) {
    try {
      const response = await api.get('/users', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get User by ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Create User (Admin only)
  async createUser(userData) {
    try {
      const response = await api.post('/users', userData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update User (Admin only)
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete User (Admin only)
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Toggle User Status (Admin only)
  async toggleUserStatus(id) {
    try {
      const response = await api.patch(`/users/${id}/toggle-status`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get User Stats (Admin only)
  async getUserStats() {
    try {
      const response = await api.get('/users/stats')
      return response.data
    } catch (error) {
      throw error
    }
  }
}
