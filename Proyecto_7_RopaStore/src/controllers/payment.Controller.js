const PaymentService = require('../services/paymentService');
const EmailService = require('../services/emailService');
const Order = require('../models/OrderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const ResponseFactory = require('../utils/response');
const { asyncHandler } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

/**
 * Crear Payment Intent
 */
exports.createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency, items, metadata } = req.body;
  const userId = req.user.id;

  // Validar datos requeridos
  if (!amount || amount <= 0) {
    return ResponseFactory.error(res, 'El monto es requerido y debe ser mayor a 0', 400);
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return ResponseFactory.error(res, 'Los items son requeridos', 400);
  }

  // Verificar que los productos existan y tengan stock
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return ResponseFactory.error(res, `Producto con ID ${item.product} no encontrado`, 404);
    }
    if (product.stock < item.quantity) {
      return ResponseFactory.error(res, `Stock insuficiente para el producto ${product.name}`, 400);
    }
  }

  const paymentData = {
    amount,
    currency: currency || 'clp',
    items,
    metadata: {
      ...metadata,
      orderType: 'ecommerce'
    }
  };

  const result = await PaymentService.createPaymentIntent(paymentData, userId);
  
  ResponseFactory.success(res, result, 'Payment Intent creado exitosamente');
});

/**
 * Confirmar pago
 */
exports.confirmPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId, paymentMethodId } = req.body;
  const userId = req.user.id;

  if (!paymentIntentId) {
    return ResponseFactory.error(res, 'Payment Intent ID es requerido', 400);
  }

  // Verificar que el Payment Intent pertenece al usuario
  const paymentIntent = await PaymentService.getPaymentIntent(paymentIntentId);
  if (paymentIntent.metadata.userId !== userId.toString()) {
    return ResponseFactory.error(res, 'No autorizado para confirmar este pago', 403);
  }

  const result = await PaymentService.confirmPayment(paymentIntentId, paymentMethodId);
  
  // Si el pago es exitoso, actualizar el estado del pedido si existe
  if (result.status === 'succeeded') {
    const updatedOrder = await Order.findOneAndUpdate(
      { 
        $or: [
          { 'paymentInfo.stripePaymentIntentId': paymentIntentId },
          { 'paymentInfo.paymentIntentId': paymentIntentId }
        ]
      },
      { 
        'paymentInfo.status': 'succeeded',
        status: 'processing'
      },
      { new: true }
    ).populate('user', 'username email');

    // Enviar emails de confirmación si el pedido existe
    if (updatedOrder) {
      try {
        // Enviar email al usuario
        const userEmailResult = await EmailService.sendOrderConfirmationToUser(updatedOrder, updatedOrder.user);
        if (userEmailResult.success) {
          logger.info('Email de confirmación enviado al usuario', {
            orderId: updatedOrder._id,
            userEmail: updatedOrder.user.email
          });
        }

        // Enviar notificación al administrador
        const adminEmailResult = await EmailService.sendOrderNotificationToAdmin(updatedOrder, updatedOrder.user);
        if (adminEmailResult.success) {
          logger.info('Notificación de compra enviada al administrador', {
            orderId: updatedOrder._id
          });
        }
      } catch (emailError) {
        logger.error('Error al enviar emails de confirmación:', emailError);
        // No fallar la transacción por errores de email
      }
    }
  }

  ResponseFactory.success(res, result, 'Pago confirmado exitosamente');
});

/**
 * Obtener Payment Intent por ID
 */
exports.getPaymentIntent = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.params;
  const userId = req.user.id;

  const paymentIntent = await PaymentService.getPaymentIntent(paymentIntentId);
  
  // Verificar que el Payment Intent pertenece al usuario
  if (paymentIntent.metadata.userId !== userId.toString()) {
    return ResponseFactory.error(res, 'No autorizado para ver este pago', 403);
  }

  ResponseFactory.success(res, paymentIntent, 'Payment Intent obtenido exitosamente');
});

/**
 * Obtener métodos de pago
 */
exports.getPaymentMethods = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // En un sistema real, aquí se obtendría el customer ID de Stripe del usuario
  // Por simplicidad, usamos el userId como customer ID
  const customerId = `customer_${userId}`;
  
  const paymentMethods = await PaymentService.getPaymentMethods(customerId);
  
  ResponseFactory.success(res, { paymentMethods }, 'Métodos de pago obtenidos exitosamente');
});

/**
 * Crear método de pago
 */
exports.createPaymentMethod = asyncHandler(async (req, res) => {
  const { type, card } = req.body;
  const userId = req.user.id;

  if (!type || !card) {
    return ResponseFactory.error(res, 'Tipo y datos de tarjeta son requeridos', 400);
  }

  const paymentMethod = await PaymentService.createPaymentMethod({ type, card });
  
  ResponseFactory.created(res, paymentMethod, 'Método de pago creado exitosamente');
});

/**
 * Eliminar método de pago
 */
exports.deletePaymentMethod = asyncHandler(async (req, res) => {
  const { paymentMethodId } = req.params;
  const userId = req.user.id;

  // Verificar que el método de pago pertenece al usuario
  // En un sistema real, aquí se verificaría la propiedad del método de pago
  
  await PaymentService.deletePaymentMethod(paymentMethodId);
  
  ResponseFactory.success(res, null, 'Método de pago eliminado exitosamente');
});

/**
 * Obtener historial de pagos
 */
exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 10, startingAfter } = req.query;

  const payments = await PaymentService.getPaymentHistory(
    userId, 
    parseInt(limit), 
    startingAfter
  );
  
  ResponseFactory.success(res, { payments }, 'Historial de pagos obtenido exitosamente');
});

/**
 * Crear reembolso (solo admin)
 */
exports.createRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { amount } = req.body;
  const userId = req.user.id;

  // Verificar que el usuario es admin
  if (req.user.role !== 'admin') {
    return ResponseFactory.error(res, 'Solo los administradores pueden crear reembolsos', 403);
  }

  const refund = await PaymentService.createRefund(paymentId, amount);
  
  // Actualizar el estado del pedido
  await Order.findOneAndUpdate(
    { 'paymentInfo.stripePaymentIntentId': paymentId },
    { 
      'paymentInfo.status': 'refunded',
      status: 'cancelled'
    }
  );

  ResponseFactory.success(res, refund, 'Reembolso creado exitosamente');
});

/**
 * Obtener tarjetas de prueba
 */
exports.getTestCards = asyncHandler(async (req, res) => {
  const testCards = PaymentService.getTestCards();
  
  ResponseFactory.success(res, { cards: testCards }, 'Tarjetas de prueba obtenidas exitosamente');
});

/**
 * Webhook de Stripe
 */
exports.handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const payload = req.body;

  try {
    const event = PaymentService.verifyWebhook(payload, signature);
    
    logger.info('Webhook de Stripe recibido', { type: event.type, id: event.id });

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
      default:
        logger.info('Evento de webhook no manejado', { type: event.type });
    }

    ResponseFactory.success(res, { received: true }, 'Webhook procesado exitosamente');
  } catch (error) {
    logger.error('Error al procesar webhook:', error);
    ResponseFactory.error(res, 'Error al procesar webhook', 400);
  }
});

// Funciones auxiliares para webhooks
async function handlePaymentSucceeded(paymentIntent) {
  try {
    await Order.findOneAndUpdate(
      { 'paymentInfo.stripePaymentIntentId': paymentIntent.id },
      { 
        'paymentInfo.status': 'succeeded',
        status: 'processing'
      }
    );
    logger.info('Pedido actualizado por pago exitoso', { paymentIntentId: paymentIntent.id });
  } catch (error) {
    logger.error('Error al actualizar pedido por pago exitoso:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  try {
    await Order.findOneAndUpdate(
      { 'paymentInfo.stripePaymentIntentId': paymentIntent.id },
      { 
        'paymentInfo.status': 'failed',
        status: 'cancelled'
      }
    );
    logger.info('Pedido actualizado por pago fallido', { paymentIntentId: paymentIntent.id });
  } catch (error) {
    logger.error('Error al actualizar pedido por pago fallido:', error);
  }
}

async function handlePaymentCanceled(paymentIntent) {
  try {
    await Order.findOneAndUpdate(
      { 'paymentInfo.stripePaymentIntentId': paymentIntent.id },
      { 
        'paymentInfo.status': 'cancelled',
        status: 'cancelled'
      }
    );
    logger.info('Pedido actualizado por pago cancelado', { paymentIntentId: paymentIntent.id });
  } catch (error) {
    logger.error('Error al actualizar pedido por pago cancelado:', error);
  }
}
