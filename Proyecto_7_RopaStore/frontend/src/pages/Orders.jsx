import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Package, Calendar, DollarSign, Eye } from 'lucide-react'

const Orders = () => {
  const { user } = useAuth()

  // Datos de ejemplo para las órdenes
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'entregado',
      total: 125000,
      items: [
        { name: 'Camisa Formal Blanca', quantity: 2, price: 45000 },
        { name: 'Pantalón Jeans Clásico', quantity: 1, price: 35000 }
      ]
    },
    {
      id: 'ORD-002',
      date: '2024-01-20',
      status: 'enviado',
      total: 85000,
      items: [
        { name: 'Zapatos Oxford Negros', quantity: 1, price: 85000 }
      ]
    },
    {
      id: 'ORD-003',
      date: '2024-01-25',
      status: 'procesando',
      total: 67000,
      items: [
        { name: 'Camisa Casual Rayas', quantity: 1, price: 35000 },
        { name: 'Pantalón Chino Elegante', quantity: 1, price: 32000 }
      ]
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'entregado':
        return 'bg-green-100 text-green-800'
      case 'enviado':
        return 'bg-blue-100 text-blue-800'
      case 'procesando':
        return 'bg-yellow-100 text-yellow-800'
      case 'pendiente':
        return 'bg-gray-100 text-gray-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'entregado':
        return 'Entregado'
      case 'enviado':
        return 'Enviado'
      case 'procesando':
        return 'Procesando'
      case 'pendiente':
        return 'Pendiente'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mis Pedidos
          </h1>
          <p className="text-gray-600">
            Aquí puedes ver el historial de todos tus pedidos
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No tienes pedidos aún
            </h2>
            <p className="text-gray-600 mb-8">
              Cuando realices tu primera compra, aparecerá aquí
            </p>
            <a
              href="/products"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Ver Productos
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido #{order.id}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(order.date).toLocaleDateString('es-CL')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          ${order.total.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Cantidad: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ${(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </button>
                      {order.status === 'entregado' && (
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Volver a Comprar
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total: <span className="font-semibold text-gray-900">${order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
