import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'

const UserContext = createContext()

const initialState = {
  users: [],
  filters: {
    search: '',
    role: '',
    isActive: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null
}

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload.users,
        pagination: action.payload.pagination,
        loading: false,
        error: null
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
          search: '',
          role: '',
          isActive: ''
        },
        pagination: {
          ...state.pagination,
          page: 1
        }
      }
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user._id === action.payload._id ? action.payload : user
        )
      }
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user._id !== action.payload)
      }
    default:
      return state
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState)

  // Cargar usuarios al inicializar
  useEffect(() => {
    loadUsers()
  }, [state.filters, state.pagination.page])

  const loadUsers = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const params = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        ...state.filters
      }

      const response = await userService.getUsers(params)
      if (response.success) {
        dispatch({
          type: 'SET_USERS',
          payload: {
            users: response.data.users,
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
      const message = error.response?.data?.message || 'Error al cargar usuarios'
      dispatch({
        type: 'SET_ERROR',
        payload: message
      })
      toast.error(message)
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

  const createUser = async (userData) => {
    try {
      const response = await userService.createUser(userData)
      if (response.success) {
        toast.success('Usuario creado exitosamente')
        loadUsers() // Recargar la lista
        return response.data.user
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear usuario'
      toast.error(message)
      return null
    }
  }

  const updateUser = async (id, userData) => {
    try {
      const response = await userService.updateUser(id, userData)
      if (response.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user
        })
        toast.success('Usuario actualizado exitosamente')
        return response.data.user
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar usuario'
      toast.error(message)
      return null
    }
  }

  const deleteUser = async (id) => {
    try {
      const response = await userService.deleteUser(id)
      if (response.success) {
        dispatch({
          type: 'DELETE_USER',
          payload: id
        })
        toast.success('Usuario eliminado exitosamente')
        return true
      } else {
        toast.error(response.message)
        return false
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar usuario'
      toast.error(message)
      return false
    }
  }

  const toggleUserStatus = async (id) => {
    try {
      const response = await userService.toggleUserStatus(id)
      if (response.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user
        })
        toast.success('Estado del usuario actualizado')
        return response.data.user
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cambiar estado del usuario'
      toast.error(message)
      return null
    }
  }

  const getUserById = async (id) => {
    try {
      const response = await userService.getUserById(id)
      if (response.success) {
        return response.data.user
      } else {
        toast.error(response.message)
        return null
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cargar el usuario'
      toast.error(message)
      return null
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    loadUsers,
    setFilters,
    setPage,
    clearFilters,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserById,
    clearError
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export const useUsers = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUsers debe ser usado dentro de UserProvider')
  }
  return context
}
