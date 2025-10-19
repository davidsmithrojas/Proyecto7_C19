import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { dashboardService } from '../services/dashboardService'
import toast from 'react-hot-toast'

const DashboardContext = createContext()

const initialState = {
  stats: {
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalOrders: 0,
    ordersThisMonth: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    totalProducts: 0,
    lowStockProducts: 0
  },
  recentOrders: [],
  topProducts: [],
  salesChartData: [],
  userGrowthData: [],
  loading: false,
  error: null
}

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
        loading: false,
        error: null
      }
    case 'SET_RECENT_ORDERS':
      return {
        ...state,
        recentOrders: action.payload,
        loading: false,
        error: null
      }
    case 'SET_TOP_PRODUCTS':
      return {
        ...state,
        topProducts: action.payload,
        loading: false,
        error: null
      }
    case 'SET_SALES_CHART_DATA':
      return {
        ...state,
        salesChartData: action.payload,
        loading: false,
        error: null
      }
    case 'SET_USER_GROWTH_DATA':
      return {
        ...state,
        userGrowthData: action.payload,
        loading: false,
        error: null
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
    default:
      return state
  }
}

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)

  // Cargar datos del dashboard al inicializar
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Cargar estadísticas principales
      const statsResponse = await dashboardService.getStats()
      if (statsResponse.success) {
        dispatch({
          type: 'SET_STATS',
          payload: statsResponse.data
        })
      }

      // Cargar pedidos recientes
      const ordersResponse = await dashboardService.getRecentOrders()
      if (ordersResponse.success) {
        dispatch({
          type: 'SET_RECENT_ORDERS',
          payload: ordersResponse.data.orders
        })
      }

      // Cargar productos más vendidos
      const productsResponse = await dashboardService.getTopProducts()
      if (productsResponse.success) {
        dispatch({
          type: 'SET_TOP_PRODUCTS',
          payload: productsResponse.data.products
        })
      }

      // Cargar datos del gráfico de ventas
      const salesResponse = await dashboardService.getSalesChartData()
      if (salesResponse.success) {
        dispatch({
          type: 'SET_SALES_CHART_DATA',
          payload: salesResponse.data
        })
      }

      // Cargar datos de crecimiento de usuarios
      const userGrowthResponse = await dashboardService.getUserGrowthData()
      if (userGrowthResponse.success) {
        dispatch({
          type: 'SET_USER_GROWTH_DATA',
          payload: userGrowthResponse.data
        })
      }

    } catch (error) {
      const message = error.response?.data?.message || 'Error al cargar datos del dashboard'
      dispatch({
        type: 'SET_ERROR',
        payload: message
      })
      toast.error(message)
    }
  }

  const refreshData = () => {
    loadDashboardData()
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    loadDashboardData,
    refreshData,
    clearError
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard debe ser usado dentro de DashboardProvider')
  }
  return context
}
