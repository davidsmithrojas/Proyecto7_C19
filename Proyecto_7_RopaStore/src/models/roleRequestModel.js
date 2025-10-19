const mongoose = require("mongoose");

const roleRequestSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, 'El usuario es requerido']
  },
  requestedRole: { 
    type: String, 
    enum: {
      values: ["superuser"],
      message: 'Solo se puede solicitar el rol de superuser'
    },
    default: "superuser",
    required: [true, 'El rol solicitado es requerido']
  },
  motivation: { 
    type: String,
    required: [true, 'La motivación es requerida'],
    minlength: [10, 'La motivación debe tener al menos 10 caracteres'],
    maxlength: [500, 'La motivación no puede exceder 500 caracteres'],
    trim: true
  },
  status: { 
    type: String, 
    enum: {
      values: ["pending", "approved", "rejected"],
      message: 'El estado debe ser pending, approved o rejected'
    },
    default: "pending" 
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    maxlength: [500, 'Las notas de revisión no pueden exceder 500 caracteres'],
    trim: true
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'La razón de rechazo no puede exceder 500 caracteres'],
    trim: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
roleRequestSchema.index({ user: 1 });
roleRequestSchema.index({ status: 1 });
roleRequestSchema.index({ requestedRole: 1 });
roleRequestSchema.index({ createdAt: -1 });
roleRequestSchema.index({ reviewedBy: 1 });

// Índice compuesto para evitar solicitudes duplicadas
roleRequestSchema.index({ 
  user: 1, 
  requestedRole: 1, 
  status: 1 
}, { 
  unique: true,
  partialFilterExpression: { status: "pending" }
});

// Virtual para verificar si la solicitud está pendiente
roleRequestSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

// Virtual para verificar si la solicitud fue aprobada
roleRequestSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

// Virtual para verificar si la solicitud fue rechazada
roleRequestSchema.virtual('isRejected').get(function() {
  return this.status === 'rejected';
});

// Virtual para obtener el tiempo transcurrido desde la creación
roleRequestSchema.virtual('timeSinceCreated').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Middleware pre-save para validar que no hay solicitudes duplicadas pendientes
roleRequestSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'pending') {
    const existingRequest = await this.constructor.findOne({
      user: this.user,
      requestedRole: this.requestedRole,
      status: 'pending'
    });
    
    if (existingRequest) {
      return next(new Error('Ya tienes una solicitud pendiente para este rol'));
    }
  }
  
  next();
});

// Método para aprobar la solicitud
roleRequestSchema.methods.approve = function(reviewedBy, reviewNotes = '') {
  this.status = 'approved';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.reviewNotes = reviewNotes;
  return this.save();
};

// Método para rechazar la solicitud
roleRequestSchema.methods.reject = function(reviewedBy, rejectionReason = '') {
  this.status = 'rejected';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.rejectionReason = rejectionReason;
  return this.save();
};

// Método estático para obtener solicitudes pendientes
roleRequestSchema.statics.getPendingRequests = function(options = {}) {
  return this.find({ status: 'pending' })
    .populate('user', 'username email role createdAt')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Método estático para obtener solicitudes de un usuario
roleRequestSchema.statics.getUserRequests = function(userId, options = {}) {
  return this.find({ user: userId })
    .populate('reviewedBy', 'username email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);
};

// Método estático para obtener estadísticas de solicitudes
roleRequestSchema.statics.getRequestStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model("RoleRequest", roleRequestSchema);