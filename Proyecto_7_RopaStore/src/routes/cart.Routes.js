const express = require('express');
const { auth } = require('../middlewares/auth');
const { generalLimiter, writeLimiter } = require('../middlewares/rateLimiter');
const validation = require('../middlewares/validation');
const cartRouter = express.Router();

// Importar controladores
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkCartAvailability,
  getCartStats
} = require('../controllers/cart.Controller');

// Todas las rutas del carrito requieren autenticación
cartRouter.use(auth);

// Rutas del carrito
cartRouter.get('/',
  generalLimiter,
  getCart
);

cartRouter.post('/add',
  writeLimiter,
  addToCart
);

cartRouter.put('/update/:productId',
  writeLimiter,
  updateCartItem
);

cartRouter.delete('/remove/:productId',
  writeLimiter,
  removeFromCart
);

cartRouter.delete('/clear',
  writeLimiter,
  clearCart
);

cartRouter.get('/check-availability',
  generalLimiter,
  checkCartAvailability
);

cartRouter.get('/stats',
  generalLimiter,
  getCartStats
);

cartRouter.get('/total',
  generalLimiter,
  getCartStats
);

module.exports = cartRouter;

