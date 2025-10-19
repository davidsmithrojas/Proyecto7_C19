const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'El mensaje es requerido'],
    trim: true,
    maxlength: [2000, 'El mensaje no puede exceder 2000 caracteres']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'auto_reply'],
    default: 'text'
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
chatMessageSchema.index({ chat: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });
chatMessageSchema.index({ isRead: 1 });
chatMessageSchema.index({ messageType: 1 });

// Virtual para verificar si el mensaje es del sistema
chatMessageSchema.virtual('isSystemMessage').get(function() {
  return this.messageType === 'system' || this.messageType === 'auto_reply';
});

// Virtual para obtener el número de lectores
chatMessageSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// Método para marcar como leído
chatMessageSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(reader => 
    reader.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    this.isRead = true;
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Método para editar mensaje
chatMessageSchema.methods.editMessage = function(newMessage) {
  this.message = newMessage;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Método estático para obtener mensajes de un chat
chatMessageSchema.statics.getChatMessages = function(chatId, options = {}) {
  const {
    page = 1,
    limit = 50,
    before = null,
    after = null
  } = options;

  const query = { chat: chatId };
  
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  
  if (after) {
    query.createdAt = { $gt: new Date(after) };
  }

  return this.find(query)
    .populate('sender', 'username email')
    .populate('replyTo', 'message sender')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Método estático para obtener mensajes no leídos de un usuario
chatMessageSchema.statics.getUnreadMessages = function(userId) {
  return this.find({
    'readBy.user': { $ne: userId },
    sender: { $ne: userId }
  })
  .populate('chat', 'participants')
  .populate('sender', 'username email')
  .sort({ createdAt: -1 });
};

// Método estático para marcar mensajes como leídos
chatMessageSchema.statics.markMessagesAsRead = function(chatId, userId) {
  return this.updateMany(
    { 
      chat: chatId,
      'readBy.user': { $ne: userId },
      sender: { $ne: userId }
    },
    { 
      $push: { 
        readBy: { 
          user: userId, 
          readAt: new Date() 
        } 
      },
      $set: { isRead: true }
    }
  );
};

// Método estático para obtener estadísticas de mensajes
chatMessageSchema.statics.getMessageStats = function(chatId = null, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const matchQuery = { createdAt: { $gte: startDate } };
  if (chatId) {
    matchQuery.chat = chatId;
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$messageType',
        count: { $sum: 1 },
        avgLength: { $avg: { $strLenCP: '$message' } }
      }
    }
  ]);
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
