const ReviewService = require('../services/reviewService');
const ResponseFactory = require('../utils/response');
const { asyncHandler } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

/**
 * Crear nueva reseña
 */
exports.createReview = asyncHandler(async (req, res) => {
  const reviewData = req.body;
  const userId = req.user.id;

  const result = await ReviewService.createReview(reviewData, userId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 400);
  }

  ResponseFactory.success(res, result, 'Reseña creada exitosamente', 201);
});

/**
 * Obtener reseñas de un producto
 */
exports.getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, rating, sortBy = 'createdAt', sortOrder = -1 } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    rating: rating ? parseInt(rating) : null,
    sortBy,
    sortOrder: parseInt(sortOrder)
  };

  const result = await ReviewService.getProductReviews(productId, options);
  
  ResponseFactory.success(res, result, 'Reseñas obtenidas exitosamente');
});

/**
 * Obtener reseña por ID
 */
exports.getReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await ReviewService.getReviewById(id);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Reseña obtenida exitosamente');
});

/**
 * Actualizar reseña
 */
exports.updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const userId = req.user.id;

  const result = await ReviewService.updateReview(id, updateData, userId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Reseña actualizada exitosamente');
});

/**
 * Eliminar reseña
 */
exports.deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await ReviewService.deleteReview(id, userId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Reseña eliminada exitosamente');
});

/**
 * Votar si una reseña es útil
 */
exports.voteHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await ReviewService.voteHelpful(id, userId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Voto registrado exitosamente');
});

/**
 * Votar si una reseña no es útil
 */
exports.voteNotHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await ReviewService.voteNotHelpful(id, userId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Voto registrado exitosamente');
});

/**
 * Reportar una reseña
 */
exports.reportReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;

  if (!reason) {
    return ResponseFactory.error(res, 'La razón del reporte es requerida', 400);
  }

  const result = await ReviewService.reportReview(id, userId, reason);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 400);
  }

  ResponseFactory.success(res, result, 'Reseña reportada exitosamente');
});

/**
 * Obtener reseñas recientes
 */
exports.getRecentReviews = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const result = await ReviewService.getRecentReviews(parseInt(limit));
  
  ResponseFactory.success(res, result, 'Reseñas recientes obtenidas exitosamente');
});

/**
 * Obtener reseñas reportadas (solo admin)
 */
exports.getReportedReviews = asyncHandler(async (req, res) => {
  const result = await ReviewService.getReportedReviews();
  
  ResponseFactory.success(res, result, 'Reseñas reportadas obtenidas exitosamente');
});

/**
 * Responder a una reseña (solo admin)
 */
exports.respondToReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { response } = req.body;
  const adminId = req.user.id;

  if (!response) {
    return ResponseFactory.error(res, 'La respuesta es requerida', 400);
  }

  const result = await ReviewService.respondToReview(id, response, adminId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Respuesta agregada exitosamente');
});

/**
 * Moderar reseña (solo admin)
 */
exports.moderateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isApproved } = req.body;
  const adminId = req.user.id;

  if (typeof isApproved !== 'boolean') {
    return ResponseFactory.error(res, 'El estado de aprobación debe ser true o false', 400);
  }

  const result = await ReviewService.moderateReview(id, isApproved, adminId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Reseña moderada exitosamente');
});

/**
 * Obtener estadísticas de reseñas (solo admin)
 */
exports.getReviewStats = asyncHandler(async (req, res) => {
  const { productId, days = 30 } = req.query;

  let result;
  if (productId) {
    result = await ReviewService.getProductReviews(productId, {});
  } else {
    // Estadísticas generales
    result = await ReviewService.getRecentReviews(1000);
  }
  
  ResponseFactory.success(res, result, 'Estadísticas de reseñas obtenidas exitosamente');
});
