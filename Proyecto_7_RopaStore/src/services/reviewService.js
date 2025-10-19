const Review = require('../models/ReviewModel');
const Product = require('../models/productModel');
const Order = require('../models/OrderModel');
const logger = require('../utils/logger');

class ReviewService {
  /**
   * Crear una nueva reseña
   */
  static async createReview(reviewData, userId) {
    try {
      // Verificar que el usuario tiene una orden para este producto
      const order = await Order.findOne({
        user: userId,
        _id: reviewData.order,
        'items.product': reviewData.product,
        status: { $in: ['delivered', 'completed'] }
      });

      if (!order) {
        return {
          success: false,
          error: 'No tienes una orden válida para este producto'
        };
      }

      // Verificar si ya existe una reseña para esta combinación
      const existingReview = await Review.findOne({
        product: reviewData.product,
        user: userId,
        order: reviewData.order
      });

      if (existingReview) {
        return {
          success: false,
          error: 'Ya has escrito una reseña para este producto en esta orden'
        };
      }

      const review = new Review({
        ...reviewData,
        user: userId,
        isVerified: true // Marcar como verificada porque viene de una orden
      });

      await review.save();

      // Actualizar estadísticas del producto
      await this.updateProductRatingStats(reviewData.product);

      logger.info('Reseña creada exitosamente', {
        reviewId: review._id,
        productId: reviewData.product,
        userId,
        rating: reviewData.rating
      });

      return {
        success: true,
        review
      };
    } catch (error) {
      if (error.code === 11000) {
        return {
          success: false,
          error: 'Ya has escrito una reseña para este producto'
        };
      }
      logger.error('Error al crear reseña:', error);
      throw error;
    }
  }

  /**
   * Obtener reseñas de un producto
   */
  static async getProductReviews(productId, options = {}) {
    try {
      const reviews = await Review.getProductReviews(productId, options);
      const stats = await Review.getProductReviewStats(productId);

      return {
        success: true,
        reviews,
        stats: stats[0] || {
          totalReviews: 0,
          averageRating: 0,
          verifiedReviews: 0,
          ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
        }
      };
    } catch (error) {
      logger.error('Error al obtener reseñas del producto:', error);
      throw error;
    }
  }

  /**
   * Obtener reseña por ID
   */
  static async getReviewById(reviewId) {
    try {
      const review = await Review.findById(reviewId)
        .populate('product', 'name image')
        .populate('user', 'username email')
        .populate('order', 'orderNumber')
        .populate('response.respondedBy', 'username');

      if (!review) {
        return {
          success: false,
          error: 'Reseña no encontrada'
        };
      }

      return {
        success: true,
        review
      };
    } catch (error) {
      logger.error('Error al obtener reseña:', error);
      throw error;
    }
  }

  /**
   * Actualizar reseña
   */
  static async updateReview(reviewId, updateData, userId) {
    try {
      const review = await Review.findOne({
        _id: reviewId,
        user: userId
      });

      if (!review) {
        return {
          success: false,
          error: 'Reseña no encontrada o no tienes permisos para editarla'
        };
      }

      // Solo permitir actualizar ciertos campos
      const allowedFields = ['title', 'comment', 'rating', 'images'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          review[field] = updateData[field];
        }
      });

      await review.save();

      // Actualizar estadísticas del producto
      await this.updateProductRatingStats(review.product);

      logger.info('Reseña actualizada exitosamente', {
        reviewId,
        userId
      });

      return {
        success: true,
        review
      };
    } catch (error) {
      logger.error('Error al actualizar reseña:', error);
      throw error;
    }
  }

  /**
   * Eliminar reseña
   */
  static async deleteReview(reviewId, userId) {
    try {
      const review = await Review.findOne({
        _id: reviewId,
        user: userId
      });

      if (!review) {
        return {
          success: false,
          error: 'Reseña no encontrada o no tienes permisos para eliminarla'
        };
      }

      const productId = review.product;
      await Review.findByIdAndDelete(reviewId);

      // Actualizar estadísticas del producto
      await this.updateProductRatingStats(productId);

      logger.info('Reseña eliminada exitosamente', {
        reviewId,
        userId
      });

      return {
        success: true,
        message: 'Reseña eliminada exitosamente'
      };
    } catch (error) {
      logger.error('Error al eliminar reseña:', error);
      throw error;
    }
  }

  /**
   * Votar si una reseña es útil
   */
  static async voteHelpful(reviewId, userId) {
    try {
      const review = await Review.findById(reviewId);
      
      if (!review) {
        return {
          success: false,
          error: 'Reseña no encontrada'
        };
      }

      await review.voteHelpful(userId);

      return {
        success: true,
        helpfulVotes: review.helpfulVotes,
        notHelpfulVotes: review.notHelpfulVotes
      };
    } catch (error) {
      logger.error('Error al votar reseña como útil:', error);
      throw error;
    }
  }

  /**
   * Votar si una reseña no es útil
   */
  static async voteNotHelpful(reviewId, userId) {
    try {
      const review = await Review.findById(reviewId);
      
      if (!review) {
        return {
          success: false,
          error: 'Reseña no encontrada'
        };
      }

      await review.voteNotHelpful(userId);

      return {
        success: true,
        helpfulVotes: review.helpfulVotes,
        notHelpfulVotes: review.notHelpfulVotes
      };
    } catch (error) {
      logger.error('Error al votar reseña como no útil:', error);
      throw error;
    }
  }

  /**
   * Reportar una reseña
   */
  static async reportReview(reviewId, userId, reason) {
    try {
      const review = await Review.findById(reviewId);
      
      if (!review) {
        return {
          success: false,
          error: 'Reseña no encontrada'
        };
      }

      await review.reportReview(userId, reason);

      return {
        success: true,
        message: 'Reseña reportada exitosamente'
      };
    } catch (error) {
      if (error.message === 'Ya has reportado esta reseña') {
        return {
          success: false,
          error: error.message
        };
      }
      logger.error('Error al reportar reseña:', error);
      throw error;
    }
  }

  /**
   * Responder a una reseña (solo admin)
   */
  static async respondToReview(reviewId, responseText, adminId) {
    try {
      const review = await Review.findById(reviewId);
      
      if (!review) {
        return {
          success: false,
          error: 'Reseña no encontrada'
        };
      }

      review.response = {
        text: responseText,
        respondedBy: adminId,
        respondedAt: new Date()
      };

      await review.save();

      logger.info('Respuesta agregada a reseña', {
        reviewId,
        adminId
      });

      return {
        success: true,
        review
      };
    } catch (error) {
      logger.error('Error al responder reseña:', error);
      throw error;
    }
  }

  /**
   * Obtener reseñas recientes
   */
  static async getRecentReviews(limit = 20) {
    try {
      const reviews = await Review.getRecentReviews(limit);
      
      return {
        success: true,
        reviews
      };
    } catch (error) {
      logger.error('Error al obtener reseñas recientes:', error);
      throw error;
    }
  }

  /**
   * Obtener reseñas reportadas (solo admin)
   */
  static async getReportedReviews() {
    try {
      const reviews = await Review.getReportedReviews();
      
      return {
        success: true,
        reviews
      };
    } catch (error) {
      logger.error('Error al obtener reseñas reportadas:', error);
      throw error;
    }
  }

  /**
   * Aprobar/desaprobar reseña (solo admin)
   */
  static async moderateReview(reviewId, isApproved, adminId) {
    try {
      const review = await Review.findById(reviewId);
      
      if (!review) {
        return {
          success: false,
          error: 'Reseña no encontrada'
        };
      }

      review.isApproved = isApproved;
      await review.save();

      // Actualizar estadísticas del producto
      await this.updateProductRatingStats(review.product);

      logger.info('Reseña moderada', {
        reviewId,
        isApproved,
        adminId
      });

      return {
        success: true,
        review
      };
    } catch (error) {
      logger.error('Error al moderar reseña:', error);
      throw error;
    }
  }

  /**
   * Actualizar estadísticas de calificación del producto
   */
  static async updateProductRatingStats(productId) {
    try {
      const stats = await Review.getProductReviewStats(productId);
      const productStats = stats[0];

      if (productStats) {
        await Product.findByIdAndUpdate(productId, {
          averageRating: productStats.averageRating,
          totalReviews: productStats.totalReviews,
          ratingDistribution: productStats.ratingDistribution
        });
      }
    } catch (error) {
      logger.error('Error al actualizar estadísticas del producto:', error);
    }
  }
}

module.exports = ReviewService;
