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

export const dashboardService = {
  // Get Dashboard Stats
  async getStats() {
    try {
      const response = await api.get('/dashboard/stats')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Recent Orders
  async getRecentOrders(limit = 5) {
    try {
      const response = await api.get('/orders/recent', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Top Products
  async getTopProducts(limit = 5) {
    try {
      const response = await api.get('/products/top-selling', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Sales Chart Data
  async getSalesChartData(period = '30d') {
    try {
      const response = await api.get('/dashboard/sales-chart', {
        params: { period }
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get User Growth Data
  async getUserGrowthData(period = '30d') {
    try {
      const response = await api.get('/dashboard/user-growth', {
        params: { period }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}
