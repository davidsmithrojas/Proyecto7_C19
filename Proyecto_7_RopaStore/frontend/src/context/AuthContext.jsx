import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        error: null
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
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

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      if (state.token) {
        try {
          const response = await authService.verifyToken()
          if (response.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: response.data.user,
                token: state.token
              }
            })
          } else {
            localStorage.removeItem('token')
            dispatch({ type: 'LOGOUT' })
          }
        } catch (error) {
          localStorage.removeItem('token')
          dispatch({ type: 'LOGOUT' })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    verifyToken()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await authService.login(email, password)
      if (response.success) {
        localStorage.setItem('token', response.data.token)
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data
        })
        toast.success('¡Bienvenido!')
        return { success: true }
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.message
        })
        toast.error(response.message)
        return { success: false, message: response.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      })
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await authService.register(userData)
      if (response.success) {
        localStorage.setItem('token', response.data.token)
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data
        })
        toast.success('¡Cuenta creada exitosamente!')
        return { success: true }
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.message
        })
        toast.error(response.message)
        return { success: false, message: response.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear la cuenta'
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message
      })
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
    toast.success('Sesión cerrada')
  }

  const updateUser = async (userData) => {
    try {
      const response = await authService.updateProfile(userData)
      if (response.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user
        })
        toast.success('Perfil actualizado')
        return { success: true }
      } else {
        toast.error(response.message)
        return { success: false, message: response.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar el perfil'
      toast.error(message)
      return { success: false, message }
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}
