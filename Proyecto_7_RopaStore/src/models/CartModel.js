const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: { 
      type: Number, 
      required: true, 
      min: [1, 'La cantidad debe ser mayor a 0'],
      validate: {
        validator: Number.isInteger,
        message: 'La cantidad debe ser un número entero'
      }
    },
    price: { 
      type: Number, 
      required: true,
      min: [0, 'El precio no puede ser negativo'],
      set: function(value) {
        return Math.round(value * 100) / 100; // Redondear a 2 decimales
      }
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
cartSchema.index({ user: 1 });
cartSchema.index({ isActive: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual para calcular el total del carrito
cartSchema.virtual('total').get(function() {
  return this.products.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

// Virtual para calcular el número total de productos
cartSchema.virtual('totalItems').get(function() {
  return this.products.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
});

// Virtual para verificar si el carrito está vacío
cartSchema.virtual('isEmpty').get(function() {
  return this.products.length === 0;
});

// Middleware pre-save para validar que el producto existe y está activo
cartSchema.pre('save', async function(next) {
  try {
    if (this.isModified('products')) {
      const Product = mongoose.model('Product');
      
      for (const item of this.products) {
        const product = await Product.findById(item.product);
        
        if (!product) {
          return next(new Error(`Producto con ID ${item.product} no encontrado`));
        }
        
        if (!product.isActive) {
          return next(new Error(`Producto ${product.name} no está disponible`));
        }
        
        if (product.stock < item.quantity) {
          return next(new Error(`Stock insuficiente para el producto ${product.name}`));
        }
        
        // Actualizar precio del producto en el carrito
        item.price = product.price;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Método para agregar producto al carrito
cartSchema.methods.addProduct = async function(productId, quantity = 1) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  
  const existingItem = this.products.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.products.push({
      product: productId,
      quantity: quantity,
      price: product.price
    });
  }
  
  return this.save();
};

// Método para actualizar cantidad de un producto
cartSchema.methods.updateProductQuantity = async function(productId, quantity) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  
  const item = this.products.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (!item) {
    throw new Error('Producto no encontrado en el carrito');
  }
  
  if (quantity <= 0) {
    return this.removeProduct(productId);
  }
  
  item.quantity = quantity;
  item.price = product.price; // Actualizar precio
  return this.save();
};

// Método para remover producto del carrito
cartSchema.methods.removeProduct = function(productId) {
  const originalProducts = [...this.products];
  this.products = this.products.filter(item => 
    item.product.toString() !== productId.toString()
  );
  
  // Solo guardar si realmente se removió algo
  if (originalProducts.length !== this.products.length) {
    return this.save();
  }
  
  // Si no se removió nada, devolver la promesa resuelta
  return Promise.resolve(this);
};

// Método para limpiar el carrito
cartSchema.methods.clear = function() {
  this.products = [];
  return this.save();
};

// Método para verificar disponibilidad de stock
cartSchema.methods.checkStockAvailability = async function() {
  const Product = mongoose.model('Product');
  const unavailableItems = [];
  
  for (const item of this.products) {
    const product = await Product.findById(item.product);
    
    if (!product || !product.isActive) {
      unavailableItems.push({
        productId: item.product,
        name: product?.name || 'Producto no encontrado',
        reason: !product ? 'Producto no encontrado' : 'Producto no disponible'
      });
    } else if (product.stock < item.quantity) {
      unavailableItems.push({
        productId: item.product,
        name: product.name,
        reason: 'Stock insuficiente',
        availableStock: product.stock,
        requestedQuantity: item.quantity
      });
    }
  }
  
  return unavailableItems;
};

// Método estático para obtener carrito de un usuario
cartSchema.statics.getUserCart = function(userId) {
  return this.findOne({ user: userId, isActive: true });
};

// Método estático para crear carrito para un usuario
cartSchema.statics.createUserCart = function(userId) {
  return this.create({ user: userId });
};

module.exports = mongoose.model("Cart", cartSchema);
