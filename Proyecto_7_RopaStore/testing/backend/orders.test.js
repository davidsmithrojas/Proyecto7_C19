const request = require('supertest');
const app = require('../../src/index');
const Order = require('../../src/models/OrderModel');
const Product = require('../../src/models/productModel');
const User = require('../../src/models/userModel');

describe('📦 Pruebas de Órdenes', () => {
  let user;
  let userToken;
  let adminUser;
  let adminToken;
  let product1;
  let product2;

  beforeEach(async () => {
    // Limpiar solo órdenes
    await Order.deleteMany({});

    // Usar usuarios existentes
    user = await User.findOne({ username: 'usertest' });
    adminUser = await User.findOne({ username: 'useradmin' });
    
    expect(user).toBeTruthy();
    expect(adminUser).toBeTruthy();

    // Obtener tokens
    const userLogin = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'usertest@test.com', password: 'password' });
    
    if (userLogin.body.success && userLogin.body.data && userLogin.body.data.token) {
      userToken = userLogin.body.data.token;
    } else {
      throw new Error('No se pudo obtener token de usuario: ' + JSON.stringify(userLogin.body));
    }

    const adminLogin = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'useradmin@test.com', password: 'password' });
    
    if (adminLogin.body.success && adminLogin.body.data && adminLogin.body.data.token) {
      adminToken = adminLogin.body.data.token;
    } else {
      throw new Error('No se pudo obtener token de admin: ' + JSON.stringify(adminLogin.body));
    }

    // Usar productos existentes que estén activos y tengan stock
    product1 = await Product.findOne({ category: 'Camisas', isActive: true, stock: { $gt: 0 } });
    product2 = await Product.findOne({ category: 'Pantalones', isActive: true, stock: { $gt: 0 } });
    
    
    expect(product1).toBeTruthy();
    expect(product2).toBeTruthy();
  });

  describe('POST /api/v1/orders', () => {
    it('✅ Debería crear una orden exitosamente', async () => {
      const orderData = {
        items: [
          {
            product: product1._id,
            quantity: 2,
            price: product1.price
          },
          {
            product: product2._id,
            quantity: 1,
            price: product2.price
          }
        ],
        shippingAddress: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com',
          phone: '+56912345678',
          address: 'Calle Test 123, Depto 45',
          city: 'Santiago',
          state: 'Región Metropolitana',
          zipCode: '12345',
          country: 'Chile'
        },
        paymentMethod: 'stripe'
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('pending');
      expect(response.body.data.order.items).toHaveLength(2);
    });

    it('❌ Debería fallar sin autorización', async () => {
      const orderData = {
        items: [{ 
          product: product1._id, 
          quantity: 1, 
          price: product1.price,
          total: product1.price
        }],
        shippingAddress: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com',
          phone: '+56912345678',
          address: 'Calle Test 123',
          city: 'Santiago',
          state: 'RM',
          zipCode: '12345',
          country: 'Chile'
        },
        paymentInfo: {
          method: 'stripe',
          status: 'pending',
          amount: product1.price,
          currency: 'clp'
        },
        orderNumber: 'ORD-TEST-002',
        subtotal: product1.price,
        total: product1.price
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(orderData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar con carrito vacío', async () => {
      const orderData = {
        items: [],
        shippingAddress: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com',
          phone: '+56912345678',
          address: 'Calle Test 123',
          city: 'Santiago',
          state: 'RM',
          zipCode: '12345',
          country: 'Chile'
        },
        paymentInfo: {
          method: 'stripe',
          status: 'pending',
          amount: 0,
          currency: 'clp'
        },
        subtotal: 0,
        total: 0
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar con producto inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const orderData = {
        items: [
          {
            product: fakeId,
            quantity: 1,
            price: 29990,
            total: 29990
          }
        ],
        shippingAddress: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com',
          phone: '+56912345678',
          address: 'Calle Test 123',
          city: 'Santiago',
          state: 'RM',
          zipCode: '12345',
          country: 'Chile'
        },
        paymentInfo: {
          method: 'stripe',
          status: 'pending',
          amount: 29990,
          currency: 'clp'
        },
        subtotal: 29990,
        total: 29990
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/orders', () => {
    let testOrder;

    beforeEach(async () => {
      // Crear orden de prueba
      testOrder = new Order({
        user: user._id,
        orderNumber: 'ORD-TEST-001',
        items: [
          {
            product: product1._id,
            quantity: 2,
            price: product1.price,
            total: product1.price * 2
          }
        ],
        status: 'pending',
        subtotal: product1.price * 2,
        shippingCost: 0,
        tax: 0,
        total: product1.price * 2,
        shippingAddress: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com',
          phone: '+56912345678',
          address: 'Calle Test 123',
          city: 'Santiago',
          state: 'RM',
          zipCode: '12345',
          country: 'Chile'
        },
        paymentInfo: {
          method: 'stripe',
          status: 'pending',
          amount: product1.price * 2,
          currency: 'clp'
        }
      });
      await testOrder.save();
    });

    it('✅ Debería obtener órdenes del usuario', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeInstanceOf(Array);
      expect(response.body.data.orders.length).toBeGreaterThan(0);
    });

    it('✅ Debería filtrar órdenes por estado', async () => {
      const response = await request(app)
        .get('/api/v1/orders?status=pending')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders.every(o => o.status === 'pending')).toBe(true);
    });

    it('❌ Debería fallar sin autorización', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    let testOrder;

    beforeEach(async () => {
      testOrder = new Order({
        user: user._id,
        orderNumber: 'ORD-TEST-002',
        items: [
          {
            product: product1._id,
            quantity: 1,
            price: product1.price,
            total: product1.price
          }
        ],
        status: 'pending',
        subtotal: product1.price,
        shippingCost: 0,
        tax: 0,
        total: product1.price,
        shippingAddress: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com',
          phone: '+56912345678',
          address: 'Calle Test 123',
          city: 'Santiago',
          state: 'RM',
          zipCode: '12345',
          country: 'Chile'
        },
        paymentInfo: {
          method: 'stripe',
          status: 'pending',
          amount: product1.price,
          currency: 'clp'
        }
      });
      await testOrder.save();
    });

    it('✅ Debería obtener orden por ID', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order._id).toBe(testOrder._id.toString());
    });

    it('❌ Debería fallar con ID de orden inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/orders/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar accediendo a orden de otro usuario', async () => {
      // Crear otro usuario con username único
      const timestamp = Date.now().toString().slice(-6);
      const otherUser = new User({
        username: `otheruser${timestamp}`,
        email: `other${timestamp}@example.com`,
        password: 'Other123!',
        role: 'user',
        isActive: true
      });
      await otherUser.save();

      const otherLogin = await request(app)
        .post('/api/v1/users/login')
        .send({ email: `other${timestamp}@example.com`, password: 'Other123!' });
      const otherToken = otherLogin.body.data.token;

      const response = await request(app)
        .get(`/api/v1/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/orders/:id/status', () => {
    let testOrder;

    beforeEach(async () => {
      testOrder = new Order({
        user: user._id,
        orderNumber: 'ORD-TEST-002',
        items: [
          {
            product: product1._id,
            quantity: 1,
            price: product1.price,
            total: product1.price
          }
        ],
        status: 'pending',
        subtotal: product1.price,
        shippingCost: 0,
        tax: 0,
        total: product1.price,
        shippingAddress: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com',
          phone: '+56912345678',
          address: 'Calle Test 123',
          city: 'Santiago',
          state: 'RM',
          zipCode: '12345',
          country: 'Chile'
        },
        paymentInfo: {
          method: 'stripe',
          status: 'pending',
          amount: product1.price,
          currency: 'clp'
        }
      });
      await testOrder.save();
    });

    it('✅ Debería actualizar estado de orden (admin)', async () => {
      const updateData = { status: 'processing' };

      const response = await request(app)
        .put(`/api/v1/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('processing');
    });

    it('❌ Debería fallar sin autorización de admin', async () => {
      const updateData = { status: 'processing' };

      const response = await request(app)
        .put(`/api/v1/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar con estado inválido', async () => {
      const updateData = { status: 'invalid-status' };

      const response = await request(app)
        .put(`/api/v1/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/orders/admin/all', () => {
    let testOrder;

    beforeEach(async () => {
      testOrder = new Order({
        user: user._id,
        orderNumber: 'ORD-TEST-002',
        items: [
          {
            product: product1._id,
            quantity: 1,
            price: product1.price,
            total: product1.price
          }
        ],
        status: 'pending',
        subtotal: product1.price,
        shippingCost: 0,
        tax: 0,
        total: product1.price,
        shippingAddress: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com',
          phone: '+56912345678',
          address: 'Calle Test 123',
          city: 'Santiago',
          state: 'RM',
          zipCode: '12345',
          country: 'Chile'
        },
        paymentInfo: {
          method: 'stripe',
          status: 'pending',
          amount: product1.price,
          currency: 'clp'
        }
      });
      await testOrder.save();
    });

    it('✅ Debería obtener todas las órdenes (admin)', async () => {
      const response = await request(app)
        .get('/api/v1/orders/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeInstanceOf(Array);
    });

    it('❌ Debería fallar sin autorización de admin', async () => {
      const response = await request(app)
        .get('/api/v1/orders/admin/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('✅ Debería filtrar órdenes por estado (admin)', async () => {
      const response = await request(app)
        .get('/api/v1/orders/admin/all?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders.every(o => o.status === 'pending')).toBe(true);
    });
  });

  describe('Flujo completo de pago con órdenes', () => {
    it('✅ Debería crear orden con pago exitoso usando Stripe simulado', async () => {
      // Simular paymentIntentId directamente sin usar la API de Stripe
      const paymentIntentId = `pi_simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 1. Crear orden con pago simulado
      const orderData = {
        items: [
          {
            product: product1._id,
            quantity: 1,
            price: product1.price,
            total: product1.price
          },
          {
            product: product2._id,
            quantity: 1,
            price: product2.price,
            total: product2.price
          }
        ],
        shippingAddress: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com',
          phone: '+56912345678',
          address: 'Calle Test 123',
          city: 'Santiago',
          state: 'Región Metropolitana',
          zipCode: '12345',
          country: 'Chile'
        },
        paymentMethod: 'stripe',
        paymentIntentId: paymentIntentId,
        subtotal: 79980,
        shippingCost: 0,
        total: 79980
      };

      const orderResponse = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(orderResponse.body.success).toBe(true);
      const orderId = orderResponse.body.data.order._id;

      // 2. Simular confirmación de pago directamente en la base de datos
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
      expect(updatedOrder.paymentInfo.stripePaymentIntentId).toBe(paymentIntentId);
    });

    it('✅ Debería crear orden con pago pendiente', async () => {
      const orderData = {
        items: [
          {
            product: product1._id,
            quantity: 1,
            price: product1.price
          }
        ],
        shippingAddress: {
          firstName: 'María',
          lastName: 'González',
          email: 'maria@test.com',
          phone: '+56987654321',
          address: 'Calle Test 456',
          city: 'Valparaíso',
          state: 'Región de Valparaíso',
          zipCode: '23456',
          country: 'Chile'
        },
        paymentMethod: 'cash'
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('pending');
      expect(response.body.data.order.paymentInfo.status).toBe('pending');
    });
  });
});
