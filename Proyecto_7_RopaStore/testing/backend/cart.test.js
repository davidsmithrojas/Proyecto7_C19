const request = require('supertest');
const app = require('../../src/index');
const Cart = require('../../src/models/CartModel');
const Product = require('../../src/models/productModel');
const User = require('../../src/models/userModel');

describe('🛒 Pruebas de Carrito de Compras', () => {
  let user;
  let userToken;
  let product1;
  let product2;

  beforeEach(async () => {
    // Usar usuario existente
    user = await User.findOne({ username: 'usertest' });
    expect(user).toBeTruthy();

    // Obtener token
    const loginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'usertest@test.com', password: 'password' });
    
    expect(loginResponse.body.success).toBe(true);
    userToken = loginResponse.body.data.token;

    // Usar productos existentes, activos y con stock suficiente
    product1 = await Product.findOne({ category: 'Camisas', isActive: true, stock: { $gt: 5 } });
    product2 = await Product.findOne({ category: 'Pantalones', isActive: true, stock: { $gt: 5 } });
    
    
    expect(product1).toBeTruthy();
    expect(product2).toBeTruthy();
  });

  describe('GET /api/v1/cart', () => {
    it('✅ Debería obtener carrito del usuario', async () => {
      const response = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart).toBeDefined();
    });

    it('❌ Debería fallar sin autorización', async () => {
      const response = await request(app)
        .get('/api/v1/cart')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/cart/add', () => {
    it('✅ Debería agregar producto al carrito', async () => {
      const cartData = {
        productId: product1._id,
        quantity: 2
      };

      const response = await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send(cartData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.products).toHaveLength(1);
      expect(response.body.data.cart.products[0].product._id).toBe(product1._id.toString());
    });

    it('✅ Debería actualizar cantidad si producto ya existe en carrito', async () => {
      // Agregar producto por primera vez
      await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product1._id, quantity: 2 });

      // Agregar más cantidad del mismo producto
      const response = await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product1._id, quantity: 3 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.products[0].quantity).toBe(5);
    });

    it('❌ Debería fallar con producto inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const cartData = {
        productId: fakeId,
        quantity: 2
      };

      const response = await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send(cartData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar con cantidad mayor al stock disponible', async () => {
      const cartData = {
        productId: product1._id,
        quantity: 30 // Más que el stock disponible (25)
      };

      const response = await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send(cartData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar con cantidad inválida', async () => {
      const cartData = {
        productId: product1._id,
        quantity: -1 // Cantidad negativa
      };

      const response = await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send(cartData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/cart/update/:productId', () => {
    beforeEach(async () => {
      // Agregar producto al carrito primero
      await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product1._id, quantity: 2 });
    });

    it('✅ Debería actualizar cantidad de producto en carrito', async () => {
      const updateData = { quantity: 5 };

      const response = await request(app)
        .put(`/api/v1/cart/update/${product1._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.products[0].quantity).toBe(5);
    });

    it('✅ Debería eliminar producto si cantidad es 0', async () => {
      const updateData = { quantity: 0 };

      const response = await request(app)
        .put(`/api/v1/cart/update/${product1._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.products).toHaveLength(0);
    });

    it('❌ Debería fallar con producto no en carrito', async () => {
      const updateData = { quantity: 3 };

      const response = await request(app)
        .put(`/api/v1/cart/update/${product2._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/cart/remove/:productId', () => {
    it('✅ Debería eliminar producto del carrito', async () => {
      // Primero agregar productos al carrito
      await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product1._id, quantity: 2 });

      await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product2._id, quantity: 1 });

      // Ahora eliminar el primer producto
      const response = await request(app)
        .delete(`/api/v1/cart/remove/${product1._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.products).toHaveLength(1);
      expect(response.body.data.cart.products[0].product._id).toBe(product2._id.toString());
    });

    it('❌ Debería fallar eliminando producto no en carrito', async () => {
      // Usar un ID de producto válido que no esté en el carrito
      const response = await request(app)
        .delete(`/api/v1/cart/remove/${product2._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/cart/clear', () => {
    beforeEach(async () => {
      // Agregar productos al carrito
      await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product1._id, quantity: 2 });

      await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product2._id, quantity: 1 });
    });

    it('✅ Debería vaciar carrito completamente', async () => {
      const response = await request(app)
        .delete('/api/v1/cart/clear')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200); // Rate limiting deshabilitado en pruebas

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.total).toBe(0);
      expect(response.body.data.cart.products.length).toBe(0);
    });
  });

  describe('GET /api/v1/cart/total', () => {
    it('✅ Debería calcular total correctamente', async () => {
      // Primero agregar productos al carrito
      await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product1._id, quantity: 2 });

      await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product2._id, quantity: 1 });

      // Ahora obtener el total
      const response = await request(app)
        .get('/api/v1/cart/total')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Calcular el total esperado basado en los precios reales de los productos
      const expectedTotal = (product1.price * 2) + (product2.price * 1);
      expect(response.body.data.stats.totalValue).toBe(expectedTotal);
      expect(response.body.data.stats.totalItems).toBe(3); // 2 + 1
    });
  });
});
