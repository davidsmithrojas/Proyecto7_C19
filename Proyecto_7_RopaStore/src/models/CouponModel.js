const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'El código del cupón es requerido'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [3, 'El código debe tener al menos 3 caracteres'],
    maxlength: [20, 'El código no puede exceder 20 caracteres']
  },
  name: {
    type: String,
    required: [true, 'El nombre del cupón es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: [true, 'El tipo de cupón es requerido'],
    default: 'percentage'
  },
  value: {
    type: Number,
    required: [true, 'El valor del cupón es requerido'],
    min: [0, 'El valor no puede ser negativo']
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'El monto mínimo no puede ser negativo']
  },
  maxDiscountAmount: {
    type: Number,
    min: [0, 'El descuento máximo no puede ser negativo']
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'El límite de uso debe ser mayor a 0']
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'El contador de uso no puede ser negativo']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida'],
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: [true, 'La fecha de vencimiento es requerida']
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: String,
    enum: ['Camisas', 'Pantalones', 'Zapatos', 'Juego de mesa', 'Reserva', 'Cuentos', 'otro']
  }],
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUsedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ createdBy: 1 });

// Virtual para verificar si el cupón está activo y válido
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Virtual para verificar si el cupón ha expirado
couponSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

// Virtual para verificar si el cupón ha alcanzado su límite de uso
couponSchema.virtual('isUsageLimitReached').get(function() {
  return this.usageLimit !== null && this.usedCount >= this.usageLimit;
});

// Método para validar si un cupón es aplicable a un pedido
couponSchema.methods.isApplicableToOrder = function(orderData) {
  const now = new Date();
  
  // Verificar si está activo y válido
  if (!this.isActive || this.validFrom > now || this.validUntil < now) {
    return { valid: false, reason: 'Cupón no válido o expirado' };
  }
  
  // Verificar límite de uso
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'Cupón ha alcanzado su límite de uso' };
  }
  
  // Verificar monto mínimo del pedido
  if (orderData.subtotal < this.minOrderAmount) {
    return { 
      valid: false, 
      reason: `El pedido debe ser de al menos $${this.minOrderAmount.toLocaleString()}` 
    };
  }
  
  // Verificar productos aplicables
  if (this.applicableProducts.length > 0) {
    const hasApplicableProduct = orderData.items.some(item => 
      this.applicableProducts.includes(item.product.toString())
    );
    if (!hasApplicableProduct) {
      return { valid: false, reason: 'Cupón no aplicable a los productos del pedido' };
    }
  }
  
  // Verificar categorías aplicables
  if (this.applicableCategories.length > 0) {
    const hasApplicableCategory = orderData.items.some(item => 
      this.applicableCategories.includes(item.category)
    );
    if (!hasApplicableCategory) {
      return { valid: false, reason: 'Cupón no aplicable a las categorías del pedido' };
    }
  }
  
  return { valid: true };
};

// Método para calcular el descuento
couponSchema.methods.calculateDiscount = function(orderData) {
  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = (orderData.subtotal * this.value) / 100;
  } else if (this.type === 'fixed') {
    discount = this.value;
  } else if (this.type === 'free_shipping') {
    discount = orderData.shippingCost || 0;
  }
  
  // Aplicar descuento máximo si está definido
  if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
    discount = this.maxDiscountAmount;
  }
  
  // No exceder el subtotal del pedido
  if (discount > orderData.subtotal) {
    discount = orderData.subtotal;
  }
  
  return Math.round(discount * 100) / 100; // Redondear a 2 decimales
};

// Método para incrementar el contador de uso
couponSchema.methods.incrementUsage = function() {
  this.usedCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

// Método estático para buscar cupones válidos
couponSchema.statics.findValidCoupons = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
    ]
  });
};

// Método estático para obtener cupones por código
couponSchema.statics.findByCode = function(code) {
  return this.findOne({ 
    code: code.toUpperCase(),
    isActive: true 
  });
};

module.exports = mongoose.model('Coupon', couponSchema);
