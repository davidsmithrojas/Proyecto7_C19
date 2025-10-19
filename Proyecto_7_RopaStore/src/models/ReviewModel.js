const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
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
  rating: {
    type: Number,
    required: [true, 'La calificación es requerida'],
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5'],
    validate: {
      validator: Number.isInteger,
      message: 'La calificación debe ser un número entero'
    }
  },
  title: {
    type: String,
    required: [true, 'El título de la reseña es requerido'],
    trim: true,
    minlength: [5, 'El título debe tener al menos 5 caracteres'],
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  comment: {
    type: String,
    required: [true, 'El comentario es requerido'],
    trim: true,
    minlength: [10, 'El comentario debe tener al menos 10 caracteres'],
    maxlength: [1000, 'El comentario no puede exceder 1000 caracteres']
  },
  images: [{
    type: String,
    trim: true
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  helpfulVotes: {
    type: Number,
    default: 0,
    min: [0, 'Los votos útiles no pueden ser negativos']
  },
  notHelpfulVotes: {
    type: Number,
    default: 0,
    min: [0, 'Los votos no útiles no pueden ser negativos']
  },
  response: {
    text: {
      type: String,
      trim: true,
      maxlength: [500, 'La respuesta no puede exceder 500 caracteres']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isReported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Índice compuesto para evitar reseñas duplicadas
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });

// Virtual para calcular el total de votos
reviewSchema.virtual('totalVotes').get(function() {
  return this.helpfulVotes + this.notHelpfulVotes;
});

// Virtual para calcular el porcentaje de votos útiles
reviewSchema.virtual('helpfulPercentage').get(function() {
  if (this.totalVotes === 0) return 0;
  return Math.round((this.helpfulVotes / this.totalVotes) * 100);
});

// Virtual para verificar si la reseña es verificada
reviewSchema.virtual('isVerifiedPurchase').get(function() {
  return this.isVerified && this.order;
});

// Método para votar si una reseña es útil
reviewSchema.methods.voteHelpful = function(userId) {
  // Aquí se podría implementar lógica para evitar votos duplicados
  this.helpfulVotes += 1;
  return this.save();
};

// Método para votar si una reseña no es útil
reviewSchema.methods.voteNotHelpful = function(userId) {
  // Aquí se podría implementar lógica para evitar votos duplicados
  this.notHelpfulVotes += 1;
  return this.save();
};

// Método para reportar una reseña
reviewSchema.methods.reportReview = function(userId, reason) {
  // Verificar si el usuario ya reportó esta reseña
  const alreadyReported = this.reportedBy.some(report => 
    report.user.toString() === userId.toString()
  );
  
  if (alreadyReported) {
    throw new Error('Ya has reportado esta reseña');
  }
  
  this.reportedBy.push({
    user: userId,
    reason,
    reportedAt: new Date()
  });
  
  // Marcar como reportada si tiene más de 3 reportes
  if (this.reportedBy.length >= 3) {
    this.isReported = true;
  }
  
  return this.save();
};

// Método estático para obtener reseñas de un producto
reviewSchema.statics.getProductReviews = function(productId, options = {}) {
  const {
    page = 1,
    limit = 10,
    rating = null,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;

  const query = { 
    product: productId, 
    isApproved: true 
  };
  
  if (rating) {
    query.rating = rating;
  }

  const sort = {};
  sort[sortBy] = sortOrder;

  return this.find(query)
    .populate('user', 'username email')
    .populate('response.respondedBy', 'username')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Método estático para obtener estadísticas de reseñas de un producto
reviewSchema.statics.getProductReviewStats = function(productId) {
  return this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        },
        verifiedReviews: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        verifiedReviews: 1,
        ratingDistribution: {
          '1': { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } },
          '2': { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
          '3': { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
          '4': { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
          '5': { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } }
        }
      }
    }
  ]);
};

// Método estático para obtener reseñas recientes
reviewSchema.statics.getRecentReviews = function(limit = 20) {
  return this.find({ isApproved: true })
    .populate('product', 'name image')
    .populate('user', 'username')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Método estático para obtener reseñas reportadas (solo admin)
reviewSchema.statics.getReportedReviews = function() {
  return this.find({ isReported: true })
    .populate('product', 'name')
    .populate('user', 'username email')
    .populate('reportedBy.user', 'username')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Review', reviewSchema);
