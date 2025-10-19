const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['customer', 'support', 'admin'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['open', 'waiting', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'billing', 'order', 'product', 'other'],
    default: 'general'
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'El asunto no puede exceder 200 caracteres']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  closedAt: {
    type: Date
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: [1000, 'La resolución no puede exceder 1000 caracteres']
  },
  customerSatisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [500, 'El feedback no puede exceder 500 caracteres']
    },
    ratedAt: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ status: 1 });
chatSchema.index({ assignedTo: 1 });
chatSchema.index({ category: 1 });
chatSchema.index({ priority: 1 });
chatSchema.index({ createdAt: -1 });

// Virtual para obtener el cliente
chatSchema.virtual('customer').get(function() {
  return this.participants.find(p => p.role === 'customer');
});

// Virtual para obtener el soporte asignado
chatSchema.virtual('supportAgent').get(function() {
  return this.participants.find(p => p.role === 'support' || p.role === 'admin');
});

// Virtual para verificar si el chat está activo
chatSchema.virtual('isActiveChat').get(function() {
  return this.isActive && this.status !== 'closed';
});

// Método para agregar participante
chatSchema.methods.addParticipant = function(userId, role) {
  const existingParticipant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      role,
      joinedAt: new Date(),
      lastSeen: new Date()
    });
  }
  
  return this.save();
};

// Método para actualizar último visto
chatSchema.methods.updateLastSeen = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.lastSeen = new Date();
    return this.save();
  }
};

// Método para asignar a un agente de soporte
chatSchema.methods.assignToAgent = function(agentId) {
  this.assignedTo = agentId;
  this.status = 'in_progress';
  return this.save();
};

// Método para cerrar el chat
chatSchema.methods.closeChat = function(userId, resolution = null) {
  this.status = 'closed';
  this.closedAt = new Date();
  this.closedBy = userId;
  this.isActive = false;
  
  if (resolution) {
    this.resolution = resolution;
  }
  
  return this.save();
};

// Método estático para obtener chats activos
chatSchema.statics.getActiveChats = function() {
  return this.find({ 
    isActive: true, 
    status: { $in: ['open', 'waiting', 'in_progress'] } 
  })
  .populate('participants.user', 'username email')
  .populate('assignedTo', 'username email')
  .sort({ updatedAt: -1 });
};

// Método estático para obtener chats de un usuario
chatSchema.statics.getUserChats = function(userId) {
  return this.find({ 
    'participants.user': userId,
    isActive: true
  })
  .populate('participants.user', 'username email')
  .populate('assignedTo', 'username email')
  .sort({ updatedAt: -1 });
};

// Método estático para obtener estadísticas de chat
chatSchema.statics.getChatStats = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $ne: ['$closedAt', null] },
              { $subtract: ['$closedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Chat', chatSchema);
