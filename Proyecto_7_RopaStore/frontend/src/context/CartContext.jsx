import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

const initialState = {
  items: [],
  total: 0,
  totalItems: 0,
  loading: false,
  error: null
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
        total: calculateTotal(action.payload),
        totalItems: calculateTotalItems(action.payload),
        loading: false
      }
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.product._id === action.payload.product._id)
      let newItems
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product._id === action.payload.product._id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
      } else {
        newItems = [...state.items, action.payload]
      }
      
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        totalItems: calculateTotalItems(newItems)
      }
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.product._id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0)
      
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        totalItems: calculateTotalItems(updatedItems)
      }
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.product._id !== action.payload)
      return {
        ...state,
        items: filteredItems,
        total: calculateTotal(filteredItems),
        totalItems: calculateTotalItems(filteredItems)
      }
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        totalItems: 0
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
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

const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
}

const calculateTotalItems = (items) => {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        dispatch({
          type: 'LOAD_CART',
          payload: cartData
        })
      } catch (error) {
        console.error('Error al cargar el carrito:', error)
        localStorage.removeItem('cart')
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(state.items))
    } else {
      localStorage.removeItem('cart')
    }
  }, [state.items])

  const addToCart = (product, quantity = 1) => {
    // Verificar stock disponible
    if (product.stock < quantity) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`)
      return
    }

    // Verificar si ya existe en el carrito
    const existingItem = state.items.find(item => item.product._id === product._id)
    if (existingItem && (existingItem.quantity + quantity) > product.stock) {
      toast.error(`No puedes agregar más de ${product.stock} unidades`)
      return
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product,
        quantity,
        price: product.price
      }
    })
    
    toast.success(`${product.name} agregado al carrito`)
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    // Verificar stock
    const item = state.items.find(item => item.product._id === productId)
    if (item && quantity > item.product.stock) {
      toast.error(`Solo hay ${item.product.stock} unidades disponibles`)
      return
    }

    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { productId, quantity }
    })
  }

  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: productId
    })
    toast.success('Producto removido del carrito')
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Carrito vaciado')
  }

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product._id === productId)
    return item ? item.quantity : 0
  }

  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId)
  }

  const value = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    isInCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider')
  }
  return context
}
