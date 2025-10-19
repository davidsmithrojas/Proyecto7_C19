const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/authRol');
const { generalLimiter, writeLimiter } = require('../middlewares/rateLimiter');
const validation = require('../middlewares/validation');
const ResponseFactory = require('../utils/response');
const paymentRouter = express.Router();

// Importar controladores
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentIntent,
  getPaymentMethods,
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentHistory,
  createRefund,
  getTestCards,
  handleWebhook
} = require('../controllers/payment.Controller');

// Rutas públicas (sin autenticación)
paymentRouter.get('/test-cards',
  generalLimiter,
  getTestCards
);

// Middleware de autenticación para rutas que lo requieren
paymentRouter.use((req, res, next) => {
  if (req.path === '/webhook' || req.path === '/test-cards') {
    return next();
  }
  return auth(req, res, next);
});

// Webhook de Stripe (sin autenticación)
paymentRouter.post('/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Rutas que requieren autenticación
paymentRouter.post('/create-intent',
  writeLimiter,
  createPaymentIntent
);

paymentRouter.post('/confirm',
  writeLimiter,
  confirmPayment
);

paymentRouter.get('/intent/:paymentIntentId',
  generalLimiter,
  getPaymentIntent
);

paymentRouter.get('/methods',
  generalLimiter,
  getPaymentMethods
);

paymentRouter.post('/methods',
  writeLimiter,
  createPaymentMethod
);

paymentRouter.delete('/methods/:paymentMethodId',
  writeLimiter,
  deletePaymentMethod
);

paymentRouter.get('/history',
  generalLimiter,
  getPaymentHistory
);

// Rutas de administrador
paymentRouter.post('/:paymentId/refund',
  writeLimiter,
  requireAdmin,
  createRefund
);

// Ruta para probar emails (solo desarrollo y test)
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  paymentRouter.post('/test-email',
    writeLimiter,
    requireAdmin,
    async (req, res) => {
      try {
        const EmailService = require('../services/emailService');
        
        // Datos de prueba
        const testOrder = {
          _id: 'test_order_123',
          createdAt: new Date(),
          items: [
            {
              product: { name: 'Producto de Prueba' },
              quantity: 2,
              price: 25000
            }
          ],
          subtotal: 50000,
          shippingCost: 5000,
          tax: 9500,
          total: 64500,
          shippingAddress: {
            street: 'Calle Test 123',
            city: 'Santiago',
            state: 'Región Metropolitana',
            zipCode: '12345',
            country: 'Chile'
          },
          paymentInfo: {
            method: 'stripe',
            status: 'succeeded'
          }
        };

        const testUser = {
          username: 'usuario_prueba',
          email: req.body.email || 'test@example.com'
        };

        // Enviar email de prueba
        const result = await EmailService.sendOrderConfirmationToUser(testOrder, testUser);
        
        ResponseFactory.success(res, result, 'Email de prueba enviado');
      } catch (error) {
        ResponseFactory.error(res, 'Error al enviar email de prueba', 500);
      }
    }
  );
}

module.exports = paymentRouter;
