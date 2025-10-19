import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { productService } from '../services/productService'
import toast from 'react-hot-toast'

const ProductContext = createContext()

const initialState = {
  products: [],
  categories: [],
  filters: {
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null
}

const productReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload.products,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      }
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload
      }
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        },
        pagination: {
          ...state.pagination,
          page: 1 // Reset to first page when filters change
        }
      }
    case 'SET_PAGE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          page: action.payload
        }
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          category: '',
          minPrice: '',
          maxPrice: '',
          search: '',
          sortBy: 'name',
          sortOrder: 'asc'
        },
        pagination: {
          ...state.pagination,
          page: 1
        }
      }
    default:
      return state
  }
}

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState)

  // Cargar productos al inicializar
  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [state.filters, state.pagination.page])

  const loadProducts = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const params = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        ...state.filters
      }

      const response = await productService.getProducts(params)
      if (response.success) {
        dispatch({
          type: 'SET_PRODUCTS',
          payload: {
            products: response.data.products,
            pagination: {
              page: response.data.pagination.page,
              limit: response.data.pagination.limit,
              total: response.data.pagination.total,
              totalPages: response.data.pagination.pages
            }
          }
        })
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response.message
        })
        toast.error(response.message)
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cargar productos'
      dispatch({
        type: 'SET_ERROR',
        payload: message
      })
      toast.error(message)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories()
      if (response.success) {
        dispatch({
          type: 'SET_CATEGORIES',
          payload: response.data.categories
        })
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  const setFilters = (filters) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: filters
    })
  }

  const setPage = (page) => {
    dispatch({
      type: 'SET_PAGE',
      payload: page
    })
  }

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' })
  }

  const searchProducts = async (query) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await productService.searchProducts(query)
      if (response.success) {
        dispatch({
          type: 'SET_PRODUCTS',
          payload: {
            products: response.data.products,
            pagination: {
              page: 1,
              limit: state.pagination.limit,
              total: response.data.products.length,
              totalPages: 1
            }
          }
        })
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response.message
        })
        toast.error(response.message)
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al buscar productos'
      dispatch({
        type: 'SET_ERROR',
        payload: message
      })
      toast.error(message)
    }
  }

  const getProductById = async (id) => {
    try {
      const response = await productService.getProductById(id)
      if (response.success) {
        return response.data.product
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cargar el producto'
      toast.error(message)
      return null
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    loadProducts,
    loadCategories,
    setFilters,
    setPage,
    clearFilters,
    searchProducts,
    getProductById,
    clearError
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProducts debe ser usado dentro de ProductProvider')
  }
  return context
}
