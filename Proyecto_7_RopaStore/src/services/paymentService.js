const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY) 
  : null;
const Order = require('../models/OrderModel');
const Product = require('../models/productModel');
const ResponseFactory = require('../utils/response');
const logger = require('../utils/logger');

class PaymentService {
  /**
   * Crear Payment Intent con Stripe
   */
  static async createPaymentIntent(orderData, userId) {
    try {
      const { amount, currency = 'clp', items, metadata = {} } = orderData;

      // Validar monto
      if (!amount || amount <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      // Si Stripe no está configurado, usar modo simulado
      if (!stripe) {
        logger.info('Modo simulado: Payment Intent creado sin Stripe', {
          amount: amount,
          currency: currency,
          userId
        });

        const mockPaymentIntentId = `pi_simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockClientSecret = `pi_simulated_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;

        // Almacenar el Payment Intent simulado para verificación posterior
        if (!PaymentService.simulatedPaymentIntents) {
          PaymentService.simulatedPaymentIntents = new Map();
        }
        PaymentService.simulatedPaymentIntents.set(mockPaymentIntentId, {
          id: mockPaymentIntentId,
          userId: userId.toString(),
          amount: amount,
          currency: currency,
          status: 'requires_payment_method'
        });

        return {
          clientSecret: mockClientSecret,
          paymentIntentId: mockPaymentIntentId,
          amount: amount,
          currency: currency,
          simulated: true
        };
      }

      // Crear Payment Intent en Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe usa centavos
        currency: currency.toLowerCase(),
        metadata: {
          userId: userId.toString(),
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info('Payment Intent creado', {
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency,
        userId
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency
      };
    } catch (error) {
      logger.error('Error al crear Payment Intent:', error);
      throw error;
    }
  }

  /**
   * Confirmar pago con Stripe
   */
  static async confirmPayment(paymentIntentId, paymentMethodId) {
    try {
      // Si Stripe no está configurado, usar modo simulado
      if (!stripe) {
        logger.info('Modo simulado: Pago confirmado sin Stripe', {
          paymentIntentId: paymentIntentId,
          paymentMethodId: paymentMethodId
        });

        // Simular diferentes resultados basados en el número de tarjeta
        let status = 'succeeded';
        if (paymentMethodId && paymentMethodId.includes('4000000000000002')) {
          status = 'requires_payment_method'; // Tarjeta que siempre falla
        } else if (paymentMethodId && paymentMethodId.includes('4000000000009995')) {
          status = 'requires_payment_method'; // Fondos insuficientes
        }

        return {
          status: status,
          paymentIntentId: paymentIntentId,
          amount: 50000, // Monto simulado
          currency: 'clp',
          simulated: true
        };
      }

      // Confirmar el Payment Intent
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      logger.info('Pago confirmado', {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      });

      return {
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convertir de centavos
        currency: paymentIntent.currency
      };
    } catch (error) {
      logger.error('Error al confirmar pago:', error);
      throw error;
    }
  }

  /**
   * Obtener Payment Intent por ID
   */
  static async getPaymentIntent(paymentIntentId) {
    try {
      // Si Stripe no está configurado, usar modo simulado
      if (!stripe) {
        logger.info('Modo simulado: Payment Intent obtenido sin Stripe', {
          paymentIntentId: paymentIntentId
        });

        // Buscar en los Payment Intents simulados
        if (PaymentService.simulatedPaymentIntents && PaymentService.simulatedPaymentIntents.has(paymentIntentId)) {
          const simulatedPI = PaymentService.simulatedPaymentIntents.get(paymentIntentId);
          return {
            id: simulatedPI.id,
            status: simulatedPI.status,
            amount: simulatedPI.amount,
            currency: simulatedPI.currency,
            clientSecret: `pi_simulated_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
            metadata: { userId: simulatedPI.userId },
            simulated: true
          };
        }

        // Si no se encuentra, crear uno genérico
        return {
          id: paymentIntentId,
          status: 'requires_payment_method',
          amount: 50000,
          currency: 'clp',
          clientSecret: `pi_simulated_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
          metadata: { userId: 'simulated_user' },
          simulated: true
        };
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        clientSecret: paymentIntent.client_secret,
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      logger.error('Error al obtener Payment Intent:', error);
      throw error;
    }
  }

  /**
   * Crear reembolso
   */
  static async createRefund(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convertir a centavos
      }

      const refund = await stripe.refunds.create(refundData);

      logger.info('Reembolso creado', {
        refundId: refund.id,
        paymentIntentId: paymentIntentId,
        amount: refund.amount / 100
      });

      return {
        id: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
        currency: refund.currency
      };
    } catch (error) {
      logger.error('Error al crear reembolso:', error);
      throw error;
    }
  }

  /**
   * Obtener métodos de pago del usuario
   */
  static async getPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year
        }
      }));
    } catch (error) {
      logger.error('Error al obtener métodos de pago:', error);
      throw error;
    }
  }

  /**
   * Crear método de pago
   */
  static async createPaymentMethod(paymentMethodData) {
    try {
      const { type, card } = paymentMethodData;

      const paymentMethod = await stripe.paymentMethods.create({
        type: type,
        card: card,
      });

      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year
        }
      };
    } catch (error) {
      logger.error('Error al crear método de pago:', error);
      throw error;
    }
  }

  /**
   * Eliminar método de pago
   */
  static async deletePaymentMethod(paymentMethodId) {
    try {
      await stripe.paymentMethods.detach(paymentMethodId);
      
      logger.info('Método de pago eliminado', { paymentMethodId });
      return { success: true };
    } catch (error) {
      logger.error('Error al eliminar método de pago:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de pagos
   */
  static async getPaymentHistory(userId, limit = 10, startingAfter = null) {
    try {
      const params = {
        limit: limit,
        expand: ['data.payment_intent']
      };

      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      const charges = await stripe.charges.list(params);

      // Filtrar por usuario si es necesario
      const userCharges = charges.data.filter(charge => 
        charge.metadata && charge.metadata.userId === userId.toString()
      );

      return userCharges.map(charge => ({
        id: charge.id,
        amount: charge.amount / 100,
        currency: charge.currency,
        status: charge.status,
        description: charge.description,
        createdAt: new Date(charge.created * 1000),
        paymentIntentId: charge.payment_intent
      }));
    } catch (error) {
      logger.error('Error al obtener historial de pagos:', error);
      throw error;
    }
  }

  /**
   * Obtener tarjetas de prueba de Stripe
   */
  static getTestCards() {
    return [
      {
        number: '4242424242424242',
        description: 'Visa - Pago exitoso',
        cvc: '123',
        expMonth: 12,
        expYear: 2025
      },
      {
        number: '4000000000000002',
        description: 'Visa - Pago rechazado',
        cvc: '123',
        expMonth: 12,
        expYear: 2025
      },
      {
        number: '4000000000009995',
        description: 'Visa - Fondos insuficientes',
        cvc: '123',
        expMonth: 12,
        expYear: 2025
      },
      {
        number: '4000000000009987',
        description: 'Visa - Tarjeta expirada',
        cvc: '123',
        expMonth: 12,
        expYear: 2020
      },
      {
        number: '5555555555554444',
        description: 'Mastercard - Pago exitoso',
        cvc: '123',
        expMonth: 12,
        expYear: 2025
      }
    ];
  }

  /**
   * Verificar webhook de Stripe
   */
  static verifyWebhook(payload, signature) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      logger.error('Error al verificar webhook:', error);
      throw error;
    }
  }
}

module.exports = PaymentService;
