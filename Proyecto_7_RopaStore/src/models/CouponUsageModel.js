const mongoose = require('mongoose');

const couponUsageSchema = new mongoose.Schema({
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  discountAmount: {
    type: Number,
    required: true,
    min: [0, 'El monto del descuento no puede ser negativo']
  },
  orderSubtotal: {
    type: Number,
    required: true,
    min: [0, 'El subtotal no puede ser negativo']
  },
  orderTotal: {
    type: Number,
    required: true,
    min: [0, 'El total no puede ser negativo']
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
couponUsageSchema.index({ coupon: 1 });
couponUsageSchema.index({ user: 1 });
couponUsageSchema.index({ order: 1 });
couponUsageSchema.index({ usedAt: -1 });

// Índice compuesto para evitar uso duplicado
couponUsageSchema.index({ coupon: 1, order: 1 }, { unique: true });

// Método estático para obtener estadísticas de uso de cupones
couponUsageSchema.statics.getUsageStats = function(couponId = null, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const matchQuery = { usedAt: { $gte: startDate } };
  if (couponId) {
    matchQuery.coupon = couponId;
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$coupon',
        totalUses: { $sum: 1 },
        totalDiscount: { $sum: '$discountAmount' },
        averageDiscount: { $avg: '$discountAmount' },
        uniqueUsers: { $addToSet: '$user' },
        lastUsed: { $max: '$usedAt' }
      }
    },
    {
      $lookup: {
        from: 'coupons',
        localField: '_id',
        foreignField: '_id',
        as: 'couponInfo'
      }
    },
    {
      $unwind: '$couponInfo'
    },
    {
      $project: {
        couponCode: '$couponInfo.code',
        couponName: '$couponInfo.name',
        totalUses: 1,
        totalDiscount: 1,
        averageDiscount: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        lastUsed: 1
      }
    },
    {
      $sort: { totalUses: -1 }
    }
  ]);
};

// Método estático para verificar si un usuario ya usó un cupón
couponUsageSchema.statics.hasUserUsedCoupon = function(couponId, userId) {
  return this.findOne({ coupon: couponId, user: userId });
};

// Método estático para obtener historial de uso de un cupón
couponUsageSchema.statics.getCouponUsageHistory = function(couponId, limit = 50) {
  return this.find({ coupon: couponId })
    .populate('user', 'username email')
    .populate('order', 'orderNumber total')
    .sort({ usedAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('CouponUsage', couponUsageSchema);
