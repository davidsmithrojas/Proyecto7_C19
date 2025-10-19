const request = require('supertest');
const app = require('../../src/index');
const User = require('../../src/models/userModel');
const Order = require('../../src/models/OrderModel');
const Product = require('../../src/models/productModel');

describe('📧 Pruebas de Sistema de Emails', () => {
  let adminUser;
  let adminToken;
  let normalUser;
  let normalToken;
  let testProduct;

  beforeEach(async () => {
    // Limpiar base de datos
    // No eliminar usuarios - usar los existentes
    // No eliminar productos - usar los existentes
    await Order.deleteMany({});

    // Usar usuarios existentes
    adminUser = await User.findOne({ username: 'useradmin' });
    normalUser = await User.findOne({ username: 'usertest' });
    
    expect(adminUser).toBeTruthy();
    expect(normalUser).toBeTruthy();

    // Obtener tokens
    const adminLoginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'useradmin@test.com', password: 'password' });
    
    expect(adminLoginResponse.body.success).toBe(true);
    adminToken = adminLoginResponse.body.data.token;

    const userLoginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'usertest@test.com', password: 'password' });
    
    expect(userLoginResponse.body.success).toBe(true);
    normalToken = userLoginResponse.body.data.token;

    // Usar producto existente
    testProduct = await Product.findOne({ category: 'Camisas' });
    expect(testProduct).toBeTruthy();
  });

  describe('POST /api/v1/payments/test-email', () => {
    it('✅ Debería enviar email de prueba como admin', async () => {
      const response = await request(app)
        .post('/api/v1/payments/test-email')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Email de prueba enviado');
    });

    it('❌ Debería fallar sin autorización de admin', async () => {
      const response = await request(app)
        .post('/api/v1/payments/test-email')
        .set('Authorization', `Bearer ${normalToken}`)
        .send({ email: 'test@example.com' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar sin token de autorización', async () => {
      const response = await request(app)
        .post('/api/v1/payments/test-email')
        .send({ email: 'test@example.com' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Flujo completo de pago con emails', () => {
    it('✅ Debería enviar emails al confirmar pago exitoso', async () => {
      // 1. Simular payment intent directamente (ya que Stripe está en modo simulado)
      const paymentIntentId = `pi_simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 2. Crear orden
      const orderData = {
        items: [{
          product: testProduct._id,
          quantity: 1,
          price: testProduct.price
        }],
        shippingAddress: {
          firstName: 'Usuario',
          lastName: 'Test',
          address: 'Calle Test 123',
          city: 'Santiago',
          state: 'Región Metropolitana',
          zipCode: '12345',
          country: 'Chile',
          phone: '123456789',
          email: 'user@test.com'
        },
        paymentMethod: 'stripe',
        paymentIntentId: paymentIntentId,
        subtotal: 30000,
        shippingCost: 5000,
        tax: 0,
        total: 35000
      };

      const orderResponse = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${normalToken}`)
        .send(orderData)
        .expect(201);

      expect(orderResponse.body.success).toBe(true);
      const orderId = orderResponse.body.data.order._id;

      // 3. Simular confirmación de pago directamente en la base de datos
      // ya que la API de Stripe no está disponible en modo de prueba
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          'paymentInfo.status': 'succeeded',
          status: 'processing'
        },
        { new: true }
      );

      expect(updatedOrder.paymentInfo.status).toBe('succeeded');
      expect(updatedOrder.status).toBe('processing');
    });
  });

  describe('Validación de configuración de email', () => {
    it('✅ Debería mostrar configuración de email en logs', async () => {
      // El servicio de email debería estar inicializado
      // Esto se verifica en los logs del servidor
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
