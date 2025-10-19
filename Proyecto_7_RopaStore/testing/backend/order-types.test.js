const request = require('supertest');
const app = require('../../src/index');
const Order = require('../../src/models/OrderModel');
const Product = require('../../src/models/productModel');
const User = require('../../src/models/userModel');

describe('📦 Pruebas de Tipos de Órdenes', () => {
  let user;
  let userToken;
  let adminUser;
  let adminToken;
  let product1;
  let product2;

  // Función helper para crear datos de orden válidos
  const createValidOrderData = (product, status = 'pending') => {
    const subtotal = product.price;
    const shippingCost = 5000;
    const total = subtotal + shippingCost;
    
    return {
      items: [
        {
          product: product._id,
          quantity: 1,
          price: product.price,
          total: product.price
        }
      ],
      shippingAddress: {
        firstName: 'Juan',
        lastName: 'Pérez',
        address: 'Calle Test 123',
        city: 'Santiago',
        state: 'Región Metropolitana',
        zipCode: '12345',
        country: 'Chile',
        phone: '123456789',
        email: 'test@example.com'
      },
      paymentMethod: status === 'pending' ? 'cash' : 'stripe',
      status: status,
      subtotal: subtotal,
      shippingCost: shippingCost,
      total: total
    };
  };

  beforeEach(async () => {
    // Usar usuarios existentes
    user = await User.findOne({ username: 'usertest' });
    adminUser = await User.findOne({ username: 'useradmin' });
    
    expect(user).toBeTruthy();
    expect(adminUser).toBeTruthy();

    // Obtener tokens
    const userLogin = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'usertest@test.com', password: 'password' });
    
    expect(userLogin.body.success).toBe(true);
    userToken = userLogin.body.data.token;

    const adminLogin = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'useradmin@test.com', password: 'password' });
    
    expect(adminLogin.body.success).toBe(true);
    adminToken = adminLogin.body.data.token;

    // Usar productos existentes
    product1 = await Product.findOne({ category: 'Camisas' });
    product2 = await Product.findOne({ category: 'Pantalones' });
    
    expect(product1).toBeTruthy();
    expect(product2).toBeTruthy();
  });

  describe('🛒 Orden PENDIENTE', () => {
    it('✅ Debería crear orden con estado PENDING', async () => {
      const orderData = createValidOrderData(product1, 'pending');

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('pending');
      expect(response.body.data.order.paymentInfo.status).toBe('pending');
    });

    it('✅ Debería cambiar estado de PENDING a PROCESSING (admin)', async () => {
      // Crear orden pendiente usando la función helper
      const orderData = createValidOrderData(product1, 'pending');
      const order = new Order({
        user: user._id,
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        total: orderData.total,
        status: 'pending',
        paymentMethod: orderData.paymentMethod,
        paymentInfo: {
          method: orderData.paymentMethod,
          amount: orderData.total,
          status: 'pending',
          currency: 'clp'
        },
        shippingAddress: orderData.shippingAddress
      });
      await order.save();

      const updateData = { status: 'processing' };

      const response = await request(app)
        .put(`/api/v1/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('processing');
    });
  });

  describe('⚙️ Orden PROCESSING', () => {
    it('✅ Debería crear orden con estado PROCESSING', async () => {
      const orderData = createValidOrderData(product1, 'processing');
      orderData.paymentIntentId = 'pi_test_123456789';

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('processing');
    });

    it('✅ Debería cambiar estado de PROCESSING a SHIPPED (admin)', async () => {
      // Crear orden en procesamiento usando la función helper
      const orderData = createValidOrderData(product1, 'processing');
      const order = new Order({
        user: user._id,
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        total: orderData.total,
        status: 'processing',
        paymentMethod: orderData.paymentMethod,
        paymentInfo: {
          method: orderData.paymentMethod,
          amount: orderData.total,
          status: 'pending',
          currency: 'clp'
        },
        shippingAddress: orderData.shippingAddress
      });
      await order.save();

      const updateData = { 
        status: 'shipped',
        trackingNumber: 'TRK123456789'
      };

      const response = await request(app)
        .put(`/api/v1/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('shipped');
      expect(response.body.data.order.trackingNumber).toBe('TRK123456789');
    });
  });

  describe('🚚 Orden SHIPPED', () => {
    it('✅ Debería crear orden con estado SHIPPED', async () => {
      const orderData = createValidOrderData(product1, 'shipped');
      orderData.paymentIntentId = 'pi_test_123456789';
      orderData.trackingNumber = 'TRK123456789';

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('shipped');
      expect(response.body.data.order.trackingNumber).toBe('TRK123456789');
    });

    it('✅ Debería cambiar estado de SHIPPED a DELIVERED (admin)', async () => {
      // Crear orden enviada usando la función helper
      const orderData = createValidOrderData(product1, 'shipped');
      const order = new Order({
        user: user._id,
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        total: orderData.total,
        status: 'shipped',
        paymentMethod: orderData.paymentMethod,
        paymentInfo: {
          method: orderData.paymentMethod,
          amount: orderData.total,
          status: 'pending',
          currency: 'clp'
        },
        trackingNumber: 'TRK123456789',
        shippingAddress: orderData.shippingAddress
      });
      await order.save();

      const updateData = { status: 'delivered' };

      const response = await request(app)
        .put(`/api/v1/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('delivered');
    });
  });

  describe('✅ Orden DELIVERED', () => {
    it('✅ Debería crear orden con estado DELIVERED', async () => {
      const orderData = createValidOrderData(product1, 'delivered');
      orderData.paymentIntentId = 'pi_test_123456789';

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('delivered');
    });
  });

  describe('❌ Orden CANCELLED', () => {
    it('✅ Debería cancelar orden pendiente', async () => {
      // Crear orden pendiente usando la función helper
      const orderData = createValidOrderData(product1, 'pending');
      const order = new Order({
        user: user._id,
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        total: orderData.total,
        status: 'pending',
        paymentMethod: orderData.paymentMethod,
        paymentInfo: {
          method: orderData.paymentMethod,
          amount: orderData.total,
          status: 'pending',
          currency: 'clp'
        },
        shippingAddress: orderData.shippingAddress
      });
      await order.save();

      const updateData = { 
        status: 'cancelled',
        cancellationReason: 'Solicitud del cliente'
      };

      const response = await request(app)
        .put(`/api/v1/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('cancelled');
      expect(response.body.data.order.cancellationReason).toBe('Solicitud del cliente');
    });

    it('❌ Debería fallar al cancelar orden ya entregada', async () => {
      // Crear orden entregada usando la función helper
      const orderData = createValidOrderData(product1, 'delivered');
      const order = new Order({
        user: user._id,
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        total: orderData.total,
        status: 'delivered',
        paymentMethod: orderData.paymentMethod,
        paymentInfo: {
          method: orderData.paymentMethod,
          amount: orderData.total,
          status: 'pending',
          currency: 'clp'
        },
        shippingAddress: orderData.shippingAddress
      });
      await order.save();

      const updateData = { 
        status: 'cancelled',
        cancellationReason: 'Solicitud del cliente'
      };

      const response = await request(app)
        .put(`/api/v1/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No se puede cancelar');
    });
  });

  describe('📊 Filtros por Estado de Orden', () => {
    beforeEach(async () => {
      // Crear órdenes con diferentes estados usando la función helper
      const orderData1 = createValidOrderData(product1, 'pending');
      const orderData2 = createValidOrderData(product2, 'processing');
      const orderData3 = createValidOrderData(product1, 'shipped');
      
      const orders = [
        {
          user: user._id,
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          items: orderData1.items,
          subtotal: orderData1.subtotal,
          shippingCost: orderData1.shippingCost,
          total: orderData1.total,
          status: 'pending',
          paymentMethod: orderData1.paymentMethod,
          paymentInfo: {
            method: orderData1.paymentMethod,
            amount: orderData1.total,
            status: 'pending',
            currency: 'clp'
          },
          shippingAddress: orderData1.shippingAddress
        },
        {
          user: user._id,
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          items: orderData2.items,
          subtotal: orderData2.subtotal,
          shippingCost: orderData2.shippingCost,
          total: orderData2.total,
          status: 'processing',
          paymentMethod: orderData2.paymentMethod,
          paymentInfo: {
            method: orderData2.paymentMethod,
            amount: orderData2.total,
            status: 'pending',
            currency: 'clp'
          },
          shippingAddress: orderData2.shippingAddress
        },
        {
          user: user._id,
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          items: orderData3.items,
          subtotal: orderData3.subtotal,
          shippingCost: orderData3.shippingCost,
          total: orderData3.total,
          status: 'shipped',
          paymentMethod: orderData3.paymentMethod,
          paymentInfo: {
            method: orderData3.paymentMethod,
            amount: orderData3.total,
            status: 'pending',
            currency: 'clp'
          },
          trackingNumber: 'TRK123456789',
          shippingAddress: orderData3.shippingAddress
        }
      ];

      for (const orderData of orders) {
        const order = new Order(orderData);
        await order.save();
      }
    });

    it('✅ Debería filtrar órdenes por estado PENDING', async () => {
      const response = await request(app)
        .get('/api/v1/orders?status=pending')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders.every(o => o.status === 'pending')).toBe(true);
    });

    it('✅ Debería filtrar órdenes por estado PROCESSING', async () => {
      const response = await request(app)
        .get('/api/v1/orders?status=processing')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders.every(o => o.status === 'processing')).toBe(true);
    });

    it('✅ Debería filtrar órdenes por estado SHIPPED', async () => {
      const response = await request(app)
        .get('/api/v1/orders?status=shipped')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders.every(o => o.status === 'shipped')).toBe(true);
    });
  });
});
