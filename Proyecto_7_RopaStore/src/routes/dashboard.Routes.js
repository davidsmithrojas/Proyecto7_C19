const express = require("express");
const { auth } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/authRol');
const { generalLimiter } = require('../middlewares/rateLimiter');
const ResponseFactory = require('../utils/response');
const dashboardRouter = express.Router();

// Middleware de autenticación para todas las rutas
dashboardRouter.use(auth);
dashboardRouter.use(requireAdmin);

// GET /api/v1/dashboard/stats - Obtener estadísticas del dashboard
dashboardRouter.get('/stats',
  generalLimiter,
  async (req, res) => {
    try {
      // Por ahora, devolver estadísticas básicas
      // En el futuro, esto se puede conectar con servicios reales
      const stats = {
        totalUsers: 0,
        newUsersThisMonth: 0,
        totalOrders: 0,
        ordersThisMonth: 0,
        totalRevenue: 0,
        revenueThisMonth: 0,
        totalProducts: 0,
        lowStockProducts: 0
      };

      ResponseFactory.success(res, stats, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      ResponseFactory.error(res, 'Error al obtener estadísticas', 500);
    }
  }
);

// GET /api/v1/dashboard/recent-orders - Obtener pedidos recientes
dashboardRouter.get('/recent-orders',
  generalLimiter,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      
      // Por ahora, devolver array vacío
      // En el futuro, esto se puede conectar con el servicio de órdenes
      const orders = [];

      ResponseFactory.success(res, { orders }, 'Pedidos recientes obtenidos exitosamente');
    } catch (error) {
      ResponseFactory.error(res, 'Error al obtener pedidos recientes', 500);
    }
  }
);

// GET /api/v1/dashboard/top-products - Obtener productos más vendidos
dashboardRouter.get('/top-products',
  generalLimiter,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      
      // Por ahora, devolver array vacío
      // En el futuro, esto se puede conectar con el servicio de productos
      const products = [];

      ResponseFactory.success(res, { products }, 'Productos más vendidos obtenidos exitosamente');
    } catch (error) {
      ResponseFactory.error(res, 'Error al obtener productos más vendidos', 500);
    }
  }
);

// GET /api/v1/dashboard/sales-chart - Obtener datos del gráfico de ventas
dashboardRouter.get('/sales-chart',
  generalLimiter,
  async (req, res) => {
    try {
      const period = req.query.period || '30d';
      
      // Por ahora, devolver array vacío
      const data = [];

      ResponseFactory.success(res, data, 'Datos del gráfico de ventas obtenidos exitosamente');
    } catch (error) {
      ResponseFactory.error(res, 'Error al obtener datos del gráfico de ventas', 500);
    }
  }
);

// GET /api/v1/dashboard/user-growth - Obtener datos de crecimiento de usuarios
dashboardRouter.get('/user-growth',
  generalLimiter,
  async (req, res) => {
    try {
      const period = req.query.period || '30d';
      
      // Por ahora, devolver array vacío
      const data = [];

      ResponseFactory.success(res, data, 'Datos de crecimiento de usuarios obtenidos exitosamente');
    } catch (error) {
      ResponseFactory.error(res, 'Error al obtener datos de crecimiento de usuarios', 500);
    }
  }
);

module.exports = dashboardRouter;
