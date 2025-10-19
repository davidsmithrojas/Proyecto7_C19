import React from 'react'
import { Users, ShoppingBag, DollarSign, TrendingUp, Package, Eye } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { formatPrice } from '../../utils/currency'

const AdminDashboard = () => {
  const { 
    stats, 
    recentOrders, 
    topProducts, 
    loading, 
    error 
  } = useDashboard()

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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Resumen general del negocio
          </p>
        </div>

        {/* Indicadores de carga y error */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600">+{stats.newUsersThisMonth || 0} este mes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600">+{stats.ordersThisMonth || 0} este mes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue || 0)}</p>
                <p className="text-sm text-green-600">+{formatPrice(stats.revenueThisMonth || 0)} este mes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Productos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts || 0}</p>
                <p className="text-sm text-red-600">{stats.lowStockProducts || 0} con stock bajo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pedidos recientes */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Pedidos Recientes
              </h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {recentOrders && recentOrders.length > 0 ? recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer}
                        </p>
                        <p className="text-sm text-gray-600">
                          #{order.id} • {new Date(order.date).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-500">
                    No hay pedidos recientes
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a
                  href="/admin/orders"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver todos los pedidos
                </a>
              </div>
            </div>
          </div>

          {/* Productos más vendidos */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Productos Más Vendidos
              </h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {topProducts && topProducts.length > 0 ? topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {product.sales} ventas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(product.revenue)}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-500">
                    No hay datos de productos
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a
                  href="/admin/products"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver todos los productos
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="mt-8 bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Acciones Rápidas
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/products/new"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Agregar Producto</p>
                  <p className="text-sm text-gray-600">Crear un nuevo producto</p>
                </div>
              </a>
              <a
                href="/admin/orders"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShoppingBag className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Gestionar Pedidos</p>
                  <p className="text-sm text-gray-600">Ver y actualizar pedidos</p>
                </div>
              </a>
              <a
                href="/admin/users"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Gestionar Usuarios</p>
                  <p className="text-sm text-gray-600">Ver y administrar usuarios</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
