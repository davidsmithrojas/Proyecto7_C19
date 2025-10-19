const request = require('supertest');
const app = require('../../src/index');
const User = require('../../src/models/userModel');
const Product = require('../../src/models/productModel');

// Configurar para usar la base de datos principal en lugar de la de prueba
process.env.NODE_ENV = 'development';

describe('🔍 Verificación de Datos de Prueba', () => {
  describe('👤 Usuarios de Prueba', () => {
    it('✅ Debería verificar que usertest existe con datos correctos', async () => {
      const user = await User.findOne({ username: 'usertest' });
      
      expect(user).toBeTruthy();
      expect(user.email).toBe('usertest@test.com');
      expect(user.role).toBe('user');
      expect(user.isActive).toBe(true);
    });

    it('✅ Debería verificar que useradmin existe con datos correctos', async () => {
      const user = await User.findOne({ username: 'useradmin' });
      
      expect(user).toBeTruthy();
      expect(user.email).toBe('useradmin@test.com');
      expect(user.role).toBe('admin');
      expect(user.isActive).toBe(true);
    });

    it('✅ Debería poder hacer login con usertest', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'usertest@test.com',
          password: 'password'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('usertest');
      expect(response.body.data.user.role).toBe('user');
    });

    it('✅ Debería poder hacer login con useradmin', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'useradmin@test.com',
          password: 'password'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('useradmin');
      expect(response.body.data.user.role).toBe('admin');
    });
  });

  describe('🛍️ Productos de Prueba', () => {
    it('✅ Debería verificar que existen productos de camisas', async () => {
      const camisas = await Product.find({ category: 'Camisas' });
      
      expect(camisas.length).toBeGreaterThan(0);
      
      // Verificar que al menos una camisa tiene datos válidos
      const camisa = camisas[0];
      expect(camisa.name).toBeTruthy();
      expect(camisa.price).toBeGreaterThan(0);
      expect(camisa.stock).toBeGreaterThanOrEqual(0);
    });

    it('✅ Debería verificar que existen productos de pantalones', async () => {
      const pantalones = await Product.find({ category: 'Pantalones' });
      
      expect(pantalones.length).toBeGreaterThan(0);
      
      // Verificar que al menos un pantalón tiene datos válidos
      const pantalon = pantalones[0];
      expect(pantalon.name).toBeTruthy();
      expect(pantalon.price).toBeGreaterThan(0);
      expect(pantalon.stock).toBeGreaterThanOrEqual(0);
    });

    it('✅ Debería verificar que existen productos de zapatos', async () => {
      const zapatos = await Product.find({ category: 'Zapatos' });
      
      expect(zapatos.length).toBeGreaterThan(0);
      
      // Verificar que al menos un zapato tiene datos válidos
      const zapato = zapatos[0];
      expect(zapato.name).toBeTruthy();
      expect(zapato.price).toBeGreaterThan(0);
      expect(zapato.stock).toBeGreaterThanOrEqual(0);
    });

    it('✅ Debería verificar que todos los productos tienen datos completos', async () => {
      const products = await Product.find({ isActive: true });
      
      expect(products.length).toBeGreaterThan(0);
      
      for (const product of products) {
        expect(product.name).toBeTruthy();
        expect(product.description).toBeTruthy();
        expect(product.price).toBeGreaterThan(0);
        expect(product.category).toBeTruthy();
        expect(product.stock).toBeGreaterThanOrEqual(0);
        expect(product.code).toBeTruthy();
        expect(product.sizes).toBeInstanceOf(Array);
        expect(product.colors).toBeInstanceOf(Array);
        expect(product.images).toBeInstanceOf(Array);
        expect(product.createdBy).toBeTruthy();
        // updatedBy puede ser opcional
        if (product.updatedBy) {
          expect(product.updatedBy).toBeTruthy();
        }
      }
    });
  });

  describe('🛒 Funcionalidad del Carrito', () => {
    let userToken;

    beforeEach(async () => {
      // Login con usertest
      const loginResponse = await request(app)
        .post('/api/v1/users/login')
        .send({ email: 'usertest@test.com', password: 'password' });
      
      if (loginResponse.body.success && loginResponse.body.data && loginResponse.body.data.token) {
        userToken = loginResponse.body.data.token;
      } else {
        throw new Error('No se pudo obtener token de usuario: ' + JSON.stringify(loginResponse.body));
      }
    });

    it('✅ Debería poder obtener carrito del usuario', async () => {
      const response = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart).toBeDefined();
    });

    it('✅ Debería poder agregar productos al carrito', async () => {
      // Primero limpiar el carrito
      await request(app)
        .delete('/api/v1/cart/clear')
        .set('Authorization', `Bearer ${userToken}`);

      // Obtener un producto disponible
      const product = await Product.findOne({ 
        category: 'Camisas', 
        isActive: true, 
        stock: { $gt: 2 } 
      });
      expect(product).toBeTruthy();

      const cartData = {
        productId: product._id,
        quantity: 2
      };

      const response = await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send(cartData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.products).toHaveLength(1);
      expect(response.body.data.cart.products[0].quantity).toBe(2);
    });

    it('✅ Debería poder actualizar cantidad en el carrito', async () => {
      // Agregar producto al carrito
      const product = await Product.findOne({ category: 'Pantalones', isActive: true, stock: { $gt: 2 } });
      expect(product).toBeTruthy();

      await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product._id, quantity: 1 });

      // Actualizar cantidad
      const updateData = { quantity: 2 };

      const response = await request(app)
        .put(`/api/v1/cart/update/${product._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.products[0].quantity).toBe(2);
    });

    it('✅ Debería poder eliminar productos del carrito', async () => {
      // Limpiar carrito primero
      await request(app)
        .delete('/api/v1/cart/clear')
        .set('Authorization', `Bearer ${userToken}`);

      // Agregar producto al carrito
      const product = await Product.findOne({ category: 'Zapatos' });
      expect(product).toBeTruthy();

      await request(app)
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product._id, quantity: 1 });

      // Eliminar producto
      const response = await request(app)
        .delete(`/api/v1/cart/remove/${product._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.products).toHaveLength(0);
    });
  });

  describe('💳 Integración con Stripe', () => {
    let userToken;

    beforeEach(async () => {
      // Login con usertest
      const loginResponse = await request(app)
        .post('/api/v1/users/login')
        .send({ email: 'usertest@test.com', password: 'password' });
      
      if (loginResponse.body.success && loginResponse.body.data && loginResponse.body.data.token) {
        userToken = loginResponse.body.data.token;
      } else {
        throw new Error('No se pudo obtener token de usuario: ' + JSON.stringify(loginResponse.body));
      }
    });

    it('✅ Debería obtener tarjetas de prueba de Stripe', async () => {
      const response = await request(app)
        .get('/api/v1/payments/test-cards')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cards).toBeInstanceOf(Array);
      expect(response.body.data.cards.length).toBeGreaterThan(0);
      
      // Verificar que incluye la tarjeta 4242424242424242
      const testCard = response.body.data.cards.find(card => 
        card.number === '4242424242424242'
      );
      expect(testCard).toBeDefined();
    });

    it('✅ Debería crear payment intent con Stripe', async () => {
      const product = await Product.findOne({ category: 'Camisas' });
      expect(product).toBeTruthy();

      const paymentData = {
        amount: product.price,
        currency: 'clp',
        items: [
          { product: product._id, quantity: 1, price: product.price }
        ]
      };

      const response = await request(app)
        .post('/api/v1/payments/create-intent')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clientSecret).toBeDefined();
      expect(response.body.data.amount).toBe(product.price);
    });
  });

  describe('📊 Estadísticas del Sistema', () => {
    let adminToken;

    beforeAll(async () => {
      // Obtener token de admin para las pruebas de estadísticas
      const loginResponse = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'useradmin@test.com',
          password: 'password'
        });
      adminToken = loginResponse.body.data.token;
    });

    it('✅ Debería obtener estadísticas de usuarios', async () => {
      const response = await request(app)
        .get('/api/v1/users/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalUsers).toBeGreaterThan(0);
      expect(response.body.data.byRole).toBeDefined();
    });

    it('✅ Debería obtener estadísticas de productos', async () => {
      const response = await request(app)
        .get('/api/v1/products/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalProducts).toBeGreaterThan(0);
      expect(response.body.data.byCategory).toBeDefined();
    });
  });
});
