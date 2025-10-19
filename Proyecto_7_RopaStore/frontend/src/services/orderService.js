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

export const orderService = {
  // Create Order
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get User Orders
  async getUserOrders(params = {}) {
    try {
      const response = await api.get('/orders', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Order by ID
  async getOrderById(id) {
    try {
      const response = await api.get(`/orders/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update Order Status (Admin only)
  async updateOrderStatus(id, status, notes = '') {
    try {
      const response = await api.put(`/orders/${id}/status`, {
        status,
        notes
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get All Orders (Admin only)
  async getAllOrders(params = {}) {
    try {
      const response = await api.get('/admin/orders', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Order Stats (Admin only)
  async getOrderStats() {
    try {
      const response = await api.get('/admin/orders/stats')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Cancel Order
  async cancelOrder(id, reason = '') {
    try {
      const response = await api.put(`/orders/${id}/cancel`, { reason })
      return response.data
    } catch (error) {
      throw error
    }
  }
}
