const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true,
      minlength: [1, 'El título es requerido'],
      maxlength: [100, 'El título no puede exceder 100 caracteres']
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
      minlength: [1, 'La descripción es requerida'],
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
    },
    organizer: {
      type: String,
      required: [true, 'El organizador es requerido'],
      trim: true,
      minlength: [1, 'El organizador es requerido'],
      maxlength: [100, 'El organizador no puede exceder 100 caracteres']
    },
    location: {
      type: String,
      required: [true, 'La ubicación es requerida'],
      trim: true,
      minlength: [1, 'La ubicación es requerida'],
      maxlength: [200, 'La ubicación no puede exceder 200 caracteres']
    },
    startDate: {
      type: Date,
      required: [true, 'La fecha de inicio es requerida'],
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: 'La fecha de inicio debe ser futura'
      }
    },
    endDate: {
      type: Date,
      required: [true, 'La fecha de fin es requerida'],
      validate: {
        validator: function(value) {
          return value > this.startDate;
        },
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      }
    },
    startTime: {
      type: String,
      required: [true, 'El horario de inicio es requerido'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'El horario de inicio debe estar en formato HH:mm']
    },
    endTime: {
      type: String,
      required: [true, 'El horario de fin es requerido'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'El horario de fin debe estar en formato HH:mm']
    },
    requiresRegistration: {
      type: Boolean,
      default: false
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'El precio no puede ser negativo'],
      set: function(value) {
        return Math.round(value * 100) / 100; // Redondear a 2 decimales
      }
    },
    capacity: {
      type: Number,
      default: null,
      min: [1, 'La capacidad debe ser mayor a 0'],
      validate: {
        validator: function(value) {
          return value === null || Number.isInteger(value);
        },
        message: 'La capacidad debe ser un número entero o null'
      }
    },
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
    },
    isActive: {
      type: Boolean,
      default: true
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
    registrations: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      registeredAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
      }
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices para optimizar consultas
eventSchema.index({ title: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ endDate: 1 });
eventSchema.index({ isActive: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ slug: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ createdAt: -1 });

// Índice compuesto para búsquedas
eventSchema.index({ 
  title: 'text', 
  description: 'text', 
  organizer: 'text',
  location: 'text',
  tags: 'text' 
});

// Índice compuesto para eventos activos por fecha
eventSchema.index({ isActive: 1, startDate: 1 });

// Virtual para verificar si el evento está en curso
eventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  const startDateTime = new Date(`${this.startDate.toDateString()} ${this.startTime}`);
  const endDateTime = new Date(`${this.endDate.toDateString()} ${this.endTime}`);
  return now >= startDateTime && now <= endDateTime;
});

// Virtual para verificar si el evento ha terminado
eventSchema.virtual('isFinished').get(function() {
  const now = new Date();
  const endDateTime = new Date(`${this.endDate.toDateString()} ${this.endTime}`);
  return now > endDateTime;
});

// Virtual para verificar si el evento es gratuito
eventSchema.virtual('isFree').get(function() {
  return this.price === 0;
});

// Virtual para obtener el número de registros
eventSchema.virtual('registrationCount').get(function() {
  return this.registrations.filter(reg => reg.status !== 'cancelled').length;
});

// Virtual para verificar si hay cupos disponibles
eventSchema.virtual('hasAvailableSpots').get(function() {
  if (this.capacity === null) return true;
  return this.registrationCount < this.capacity;
});

// Virtual para obtener la imagen principal
eventSchema.virtual('primaryImage').get(function() {
  const primaryImage = this.images.find(img => img.isPrimary);
  return primaryImage || this.images[0] || null;
});

// Middleware pre-save para generar slug
eventSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .trim('-'); // Remover guiones al inicio y final
  }
  next();
});

// Middleware pre-save para validar que solo una imagen sea principal
eventSchema.pre('save', function(next) {
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

// Método para registrar un usuario en el evento
eventSchema.methods.registerUser = function(userId) {
  // Verificar si ya está registrado
  const existingRegistration = this.registrations.find(reg => 
    reg.user.toString() === userId.toString() && reg.status !== 'cancelled'
  );
  
  if (existingRegistration) {
    throw new Error('Usuario ya registrado en este evento');
  }
  
  // Verificar capacidad
  if (this.capacity && this.registrationCount >= this.capacity) {
    throw new Error('No hay cupos disponibles para este evento');
  }
  
  // Agregar registro
  this.registrations.push({
    user: userId,
    status: 'pending'
  });
  
  return this.save();
};

// Método para cancelar registro de un usuario
eventSchema.methods.cancelRegistration = function(userId) {
  const registration = this.registrations.find(reg => 
    reg.user.toString() === userId.toString() && reg.status !== 'cancelled'
  );
  
  if (!registration) {
    throw new Error('Usuario no registrado en este evento');
  }
  
  registration.status = 'cancelled';
  return this.save();
};

// Método estático para buscar eventos por texto
eventSchema.statics.searchEvents = function(query, options = {}) {
  const searchQuery = {
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { organizer: { $regex: query, $options: 'i' } },
          { location: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  };

  return this.find(searchQuery, null, options);
};

// Método estático para obtener eventos próximos
eventSchema.statics.getUpcomingEvents = function(limit = 10) {
  return this.find({
    isActive: true,
    startDate: { $gte: new Date() }
  })
  .sort({ startDate: 1 })
  .limit(limit);
};

// Método estático para obtener eventos por rango de fechas
eventSchema.statics.getEventsByDateRange = function(startDate, endDate) {
  return this.find({
    isActive: true,
    startDate: { $gte: startDate },
    endDate: { $lte: endDate }
  }).sort({ startDate: 1 });
};

module.exports = mongoose.model("Event", eventSchema);
