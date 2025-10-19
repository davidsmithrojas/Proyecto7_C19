import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import Login from '../pages/Login'

// Mock de fetch
global.fetch = vi.fn()

const MockedLogin = () => (
  <BrowserRouter>
    <AuthProvider>
      <Login />
    </AuthProvider>
  </BrowserRouter>
)

describe('🔐 Pruebas de Login', () => {
  beforeEach(() => {
    fetch.mockClear()
    localStorage.clear()
  })

  it('✅ Debería renderizar el formulario de login', () => {
    render(<MockedLogin />)
    
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument()
  })

  it('✅ Debería permitir escribir en los campos de entrada', () => {
    render(<MockedLogin />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Contraseña')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('✅ Debería hacer login exitosamente con credenciales válidas', async () => {
    const mockResponse = {
      success: true,
      data: {
        token: 'mock-token',
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          role: 'user'
        }
      }
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<MockedLogin />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/users/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          })
        })
      )
    })
  })

  it('❌ Debería mostrar error con credenciales inválidas', async () => {
    const mockError = {
      success: false,
      message: 'Credenciales inválidas'
    }

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => mockError,
    })

    render(<MockedLogin />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
    })
  })

  it('❌ Debería validar campos requeridos', async () => {
    render(<MockedLogin />)
    
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email es requerido')).toBeInTheDocument()
      expect(screen.getByText('Contraseña es requerida')).toBeInTheDocument()
    })
  })

  it('✅ Debería mostrar enlace a registro', () => {
    render(<MockedLogin />)
    
    expect(screen.getByText('¿No tienes cuenta?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Regístrate aquí' })).toBeInTheDocument()
  })
})
