const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    unique: true,
    minlength: [1, 'El nombre del producto es requerido'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    minlength: [1, 'La descripción es requerida'],
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo'],
    set: function(value) {
      return Math.round(value * 100) / 100; // Redondear a 2 decimales
    }
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: {
      values: ['Camisas', 'Pantalones', 'Zapatos', 'Juego de mesa', 'Reserva', 'Cuentos', 'otro'],
      message: 'La categoría debe ser: Camisas, Pantalones, Zapatos, Juego de mesa, Reserva, Cuentos u otro'
    },
    default: 'otro'
  },
  code: {
    type: String,
    required: [true, 'El código del producto es requerido'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [3, 'El código debe tener al menos 3 caracteres'],
    maxlength: [20, 'El código no puede exceder 20 caracteres']
  },
  image: {
    type: String,
    default: null,
    trim: true
  },
  sizes: [{
    type: String,
    required: true,
    trim: true
  }],
  colors: [{
    type: String,
    required: true,
    trim: true
  }],
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: 'El stock debe ser un número entero'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'La calificación promedio no puede ser negativa'],
    max: [5, 'La calificación promedio no puede ser mayor a 5']
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: [0, 'El total de reseñas no puede ser negativo']
  },
  ratingDistribution: {
    '1': { type: Number, default: 0 },
    '2': { type: Number, default: 0 },
    '3': { type: Number, default: 0 },
    '4': { type: Number, default: 0 },
    '5': { type: Number, default: 0 }
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ createdBy: 1 });
productSchema.index({ code: 1 });
productSchema.index({ sizes: 1 });
productSchema.index({ colors: 1 });

// Índice compuesto para búsquedas
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  tags: 'text' 
});

// Virtual para verificar si hay stock disponible
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual para obtener la imagen principal
productSchema.virtual('primaryImage').get(function() {
  return this.image || null;
});

// Middleware pre-save para generar slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .trim('-'); // Remover guiones al inicio y final
  }
  next();
});

// Middleware pre-save para validar que solo una imagen sea principal
productSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Si hay más de una imagen marcada como principal, marcar solo la primera
      this.images.forEach((img, index) => {
        img.isPrimary = index === 0;
      });
    } else if (primaryImages.length === 0) {
      // Si no hay ninguna imagen marcada como principal, marcar la primera
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Método para verificar disponibilidad de stock
productSchema.methods.checkStock = function(quantity) {
  return this.stock >= quantity;
};

// Método para reducir stock
productSchema.methods.reduceStock = function(quantity) {
  if (this.checkStock(quantity)) {
    this.stock -= quantity;
    return this.save();
  }
  throw new Error('Stock insuficiente');
};

// Método para aumentar stock
productSchema.methods.increaseStock = function(quantity) {
  this.stock += quantity;
  return this.save();
};

// Método estático para buscar productos por texto
productSchema.statics.searchProducts = function(query, options = {}) {
  const searchQuery = {
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  };

  return this.find(searchQuery, null, options);
};

// Método estático para obtener productos por categoría
productSchema.statics.getProductsByCategory = function(category, options = {}) {
  return this.find({ category, isActive: true }, null, options);
};

// Método estático para obtener productos con stock bajo
productSchema.statics.getLowStockProducts = function(threshold = 10) {
  return this.find({ 
    stock: { $lte: threshold }, 
    isActive: true 
  });
};

module.exports = mongoose.model('Product', productSchema);