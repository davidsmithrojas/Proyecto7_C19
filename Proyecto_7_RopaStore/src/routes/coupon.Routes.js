const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.Controller');
const { auth } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/authRol');
const { generalLimiter, writeLimiter } = require('../middlewares/rateLimiter');

// Middleware de autenticación para todas las rutas
router.use(auth);

// Rutas públicas (requieren autenticación)
router.get('/valid', generalLimiter, couponController.getValidCouponsForUser);
router.get('/code/:code', generalLimiter, couponController.getCouponByCode);
router.post('/validate', writeLimiter, couponController.validateCoupon);
router.post('/apply', writeLimiter, couponController.applyCouponToOrder);

// Rutas para administradores
router.post('/', 
  writeLimiter,
  authorizeRoles('admin', 'superuser'), 
  couponController.createCoupon
);

router.get('/', 
  generalLimiter,
  authorizeRoles('admin', 'superuser'), 
  couponController.getAllCoupons
);

router.get('/stats', 
  generalLimiter,
  authorizeRoles('admin', 'superuser'), 
  couponController.getCouponStats
);

router.get('/:id', 
  generalLimiter,
  authorizeRoles('admin', 'superuser'), 
  couponController.getCouponById
);

router.put('/:id', 
  writeLimiter,
  authorizeRoles('admin', 'superuser'), 
  couponController.updateCoupon
);

router.delete('/:id', 
  writeLimiter,
  authorizeRoles('admin', 'superuser'), 
  couponController.deleteCoupon
);

router.get('/:couponId/usage-history', 
  generalLimiter,
  authorizeRoles('admin', 'superuser'), 
  couponController.getCouponUsageHistory
);

module.exports = router;
