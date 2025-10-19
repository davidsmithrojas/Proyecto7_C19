import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { ProductProvider } from '../context/ProductContext'
import Products from '../pages/Products'

// Mock de fetch
global.fetch = vi.fn()

const MockedProducts = () => (
  <BrowserRouter>
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <Products />
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  </BrowserRouter>
)

describe('🛍️ Pruebas de Productos', () => {
  beforeEach(() => {
    fetch.mockClear()
    localStorage.clear()
  })

  it('✅ Debería renderizar la página de productos', () => {
    render(<MockedProducts />)
    
    expect(screen.getByText('Catálogo de Productos')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar productos...')).toBeInTheDocument()
  })

  it('✅ Debería mostrar productos cuando se cargan', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Camisa Test',
        price: 29.99,
        category: 'Camisas',
        image: '/images/camisa.jpg',
        stock: 10
      },
      {
        id: '2',
        name: 'Pantalón Test',
        price: 49.99,
        category: 'Pantalones',
        image: '/images/pantalon.jpg',
        stock: 5
      }
    ]

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { products: mockProducts }
      }),
    })

    render(<MockedProducts />)
    
    await waitFor(() => {
      expect(screen.getByText('Camisa Test')).toBeInTheDocument()
      expect(screen.getByText('Pantalón Test')).toBeInTheDocument()
    })
  })

  it('✅ Debería filtrar productos por categoría', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Camisa Test',
        price: 29.99,
        category: 'Camisas',
        image: '/images/camisa.jpg',
        stock: 10
      },
      {
        id: '2',
        name: 'Pantalón Test',
        price: 49.99,
        category: 'Pantalones',
        image: '/images/pantalon.jpg',
        stock: 5
      }
    ]

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { products: mockProducts }
      }),
    })

    render(<MockedProducts />)
    
    await waitFor(() => {
      expect(screen.getByText('Camisa Test')).toBeInTheDocument()
    })

    const categoryFilter = screen.getByLabelText('Categoría')
    fireEvent.change(categoryFilter, { target: { value: 'Camisas' } })
    
    await waitFor(() => {
      expect(screen.getByText('Camisa Test')).toBeInTheDocument()
      expect(screen.queryByText('Pantalón Test')).not.toBeInTheDocument()
    })
  })

  it('✅ Debería buscar productos por texto', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Camisa Azul',
        price: 29.99,
        category: 'Camisas',
        image: '/images/camisa.jpg',
        stock: 10
      },
      {
        id: '2',
        name: 'Pantalón Negro',
        price: 49.99,
        category: 'Pantalones',
        image: '/images/pantalon.jpg',
        stock: 5
      }
    ]

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { products: mockProducts }
      }),
    })

    render(<MockedProducts />)
    
    await waitFor(() => {
      expect(screen.getByText('Camisa Azul')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar productos...')
    fireEvent.change(searchInput, { target: { value: 'Azul' } })
    
    await waitFor(() => {
      expect(screen.getByText('Camisa Azul')).toBeInTheDocument()
      expect(screen.queryByText('Pantalón Negro')).not.toBeInTheDocument()
    })
  })

  it('✅ Debería agregar producto al carrito', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Camisa Test',
        price: 29.99,
        category: 'Camisas',
        image: '/images/camisa.jpg',
        stock: 10
      }
    ]

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { products: mockProducts }
      }),
    })

    render(<MockedProducts />)
    
    await waitFor(() => {
      expect(screen.getByText('Camisa Test')).toBeInTheDocument()
    })

    const addToCartButton = screen.getByRole('button', { name: 'Agregar al Carrito' })
    fireEvent.click(addToCartButton)
    
    await waitFor(() => {
      expect(screen.getByText('Producto agregado al carrito')).toBeInTheDocument()
    })
  })

  it('✅ Debería mostrar botón deshabilitado cuando no hay stock', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Camisa Test',
        price: 29.99,
        category: 'Camisas',
        image: '/images/camisa.jpg',
        stock: 0
      }
    ]

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { products: mockProducts }
      }),
    })

    render(<MockedProducts />)
    
    await waitFor(() => {
      expect(screen.getByText('Sin Stock')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sin Stock' })).toBeDisabled()
    })
  })

  it('✅ Debería ordenar productos por precio', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Camisa Cara',
        price: 99.99,
        category: 'Camisas',
        image: '/images/camisa.jpg',
        stock: 10
      },
      {
        id: '2',
        name: 'Camisa Barata',
        price: 19.99,
        category: 'Camisas',
        image: '/images/camisa2.jpg',
        stock: 5
      }
    ]

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { products: mockProducts }
      }),
    })

    render(<MockedProducts />)
    
    await waitFor(() => {
      expect(screen.getByText('Camisa Cara')).toBeInTheDocument()
    })

    const sortSelect = screen.getByLabelText('Ordenar por')
    fireEvent.change(sortSelect, { target: { value: 'price-asc' } })
    
    await waitFor(() => {
      const productCards = screen.getAllByTestId('product-card')
      expect(productCards[0]).toHaveTextContent('Camisa Barata')
    })
  })

  it('❌ Debería mostrar error cuando falla la carga de productos', async () => {
    fetch.mockRejectedValueOnce(new Error('Error de red'))

    render(<MockedProducts />)
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar productos')).toBeInTheDocument()
    })
  })

  it('✅ Debería mostrar loading mientras cargan los productos', () => {
    fetch.mockImplementation(() => new Promise(() => {})) // Nunca resuelve

    render(<MockedProducts />)
    
    expect(screen.getByText('Cargando productos...')).toBeInTheDocument()
  })
})
