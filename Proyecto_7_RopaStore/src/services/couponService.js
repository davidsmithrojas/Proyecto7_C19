const Coupon = require('../models/CouponModel');
const CouponUsage = require('../models/CouponUsageModel');
const logger = require('../utils/logger');

class CouponService {
  /**
   * Crear un nuevo cupón
   */
  static async createCoupon(couponData, createdBy) {
    try {
      const coupon = new Coupon({
        ...couponData,
        createdBy
      });

      await coupon.save();

      logger.info('Cupón creado exitosamente', {
        couponId: coupon._id,
        code: coupon.code,
        createdBy
      });

      return {
        success: true,
        coupon
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('El código del cupón ya existe');
      }
      logger.error('Error al crear cupón:', error);
      throw error;
    }
  }

  /**
   * Validar y aplicar un cupón a un pedido
   */
  static async validateAndApplyCoupon(couponCode, orderData, userId) {
    try {
      const coupon = await Coupon.findByCode(couponCode);
      
      if (!coupon) {
        return {
          success: false,
          error: 'Cupón no encontrado'
        };
      }

      // Verificar si el cupón es aplicable
      const applicability = coupon.isApplicableToOrder(orderData);
      if (!applicability.valid) {
        return {
          success: false,
          error: applicability.reason
        };
      }

      // Verificar si el usuario ya usó este cupón (opcional, depende de la lógica de negocio)
      const hasUsed = await CouponUsage.hasUserUsedCoupon(coupon._id, userId);
      if (hasUsed) {
        return {
          success: false,
          error: 'Ya has usado este cupón anteriormente'
        };
      }

      // Calcular descuento
      const discountAmount = coupon.calculateDiscount(orderData);

      return {
        success: true,
        coupon: {
          id: coupon._id,
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value,
          discountAmount
        }
      };
    } catch (error) {
      logger.error('Error al validar cupón:', error);
      throw error;
    }
  }

  /**
   * Aplicar cupón a una orden
   */
  static async applyCouponToOrder(couponCode, orderId, userId, orderData) {
    try {
      const validation = await this.validateAndApplyCoupon(couponCode, orderData, userId);
      
      if (!validation.success) {
        return validation;
      }

      // Registrar el uso del cupón
      const couponUsage = new CouponUsage({
        coupon: validation.coupon.id,
        user: userId,
        order: orderId,
        discountAmount: validation.coupon.discountAmount,
        orderSubtotal: orderData.subtotal,
        orderTotal: orderData.total
      });

      await couponUsage.save();

      // Incrementar contador de uso del cupón
      const coupon = await Coupon.findById(validation.coupon.id);
      await coupon.incrementUsage();

      logger.info('Cupón aplicado exitosamente', {
        couponId: validation.coupon.id,
        orderId,
        userId,
        discountAmount: validation.coupon.discountAmount
      });

      return {
        success: true,
        coupon: validation.coupon,
        usage: couponUsage
      };
    } catch (error) {
      logger.error('Error al aplicar cupón:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los cupones
   */
  static async getAllCoupons(filters = {}) {
    try {
      const query = {};
      
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }
      
      if (filters.type) {
        query.type = filters.type;
      }

      const coupons = await Coupon.find(query)
        .populate('createdBy', 'username email')
        .sort({ createdAt: -1 });

      return {
        success: true,
        coupons
      };
    } catch (error) {
      logger.error('Error al obtener cupones:', error);
      throw error;
    }
  }

  /**
   * Obtener cupón por ID
   */
  static async getCouponById(couponId) {
    try {
      const coupon = await Coupon.findById(couponId)
        .populate('createdBy', 'username email')
        .populate('applicableProducts', 'name code')
        .populate('applicableUsers', 'username email');

      if (!coupon) {
        return {
          success: false,
          error: 'Cupón no encontrado'
        };
      }

      return {
        success: true,
        coupon
      };
    } catch (error) {
      logger.error('Error al obtener cupón:', error);
      throw error;
    }
  }

  /**
   * Actualizar cupón
   */
  static async updateCoupon(couponId, updateData, userId) {
    try {
      const coupon = await Coupon.findById(couponId);
      
      if (!coupon) {
        return {
          success: false,
          error: 'Cupón no encontrado'
        };
      }

      // Actualizar campos permitidos
      const allowedFields = [
        'name', 'description', 'value', 'minOrderAmount', 
        'maxDiscountAmount', 'usageLimit', 'isActive', 
        'validFrom', 'validUntil', 'applicableProducts', 
        'applicableCategories', 'applicableUsers'
      ];

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          coupon[field] = updateData[field];
        }
      });

      await coupon.save();

      logger.info('Cupón actualizado exitosamente', {
        couponId,
        updatedBy: userId
      });

      return {
        success: true,
        coupon
      };
    } catch (error) {
      logger.error('Error al actualizar cupón:', error);
      throw error;
    }
  }

  /**
   * Eliminar cupón (soft delete)
   */
  static async deleteCoupon(couponId, userId) {
    try {
      const coupon = await Coupon.findById(couponId);
      
      if (!coupon) {
        return {
          success: false,
          error: 'Cupón no encontrado'
        };
      }

      coupon.isActive = false;
      await coupon.save();

      logger.info('Cupón desactivado exitosamente', {
        couponId,
        deactivatedBy: userId
      });

      return {
        success: true,
        message: 'Cupón desactivado exitosamente'
      };
    } catch (error) {
      logger.error('Error al eliminar cupón:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso de cupones
   */
  static async getCouponStats(couponId = null, days = 30) {
    try {
      const stats = await CouponUsage.getUsageStats(couponId, days);
      
      return {
        success: true,
        stats
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas de cupones:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de uso de un cupón
   */
  static async getCouponUsageHistory(couponId, limit = 50) {
    try {
      const history = await CouponUsage.getCouponUsageHistory(couponId, limit);
      
      return {
        success: true,
        history
      };
    } catch (error) {
      logger.error('Error al obtener historial de uso:', error);
      throw error;
    }
  }

  /**
   * Obtener cupones válidos para mostrar al usuario
   */
  static async getValidCouponsForUser(userId) {
    try {
      const coupons = await Coupon.findValidCoupons();
      
      // Filtrar cupones aplicables al usuario si hay restricciones
      const applicableCoupons = coupons.filter(coupon => {
        if (coupon.applicableUsers.length === 0) {
          return true; // Cupón público
        }
        return coupon.applicableUsers.includes(userId);
      });

      return {
        success: true,
        coupons: applicableCoupons
      };
    } catch (error) {
      logger.error('Error al obtener cupones válidos:', error);
      throw error;
    }
  }
}

module.exports = CouponService;
