const request = require('supertest');
const app = require('../../src/index');
const User = require('../../src/models/userModel');
const Product = require('../../src/models/productModel');
const Order = require('../../src/models/OrderModel');

describe('📊 Pruebas de Dashboard', () => {
  let adminUser;
  let adminToken;
  let normalUser;
  let normalToken;
  let testProducts = [];
  let testOrders = [];

  beforeEach(async () => {
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

    // Usar productos existentes
    const product1 = await Product.findOne({ category: 'Camisas' });
    const product2 = await Product.findOne({ category: 'Pantalones' });
    
    if (product1) testProducts.push(product1);
    if (product2) testProducts.push(product2);

    // Crear órdenes de prueba
    const order1 = new Order({
      user: normalUser._id,
      orderNumber: 'ORD-001',
      items: [{
        product: product1._id,
        quantity: 2,
        price: product1.price,
        total: product1.price * 2
      }],
      subtotal: 50000,
      shippingCost: 5000,
      tax: 9500,
      total: 64500,
      shippingAddress: {
        firstName: 'Juan',
        lastName: 'Pérez',
        address: 'Calle Test 123',
        city: 'Santiago',
        state: 'Región Metropolitana',
        zipCode: '12345',
        country: 'Chile',
        phone: '+56912345678',
        email: 'juan.perez@test.com'
      },
      paymentInfo: {
        method: 'stripe',
        status: 'succeeded',
        amount: 64500,
        stripePaymentIntentId: 'pi_test_123'
      },
      status: 'processing'
    });
    await order1.save();
    testOrders.push(order1);

    const order2 = new Order({
      user: normalUser._id,
      orderNumber: 'ORD-002',
      items: [{
        product: product2._id,
        quantity: 1,
        price: product2.price,
        total: product2.price * 1
      }],
      subtotal: 35000,
      shippingCost: 5000,
      tax: 6650,
      total: 46650,
      shippingAddress: {
        firstName: 'María',
        lastName: 'González',
        address: 'Calle Test 456',
        city: 'Valparaíso',
        state: 'Región de Valparaíso',
        zipCode: '23456',
        country: 'Chile',
        phone: '+56987654321',
        email: 'maria.gonzalez@test.com'
      },
      paymentInfo: {
        method: 'stripe',
        status: 'succeeded',
        amount: 46650,
        stripePaymentIntentId: 'pi_test_456'
      },
      status: 'delivered'
    });
    await order2.save();
    testOrders.push(order2);
  });

  describe('GET /api/v1/dashboard/stats', () => {
    it('✅ Debería obtener estadísticas del dashboard como admin', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('totalProducts');
      expect(response.body.data).toHaveProperty('totalOrders');
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('lowStockProducts');
      
      expect(response.body.data.totalUsers).toBeGreaterThanOrEqual(0);
      expect(response.body.data.totalProducts).toBeGreaterThanOrEqual(0);
      expect(response.body.data.totalOrders).toBeGreaterThanOrEqual(0);
    });

    it('❌ Debería fallar sin autorización de admin', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar sin token de autorización', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/dashboard/recent-orders', () => {
    it('✅ Debería obtener órdenes recientes como admin', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/recent-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeInstanceOf(Array);
      expect(response.body.data.orders.length).toBeGreaterThanOrEqual(0);
      
      // Si hay órdenes, verificar que tienen la información necesaria
      if (response.body.data.orders.length > 0) {
        const order = response.body.data.orders[0];
        expect(order).toHaveProperty('_id');
        expect(order).toHaveProperty('user');
        expect(order).toHaveProperty('total');
        expect(order).toHaveProperty('status');
      }
    });

    it('❌ Debería fallar sin autorización de admin', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/recent-orders')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/dashboard/top-products', () => {
    it('✅ Debería obtener productos más vendidos como admin', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/top-products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(response.body.data.products.length).toBeGreaterThanOrEqual(0);
    });

    it('❌ Debería fallar sin autorización de admin', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/top-products')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/dashboard/sales-chart', () => {
    it('✅ Debería obtener datos del gráfico de ventas como admin', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/sales-chart')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('❌ Debería fallar sin autorización de admin', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/sales-chart')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/dashboard/user-growth', () => {
    it('✅ Debería obtener datos de crecimiento de usuarios como admin', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/user-growth')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('❌ Debería fallar sin autorización de admin', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/user-growth')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
