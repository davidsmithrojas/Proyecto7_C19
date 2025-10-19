const express = require("express");
const { auth } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/authRol');
const { generalLimiter, writeLimiter } = require('../middlewares/rateLimiter');
const ResponseFactory = require('../utils/response');
const orderRouter = express.Router();

// Importar controladores
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  processOrderReturn
} = require('../controllers/order.Controller');

// Middleware de autenticación para todas las rutas
orderRouter.use(auth);

// POST /api/v1/orders - Crear nueva orden
orderRouter.post('/',
  writeLimiter,
  createOrder
);

// GET /api/v1/orders - Obtener órdenes del usuario
orderRouter.get('/',
  generalLimiter,
  getUserOrders
);

// GET /api/v1/orders/:id - Obtener orden por ID
orderRouter.get('/:id',
  generalLimiter,
  getOrderById
);

// PUT /api/v1/orders/:id/status - Actualizar estado de orden (solo admin)
orderRouter.put('/:id/status',
  writeLimiter,
  requireAdmin,
  updateOrderStatus
);

// GET /api/v1/orders/admin/all - Obtener todas las órdenes (solo admin)
orderRouter.get('/admin/all',
  generalLimiter,
  requireAdmin,
  getAllOrders
);

// POST /api/v1/orders/:id/return - Procesar devolución de orden
orderRouter.post('/:id/return',
  writeLimiter,
  processOrderReturn
);

// GET /api/v1/orders/recent - Obtener pedidos recientes
orderRouter.get('/recent',
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

module.exports = orderRouter;
