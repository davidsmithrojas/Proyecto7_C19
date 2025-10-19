const CouponService = require('../services/couponService');
const ResponseFactory = require('../utils/response');
const { asyncHandler } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

/**
 * Crear nuevo cupón (solo admin)
 */
exports.createCoupon = asyncHandler(async (req, res) => {
  const couponData = req.body;
  const userId = req.user.id;

  const result = await CouponService.createCoupon(couponData, userId);
  
  ResponseFactory.success(res, result, 'Cupón creado exitosamente', 201);
});

/**
 * Obtener todos los cupones
 */
exports.getAllCoupons = asyncHandler(async (req, res) => {
  const { isActive, type } = req.query;
  const filters = {};

  if (isActive !== undefined) {
    filters.isActive = isActive === 'true';
  }
  if (type) {
    filters.type = type;
  }

  const result = await CouponService.getAllCoupons(filters);
  
  ResponseFactory.success(res, result, 'Cupones obtenidos exitosamente');
});

/**
 * Obtener cupón por ID
 */
exports.getCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await CouponService.getCouponById(id);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Cupón obtenido exitosamente');
});

/**
 * Actualizar cupón (solo admin)
 */
exports.updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const userId = req.user.id;

  const result = await CouponService.updateCoupon(id, updateData, userId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Cupón actualizado exitosamente');
});

/**
 * Eliminar cupón (solo admin)
 */
exports.deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await CouponService.deleteCoupon(id, userId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Cupón eliminado exitosamente');
});

/**
 * Validar cupón
 */
exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const { orderData } = req.body;
  const userId = req.user.id;

  if (!code) {
    return ResponseFactory.error(res, 'El código del cupón es requerido', 400);
  }

  if (!orderData) {
    return ResponseFactory.error(res, 'Los datos del pedido son requeridos', 400);
  }

  const result = await CouponService.validateAndApplyCoupon(code, orderData, userId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 400);
  }

  ResponseFactory.success(res, result, 'Cupón válido');
});

/**
 * Aplicar cupón a orden
 */
exports.applyCouponToOrder = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const { orderId, orderData } = req.body;
  const userId = req.user.id;

  if (!code || !orderId || !orderData) {
    return ResponseFactory.error(res, 'Código del cupón, ID de orden y datos del pedido son requeridos', 400);
  }

  const result = await CouponService.applyCouponToOrder(code, orderId, userId, orderData);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 400);
  }

  ResponseFactory.success(res, result, 'Cupón aplicado exitosamente');
});

/**
 * Obtener estadísticas de cupones (solo admin)
 */
exports.getCouponStats = asyncHandler(async (req, res) => {
  const { couponId, days = 30 } = req.query;

  const result = await CouponService.getCouponStats(
    couponId || null, 
    parseInt(days)
  );
  
  ResponseFactory.success(res, result, 'Estadísticas de cupones obtenidas exitosamente');
});

/**
 * Obtener historial de uso de cupón (solo admin)
 */
exports.getCouponUsageHistory = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const { limit = 50 } = req.query;

  const result = await CouponService.getCouponUsageHistory(couponId, parseInt(limit));
  
  ResponseFactory.success(res, result, 'Historial de uso obtenido exitosamente');
});

/**
 * Obtener cupones válidos para usuario
 */
exports.getValidCouponsForUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await CouponService.getValidCouponsForUser(userId);
  
  ResponseFactory.success(res, result, 'Cupones válidos obtenidos exitosamente');
});

/**
 * Obtener cupón por código
 */
exports.getCouponByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const result = await CouponService.validateAndApplyCoupon(code, {}, req.user.id);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Cupón obtenido exitosamente');
});
