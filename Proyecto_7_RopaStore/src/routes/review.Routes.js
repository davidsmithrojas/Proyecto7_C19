const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.Controller');
const { auth } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/authRol');
const { generalLimiter, writeLimiter } = require('../middlewares/rateLimiter');

// Middleware de autenticación para todas las rutas
router.use(auth);

// Rutas públicas (requieren autenticación)
router.get('/product/:productId', generalLimiter, reviewController.getProductReviews);
router.get('/recent', generalLimiter, reviewController.getRecentReviews);
router.get('/:id', generalLimiter, reviewController.getReviewById);
router.post('/', writeLimiter, reviewController.createReview);
router.put('/:id', writeLimiter, reviewController.updateReview);
router.delete('/:id', writeLimiter, reviewController.deleteReview);
router.post('/:id/vote-helpful', writeLimiter, reviewController.voteHelpful);
router.post('/:id/vote-not-helpful', writeLimiter, reviewController.voteNotHelpful);
router.post('/:id/report', writeLimiter, reviewController.reportReview);

// Rutas solo para administradores
router.get('/admin/reported', 
  generalLimiter,
  authorizeRoles('admin', 'superuser'), 
  reviewController.getReportedReviews
);

router.post('/:id/respond', 
  writeLimiter,
  authorizeRoles('admin', 'superuser'), 
  reviewController.respondToReview
);

router.put('/:id/moderate', 
  writeLimiter,
  authorizeRoles('admin', 'superuser'), 
  reviewController.moderateReview
);

router.get('/admin/stats', 
  generalLimiter,
  authorizeRoles('admin', 'superuser'), 
  reviewController.getReviewStats
);

module.exports = router;
