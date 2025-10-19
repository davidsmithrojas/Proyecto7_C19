const CartService = require('../services/cartService');
const ResponseFactory = require('../utils/response');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Obtener carrito del usuario
 */
exports.getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cart = await CartService.getUserCart(userId);
  ResponseFactory.success(res, { cart }, 'Carrito obtenido exitosamente');
});

/**
 * Agregar producto al carrito
 */
exports.addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;
  
  if (!productId) {
    return ResponseFactory.error(res, 'ID del producto es requerido', 400);
  }

  const cart = await CartService.addProductToCart(userId, productId, quantity);
  ResponseFactory.success(res, { cart }, 'Producto agregado al carrito exitosamente');
});

/**
 * Actualizar cantidad de producto en el carrito
 */
exports.updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined) {
    return ResponseFactory.error(res, 'Cantidad es requerida', 400);
  }

  const cart = await CartService.updateProductQuantity(userId, productId, quantity);
  ResponseFactory.success(res, { cart }, 'Cantidad actualizada exitosamente');
});

/**
 * Remover producto del carrito
 */
exports.removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const cart = await CartService.removeProductFromCart(userId, productId);
  ResponseFactory.success(res, { cart }, 'Producto removido del carrito exitosamente');
});

/**
 * Limpiar carrito
 */
exports.clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cart = await CartService.clearCart(userId);
  ResponseFactory.success(res, { cart }, 'Carrito limpiado exitosamente');
});

/**
 * Verificar disponibilidad del carrito
 */
exports.checkCartAvailability = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await CartService.checkCartAvailability(userId);
  ResponseFactory.success(res, result, 'Disponibilidad verificada');
});

/**
 * Obtener estadísticas del carrito
 */
exports.getCartStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const stats = await CartService.getCartStats(userId);
  ResponseFactory.success(res, { stats }, 'Estadísticas del carrito obtenidas');
});

