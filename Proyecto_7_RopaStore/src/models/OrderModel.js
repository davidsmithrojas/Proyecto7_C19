const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  shippingAddress: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Número de teléfono inválido']
    },
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200
    },
    city: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    state: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{7}$/, 'Código postal inválido (debe tener 7 dígitos)']
    },
    country: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    }
  },
  paymentInfo: {
    method: {
      type: String,
      required: true,
      enum: ['stripe', 'paypal', 'cash'],
      default: 'stripe'
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled'],
      default: 'pending'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      default: 'clp',
      uppercase: true,
      length: 3
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    maxlength: 500,
    trim: true
  },
  trackingNumber: {
    type: String,
    sparse: true,
    index: true
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    maxlength: 200,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices compuestos
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'paymentInfo.status': 1, status: 1 });

// Virtuals
orderSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

orderSchema.virtual('isProcessing').get(function() {
  return this.status === 'processing';
});

orderSchema.virtual('isShipped').get(function() {
  return this.status === 'shipped';
});

orderSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered';
});

orderSchema.virtual('isCancelled').get(function() {
  return this.status === 'cancelled';
});

orderSchema.virtual('isPaid').get(function() {
  return this.paymentInfo.status === 'succeeded';
});

orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

orderSchema.virtual('estimatedDelivery').get(function() {
  if (this.shippedAt) {
    const deliveryDate = new Date(this.shippedAt);
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 días de entrega
    return deliveryDate;
  }
  return null;
});

// Middleware pre-save
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generar número de orden único
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    
    // Calcular totales
    this.subtotal = this.items.reduce((total, item) => total + item.total, 0);
    this.total = this.subtotal + this.shippingCost + this.tax;
  }
  next();
});

// Métodos de instancia
orderSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  
  const now = new Date();
  switch (newStatus) {
    case 'shipped':
      this.shippedAt = now;
      break;
    case 'delivered':
      this.deliveredAt = now;
      break;
    case 'cancelled':
      this.cancelledAt = now;
      this.cancellationReason = notes;
      break;
  }
  
  return this.save();
};

orderSchema.methods.addTrackingNumber = function(trackingNumber) {
  this.trackingNumber = trackingNumber;
  this.status = 'shipped';
  this.shippedAt = new Date();
  return this.save();
};

orderSchema.methods.cancel = function(reason) {
  return this.updateStatus('cancelled', reason);
};

// Métodos estáticos
orderSchema.statics.getUserOrders = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId })
    .populate('items.product', 'name price images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

orderSchema.statics.getOrdersByStatus = function(status, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ status })
    .populate('user', 'firstName lastName email')
    .populate('items.product', 'name price images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

orderSchema.statics.getOrderStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$total' }
      }
    }
  ]);
};

orderSchema.statics.getRevenueStats = function(startDate, endDate) {
  const match = {};
  if (startDate && endDate) {
    match.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$total' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
