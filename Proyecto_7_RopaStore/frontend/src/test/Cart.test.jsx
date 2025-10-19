import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { ProductProvider } from '../context/ProductContext'
import Cart from '../pages/Cart'

// Mock de fetch
global.fetch = vi.fn()

const MockedCart = () => (
  <BrowserRouter>
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <Cart />
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  </BrowserRouter>
)

describe('🛒 Pruebas de Carrito de Compras', () => {
  beforeEach(() => {
    fetch.mockClear()
    localStorage.clear()
  })

  it('✅ Debería mostrar carrito vacío cuando no hay productos', () => {
    render(<MockedCart />)
    
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(screen.getByText('Continúa comprando')).toBeInTheDocument()
  })

  it('✅ Debería mostrar productos en el carrito', () => {
    const mockCartItems = [
      {
        id: '1',
        product: {
          id: '1',
          name: 'Camisa Test',
          price: 29.99,
          image: '/images/camisa.jpg'
        },
        quantity: 2,
        price: 29.99
      }
    ]

    // Mock localStorage con items del carrito
    localStorage.setItem('cart', JSON.stringify(mockCartItems))

    render(<MockedCart />)
    
    expect(screen.getByText('Camisa Test')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })

  it('✅ Debería actualizar cantidad de producto', async () => {
    const mockCartItems = [
      {
        id: '1',
        product: {
          id: '1',
          name: 'Camisa Test',
          price: 29.99,
          image: '/images/camisa.jpg'
        },
        quantity: 2,
        price: 29.99
      }
    ]

    localStorage.setItem('cart', JSON.stringify(mockCartItems))

    render(<MockedCart />)
    
    const quantityInput = screen.getByDisplayValue('2')
    fireEvent.change(quantityInput, { target: { value: '3' } })
    
    await waitFor(() => {
      expect(quantityInput.value).toBe('3')
    })
  })

  it('✅ Debería eliminar producto del carrito', async () => {
    const mockCartItems = [
      {
        id: '1',
        product: {
          id: '1',
          name: 'Camisa Test',
          price: 29.99,
          image: '/images/camisa.jpg'
        },
        quantity: 2,
        price: 29.99
      }
    ]

    localStorage.setItem('cart', JSON.stringify(mockCartItems))

    render(<MockedCart />)
    
    const removeButton = screen.getByRole('button', { name: 'Eliminar' })
    fireEvent.click(removeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    })
  })

  it('✅ Debería calcular total correctamente', () => {
    const mockCartItems = [
      {
        id: '1',
        product: {
          id: '1',
          name: 'Camisa Test',
          price: 29.99,
          image: '/images/camisa.jpg'
        },
        quantity: 2,
        price: 29.99
      },
      {
        id: '2',
        product: {
          id: '2',
          name: 'Pantalón Test',
          price: 49.99,
          image: '/images/pantalon.jpg'
        },
        quantity: 1,
        price: 49.99
      }
    ]

    localStorage.setItem('cart', JSON.stringify(mockCartItems))

    render(<MockedCart />)
    
    // Total esperado: (29.99 * 2) + (49.99 * 1) = 109.97
    expect(screen.getByText('$109.97')).toBeInTheDocument()
  })

  it('✅ Debería proceder al checkout', () => {
    const mockCartItems = [
      {
        id: '1',
        product: {
          id: '1',
          name: 'Camisa Test',
          price: 29.99,
          image: '/images/camisa.jpg'
        },
        quantity: 1,
        price: 29.99
      }
    ]

    localStorage.setItem('cart', JSON.stringify(mockCartItems))

    render(<MockedCart />)
    
    const checkoutButton = screen.getByRole('button', { name: 'Proceder al Pago' })
    expect(checkoutButton).toBeInTheDocument()
    
    fireEvent.click(checkoutButton)
    
    // Verificar que se navega al checkout
    expect(window.location.pathname).toBe('/checkout')
  })

  it('✅ Debería vaciar carrito completamente', async () => {
    const mockCartItems = [
      {
        id: '1',
        product: {
          id: '1',
          name: 'Camisa Test',
          price: 29.99,
          image: '/images/camisa.jpg'
        },
        quantity: 2,
        price: 29.99
      }
    ]

    localStorage.setItem('cart', JSON.stringify(mockCartItems))

    render(<MockedCart />)
    
    const clearButton = screen.getByRole('button', { name: 'Vaciar Carrito' })
    fireEvent.click(clearButton)
    
    await waitFor(() => {
      expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    })
  })
})
