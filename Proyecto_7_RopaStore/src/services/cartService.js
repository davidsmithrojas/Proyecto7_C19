const Cart = require('../models/CartModel');
const Product = require('../models/productModel');
const logger = require('../utils/logger');

class CartService {
  /**
   * Obtener carrito de usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Carrito del usuario
   */
  static async getUserCart(userId) {
    try {
      let cart = await Cart.getUserCart(userId);

      if (!cart) {
        // Crear carrito si no existe
        cart = await Cart.createUserCart(userId);
      }

      // Poblar información de productos
      await cart.populate({
        path: 'products.product',
        select: 'name description price images slug isActive stock'
      });

      logger.info('Carrito obtenido', {
        userId,
        itemsCount: cart.products.length,
        total: cart.total
      });

      return cart;
    } catch (error) {
      logger.error('Error al obtener carrito', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Agregar producto al carrito
   * @param {string} userId - ID del usuario
   * @param {string} productId - ID del producto
   * @param {number} quantity - Cantidad a agregar
   * @returns {Promise<Object>} Carrito actualizado
   */
  static async addProductToCart(userId, productId, quantity = 1) {
    try {
      // Verificar que el producto existe y está activo
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      if (!product.isActive) {
        throw new Error('El producto no está disponible');
      }

      if (product.stock < quantity) {
        throw new Error('Stock insuficiente');
      }

      // Obtener o crear carrito
      let cart = await Cart.getUserCart(userId);
      if (!cart) {
        cart = await Cart.createUserCart(userId);
      }

      // Agregar producto al carrito directamente
      const existingItem = cart.products.find(item => 
        item.product.toString() === productId.toString()
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.products.push({
          product: productId,
          quantity: quantity,
          price: product.price
        });
      }
      
      await cart.save();

      // Poblar información de productos
      await cart.populate({
        path: 'products.product',
        select: 'name description price images slug isActive stock'
      });

      logger.info('Producto agregado al carrito', {
        userId,
        productId,
        quantity,
        cartTotal: cart.total
      });

      return cart;
    } catch (error) {
      logger.error('Error al agregar producto al carrito', { 
        error: error.message, 
        userId, 
        productId, 
        quantity 
      });
      throw error;
    }
  }

  /**
   * Actualizar cantidad de producto en el carrito
   * @param {string} userId - ID del usuario
   * @param {string} productId - ID del producto
   * @param {number} quantity - Nueva cantidad
   * @returns {Promise<Object>} Carrito actualizado
   */
  static async updateProductQuantity(userId, productId, quantity) {
    try {
      const cart = await Cart.getUserCart(userId);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      if (quantity <= 0) {
        // Remover producto si la cantidad es 0 o menor
        await cart.removeProduct(productId);
      } else {
        // Verificar stock disponible
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
          throw new Error('El producto no está disponible');
        }

        if (product.stock < quantity) {
          throw new Error('Stock insuficiente');
        }

        // Actualizar cantidad
        await cart.updateProductQuantity(productId, quantity);
      }

      // Poblar información de productos
      await cart.populate({
        path: 'products.product',
        select: 'name description price images slug isActive stock'
      });

      logger.info('Cantidad de producto actualizada en carrito', {
        userId,
        productId,
        quantity,
        cartTotal: cart.total
      });

      return cart;
    } catch (error) {
      logger.error('Error al actualizar cantidad en carrito', { 
        error: error.message, 
        userId, 
        productId, 
        quantity 
      });
      throw error;
    }
  }

  /**
   * Remover producto del carrito
   * @param {string} userId - ID del usuario
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>} Carrito actualizado
   */
  static async removeProductFromCart(userId, productId) {
    try {
      let cart = await Cart.getUserCart(userId);
      if (!cart) {
        cart = await Cart.createUserCart(userId);
      }

      await cart.removeProduct(productId);

      // Poblar información de productos
      await cart.populate({
        path: 'products.product',
        select: 'name description price images slug isActive stock'
      });

      logger.info('Producto removido del carrito', {
        userId,
        productId,
        cartTotal: cart.total
      });

      return cart;
    } catch (error) {
      logger.error('Error al remover producto del carrito', { 
        error: error.message, 
        userId, 
        productId 
      });
      throw error;
    }
  }

  /**
   * Limpiar carrito
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Carrito vacío
   */
  static async clearCart(userId) {
    try {
      const cart = await Cart.getUserCart(userId);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      await cart.clear();

      logger.info('Carrito limpiado', {
        userId
      });

      return cart;
    } catch (error) {
      logger.error('Error al limpiar carrito', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de productos en el carrito
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Resultado de verificación
   */
  static async checkCartAvailability(userId) {
    try {
      const cart = await Cart.getUserCart(userId);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const unavailableItems = await cart.checkStockAvailability();

      logger.info('Disponibilidad del carrito verificada', {
        userId,
        unavailableItemsCount: unavailableItems.length
      });

      return {
        isAvailable: unavailableItems.length === 0,
        unavailableItems
      };
    } catch (error) {
      logger.error('Error al verificar disponibilidad del carrito', { 
        error: error.message, 
        userId 
      });
      throw error;
    }
  }

  /**
   * Obtener estadísticas del carrito
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Estadísticas del carrito
   */
  static async getCartStats(userId) {
    try {
      const cart = await Cart.getUserCart(userId);
      if (!cart) {
        return {
          totalItems: 0,
          totalValue: 0,
          isEmpty: true
        };
      }

      const stats = {
        totalItems: cart.totalItems,
        totalValue: cart.total,
        isEmpty: cart.isEmpty,
        itemsCount: cart.products.length
      };

      logger.info('Estadísticas del carrito obtenidas', {
        userId,
        stats
      });

      return stats;
    } catch (error) {
      logger.error('Error al obtener estadísticas del carrito', { 
        error: error.message, 
        userId 
      });
      throw error;
    }
  }

  /**
   * Obtener carritos expirados
   * @returns {Promise<Array>} Carritos expirados
   */
  static async getExpiredCarts() {
    try {
      const expiredCarts = await Cart.find({
        expiresAt: { $lt: new Date() },
        isActive: true
      });

      logger.info('Carritos expirados obtenidos', {
        count: expiredCarts.length
      });

      return expiredCarts;
    } catch (error) {
      logger.error('Error al obtener carritos expirados', { error: error.message });
      throw error;
    }
  }

  /**
   * Limpiar carritos expirados
   * @returns {Promise<number>} Número de carritos limpiados
   */
  static async cleanExpiredCarts() {
    try {
      const result = await Cart.updateMany(
        {
          expiresAt: { $lt: new Date() },
          isActive: true
        },
        {
          isActive: false
        }
      );

      logger.info('Carritos expirados limpiados', {
        modifiedCount: result.modifiedCount
      });

      return result.modifiedCount;
    } catch (error) {
      logger.error('Error al limpiar carritos expirados', { error: error.message });
      throw error;
    }
  }
}

module.exports = CartService;

