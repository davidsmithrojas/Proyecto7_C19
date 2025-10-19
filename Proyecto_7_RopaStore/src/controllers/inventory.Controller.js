const InventoryService = require('../services/inventoryService');
const ResponseFactory = require('../utils/response');
const { asyncHandler } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

/**
 * Obtener historial de inventario de un producto
 */
exports.getProductHistory = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { limit = 50 } = req.query;

  const result = await InventoryService.getProductHistory(productId, parseInt(limit));
  
  ResponseFactory.success(res, result, 'Historial de inventario obtenido exitosamente');
});

/**
 * Obtener movimientos recientes de inventario
 */
exports.getRecentMovements = asyncHandler(async (req, res) => {
  const { limit = 100 } = req.query;

  const result = await InventoryService.getRecentMovements(parseInt(limit));
  
  ResponseFactory.success(res, result, 'Movimientos recientes obtenidos exitosamente');
});

/**
 * Obtener estadísticas de inventario
 */
exports.getInventoryStats = asyncHandler(async (req, res) => {
  const { productId, days = 30 } = req.query;

  const result = await InventoryService.getInventoryStats(
    productId || null, 
    parseInt(days)
  );
  
  ResponseFactory.success(res, result, 'Estadísticas de inventario obtenidas exitosamente');
});

/**
 * Verificar stock disponible
 */
exports.checkStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return ResponseFactory.error(res, 'La cantidad debe ser mayor a 0', 400);
  }

  const result = await InventoryService.checkStock(productId, quantity);
  
  ResponseFactory.success(res, result, 'Stock verificado exitosamente');
});

/**
 * Obtener productos con stock bajo
 */
exports.getLowStockProducts = asyncHandler(async (req, res) => {
  const { threshold = 10 } = req.query;

  const result = await InventoryService.getLowStockProducts(parseInt(threshold));
  
  ResponseFactory.success(res, result, 'Productos con stock bajo obtenidos exitosamente');
});

/**
 * Ajustar stock manualmente (solo admin)
 */
exports.adjustStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { newStock, reason, notes } = req.body;
  const userId = req.user.id;

  if (!newStock || newStock < 0) {
    return ResponseFactory.error(res, 'El nuevo stock debe ser mayor o igual a 0', 400);
  }

  if (!reason) {
    return ResponseFactory.error(res, 'La razón del ajuste es requerida', 400);
  }

  const result = await InventoryService.adjustStock(
    productId, 
    newStock, 
    userId, 
    reason, 
    notes
  );
  
  ResponseFactory.success(res, result, 'Stock ajustado exitosamente');
});

/**
 * Restaurar stock (solo admin)
 */
exports.restock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, reason, orderId } = req.body;
  const userId = req.user.id;

  if (!quantity || quantity <= 0) {
    return ResponseFactory.error(res, 'La cantidad debe ser mayor a 0', 400);
  }

  const result = await InventoryService.restock(
    productId, 
    quantity, 
    userId, 
    orderId, 
    reason || 'Restock manual'
  );
  
  ResponseFactory.success(res, result, 'Stock restaurado exitosamente');
});

/**
 * Obtener dashboard de inventario
 */
exports.getInventoryDashboard = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  // Obtener estadísticas generales
  const statsResult = await InventoryService.getInventoryStats(null, parseInt(days));
  
  // Obtener productos con stock bajo
  const lowStockResult = await InventoryService.getLowStockProducts(10);
  
  // Obtener movimientos recientes
  const movementsResult = await InventoryService.getRecentMovements(20);

  const dashboard = {
    stats: statsResult.stats,
    lowStockProducts: lowStockResult.products,
    recentMovements: movementsResult.movements,
    period: {
      days: parseInt(days),
      startDate: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000),
      endDate: new Date()
    }
  };
  
  ResponseFactory.success(res, dashboard, 'Dashboard de inventario obtenido exitosamente');
});
