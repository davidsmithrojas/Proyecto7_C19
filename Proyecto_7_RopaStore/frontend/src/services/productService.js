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

export const productService = {
  // Get Products
  async getProducts(params = {}) {
    try {
      const response = await api.get('/products', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Product by ID
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Search Products
  async searchProducts(query, params = {}) {
    try {
      const response = await api.get('/products/search', {
        params: { q: query, ...params }
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Products by Category
  async getProductsByCategory(category, params = {}) {
    try {
      const response = await api.get(`/products/category/${category}`, { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Categories
  async getCategories() {
    try {
      const response = await api.get('/products/categories')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Low Stock Products (Admin only)
  async getLowStockProducts(threshold = 10) {
    try {
      const response = await api.get('/products/low-stock', {
        params: { threshold }
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Create Product (Admin only)
  async createProduct(productData) {
    try {
      const config = {
        headers: {
          'Content-Type': productData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
      }
      const response = await api.post('/products', productData, config)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update Product (Admin only)
  async updateProduct(id, productData) {
    try {
      const config = {
        headers: {
          'Content-Type': productData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
      }
      const response = await api.put(`/products/${id}`, productData, config)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete Product (Admin only)
  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get Product Stats (Admin only)
  async getProductStats() {
    try {
      const response = await api.get('/products/stats')
      return response.data
    } catch (error) {
      throw error
    }
  }
}
