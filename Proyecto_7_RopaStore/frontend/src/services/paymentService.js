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

export const paymentService = {
  // Create Payment Intent
  async createPaymentIntent(orderData) {
    try {
      const response = await api.post('/payments/create-intent', orderData)
      return response.data
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  },

  // Confirm Payment
  async confirmPayment(paymentIntentId, paymentMethodId) {
    try {
      const response = await api.post('/payments/confirm', {
        paymentIntentId,
        paymentMethodId
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Payment Methods
  async getPaymentMethods() {
    try {
      const response = await api.get('/payments/methods')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Create Payment Method
  async createPaymentMethod(paymentMethodData) {
    try {
      const response = await api.post('/payments/methods', paymentMethodData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete Payment Method
  async deletePaymentMethod(paymentMethodId) {
    try {
      const response = await api.delete(`/payments/methods/${paymentMethodId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Payment History
  async getPaymentHistory(params = {}) {
    try {
      const response = await api.get('/payments/history', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Refund Payment (Admin only)
  async refundPayment(paymentId, amount = null) {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, {
        amount
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}
