const Inventory = require('../models/InventoryModel');
const Product = require('../models/productModel');
const logger = require('../utils/logger');

class InventoryService {
  /**
   * Registrar movimiento de inventario
   */
  static async recordMovement(productId, action, quantity, userId, orderId = null, reason = null, notes = null) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const previousStock = product.stock;
      let newStock = previousStock;

      // Calcular nuevo stock según la acción
      switch (action) {
        case 'sale':
          newStock = Math.max(0, previousStock - quantity);
          break;
        case 'restock':
          newStock = previousStock + quantity;
          break;
        case 'adjustment':
          newStock = quantity; // Ajuste manual al stock
          break;
        case 'return':
          newStock = previousStock + quantity;
          break;
        default:
          throw new Error('Acción de inventario no válida');
      }

      // Actualizar stock del producto
      product.stock = newStock;
      await product.save();

      // Registrar movimiento en el historial
      const inventoryRecord = new Inventory({
        product: productId,
        action,
        quantity: Math.abs(quantity),
        previousStock,
        newStock,
        order: orderId,
        user: userId,
        reason,
        notes
      });

      await inventoryRecord.save();

      logger.info('Movimiento de inventario registrado', {
        productId,
        action,
        quantity,
        previousStock,
        newStock,
        userId,
        orderId
      });

      return {
        success: true,
        inventoryRecord,
        product: {
          id: product._id,
          name: product.name,
          previousStock,
          newStock
        }
      };
    } catch (error) {
      logger.error('Error al registrar movimiento de inventario:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de inventario de un producto
   */
  static async getProductHistory(productId, limit = 50) {
    try {
      const history = await Inventory.getProductHistory(productId, limit);
      return {
        success: true,
        history
      };
    } catch (error) {
      logger.error('Error al obtener historial de inventario:', error);
      throw error;
    }
  }

  /**
   * Obtener movimientos recientes de inventario
   */
  static async getRecentMovements(limit = 100) {
    try {
      const movements = await Inventory.getRecentMovements(limit);
      return {
        success: true,
        movements
      };
    } catch (error) {
      logger.error('Error al obtener movimientos recientes:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de inventario
   */
  static async getInventoryStats(productId = null, days = 30) {
    try {
      const stats = await Inventory.getInventoryStats(productId, days);
      return {
        success: true,
        stats
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas de inventario:', error);
      throw error;
    }
  }

  /**
   * Verificar stock disponible
   */
  static async checkStock(productId, requestedQuantity) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return {
        success: true,
        available: product.stock >= requestedQuantity,
        currentStock: product.stock,
        requestedQuantity,
        shortage: Math.max(0, requestedQuantity - product.stock)
      };
    } catch (error) {
      logger.error('Error al verificar stock:', error);
      throw error;
    }
  }

  /**
   * Obtener productos con stock bajo
   */
  static async getLowStockProducts(threshold = 10) {
    try {
      const products = await Product.getLowStockProducts(threshold);
      return {
        success: true,
        products,
        threshold
      };
    } catch (error) {
      logger.error('Error al obtener productos con stock bajo:', error);
      throw error;
    }
  }

  /**
   * Ajustar stock manualmente
   */
  static async adjustStock(productId, newStock, userId, reason, notes = null) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const previousStock = product.stock;
      const quantity = newStock - previousStock;

      return await this.recordMovement(
        productId,
        'adjustment',
        Math.abs(quantity),
        userId,
        null,
        reason,
        notes
      );
    } catch (error) {
      logger.error('Error al ajustar stock:', error);
      throw error;
    }
  }

  /**
   * Restaurar stock (para devoluciones)
   */
  static async restock(productId, quantity, userId, orderId = null, reason = 'Restock manual') {
    try {
      return await this.recordMovement(
        productId,
        'restock',
        quantity,
        userId,
        orderId,
        reason
      );
    } catch (error) {
      logger.error('Error al restaurar stock:', error);
      throw error;
    }
  }
}

module.exports = InventoryService;
