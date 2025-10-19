const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  action: {
    type: String,
    enum: ['sale', 'restock', 'adjustment', 'return'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: 'La cantidad debe ser un número entero'
    }
  },
  previousStock: {
    type: Number,
    required: true,
    min: 0
  },
  newStock: {
    type: Number,
    required: true,
    min: 0
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    maxlength: [200, 'La razón no puede exceder 200 caracteres'],
    trim: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres'],
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
inventorySchema.index({ product: 1, createdAt: -1 });
inventorySchema.index({ action: 1 });
inventorySchema.index({ user: 1 });
inventorySchema.index({ order: 1 });

// Virtual para calcular el cambio de stock
inventorySchema.virtual('stockChange').get(function() {
  return this.newStock - this.previousStock;
});

// Método estático para obtener historial de un producto
inventorySchema.statics.getProductHistory = function(productId, limit = 50) {
  return this.find({ product: productId })
    .populate('user', 'username email')
    .populate('order', 'orderNumber')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Método estático para obtener movimientos recientes
inventorySchema.statics.getRecentMovements = function(limit = 100) {
  return this.find()
    .populate('product', 'name code')
    .populate('user', 'username email')
    .populate('order', 'orderNumber')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Método estático para obtener estadísticas de inventario
inventorySchema.statics.getInventoryStats = function(productId = null, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const matchQuery = { createdAt: { $gte: startDate } };
  if (productId) {
    matchQuery.product = productId;
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        products: { $addToSet: '$product' }
      }
    }
  ]);
};

module.exports = mongoose.model('Inventory', inventorySchema);
