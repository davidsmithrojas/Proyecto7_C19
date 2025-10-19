const request = require('supertest');
const app = require('../../src/index');
const User = require('../../src/models/userModel');
const Product = require('../../src/models/productModel');
const Order = require('../../src/models/OrderModel');
const Review = require('../../src/models/ReviewModel');

describe('⭐ Pruebas de Reseñas de Productos', () => {
  let userToken, adminToken, user, adminUser, product, order, review;

  // Helper function para crear orden única
  const createTestOrder = async (userId, productId) => {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const timestamp = Date.now().toString().slice(-6);
    const order = new Order({
      user: userId,
      orderNumber: `ORD-${timestamp}`,
      items: [{
        product: productId,
        quantity: 2,
        price: product.price,
        total: product.price * 2
      }],
      shippingAddress: {
        firstName: 'Juan',
        lastName: 'Pérez',
        address: 'Calle 123456789', // Mínimo 10 caracteres
        city: 'Santiago',
        state: 'RM',
        zipCode: '12345',
        country: 'Chile',
        phone: '+56912345678',
        email: 'usertest@test.com'
      },
      paymentInfo: {
        method: 'cash',
        status: 'succeeded',
        amount: (product.price * 2) + 5000
      },
      subtotal: product.price * 2,
      shippingCost: 5000,
      total: (product.price * 2) + 5000,
      status: 'delivered'
    });
    await order.save();
    return order;
  };

  beforeEach(async () => {
    // Limpiar reseñas y órdenes
    await Review.deleteMany({});
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
    
    expect(userLogin.body.success).toBe(true);
    userToken = userLogin.body.data.token;

    const adminLogin = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'useradmin@test.com', password: 'password' });
    
    expect(adminLogin.body.success).toBe(true);
    adminToken = adminLogin.body.data.token;

    // Usar producto existente
    product = await Product.findOne({ category: 'Camisas' });
    expect(product).toBeTruthy();

    // Crear orden para el usuario (se creará una nueva en cada test que la necesite)
    // No crear orden aquí para evitar conflictos de duplicados
  });

  describe('POST /api/v1/reviews', () => {
    it('✅ Debería crear una reseña exitosamente', async () => {
      // Crear orden única para este test
      const testOrder = await createTestOrder(user._id, product._id);
      
      const reviewData = {
        product: product._id,
        order: testOrder._id,
        rating: 5,
        title: 'Excelente producto',
        comment: 'Muy buena calidad, se ve exactamente como en la foto. Recomendado 100%.'
      };

      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.review).toBeDefined();
      expect(response.body.data.review.rating).toBe(5);
      expect(response.body.data.review.title).toBe('Excelente producto');
      expect(response.body.data.review.isVerified).toBe(true);
      expect(response.body.data.review.user.toString()).toBe(user._id.toString());
    });

    it('❌ Debería fallar sin autorización', async () => {
      const reviewData = {
        product: product._id,
        order: '507f1f77bcf86cd799439011', // ID de orden inexistente
        rating: 5,
        title: 'Excelente producto',
        comment: 'Muy buena calidad'
      };

      const response = await request(app)
        .post('/api/v1/reviews')
        .send(reviewData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar con datos inválidos', async () => {
      const reviewData = {
        product: product._id,
        order: '507f1f77bcf86cd799439011', // ID de orden inexistente
        rating: 6, // Rating inválido
        title: 'A', // Título muy corto
        comment: 'Corto' // Comentario muy corto
      };

      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar sin orden válida', async () => {
      const reviewData = {
        product: product._id,
        order: '507f1f77bcf86cd799439011', // ID de orden inexistente
        rating: 5,
        title: 'Excelente producto',
        comment: 'Muy buena calidad'
      };

      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('orden válida');
    });

    it('❌ Debería fallar con reseña duplicada', async () => {
      // Crear orden única para este test
      const testOrder = await createTestOrder(user._id, product._id);
      
      // Crear primera reseña
      const reviewData = {
        product: product._id,
        order: testOrder._id,
        rating: 5,
        title: 'Excelente producto',
        comment: 'Muy buena calidad'
      };

      await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(201);

      // Intentar crear segunda reseña para el mismo producto y orden
      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Ya has escrito una reseña');
    });
  });

  describe('GET /api/v1/reviews/product/:productId', () => {
    it('✅ Debería obtener reseñas de un producto', async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/product/${product._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeDefined();
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.totalReviews).toBeDefined();
      expect(response.body.data.stats.averageRating).toBeDefined();
    });

    it('✅ Debería filtrar reseñas por calificación', async () => {
      // Crear reseña de prueba
      const review = new Review({
        product: product._id,
        user: user._id,
        order: '507f1f77bcf86cd799439013',
        rating: 5,
        title: 'Excelente producto',
        comment: 'Muy buena calidad.',
        isVerified: true,
        isApproved: true
      });
      await review.save();

      const response = await request(app)
        .get(`/api/v1/reviews/product/${product._id}?rating=5`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toHaveLength(1);
      expect(response.body.data.reviews[0].rating).toBe(5);
    });

    it('✅ Debería paginar reseñas correctamente', async () => {
      // Crear reseña de prueba
      const review = new Review({
        product: product._id,
        user: user._id,
        order: '507f1f77bcf86cd799439014',
        rating: 4,
        title: 'Buen producto',
        comment: 'Buena calidad.',
        isVerified: true,
        isApproved: true
      });
      await review.save();

      const response = await request(app)
        .get(`/api/v1/reviews/product/${product._id}?page=1&limit=1`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toHaveLength(1);
    });

    it('❌ Debería fallar sin autorización', async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/product/${product._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/reviews/:id', () => {
    it('✅ Debería obtener una reseña por ID', async () => {
      const review = new Review({
        product: product._id,
        user: user._id,
        order: '507f1f77bcf86cd799439015',
        rating: 5,
        title: 'Excelente producto',
        comment: 'Muy buena calidad, se ve exactamente como en la foto.',
        isVerified: true,
        isApproved: true
      });
      await review.save();

      const response = await request(app)
        .get(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.review).toBeDefined();
      expect(response.body.data.review._id.toString()).toBe(review._id.toString());
      expect(response.body.data.review.user).toBeDefined();
      expect(response.body.data.review.product).toBeDefined();
    });

    it('❌ Debería fallar con ID inexistente', async () => {
      const response = await request(app)
        .get('/api/v1/reviews/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/reviews/:id', () => {
    beforeEach(async () => {
      // Crear orden única para esta reseña
      const testOrder = await createTestOrder(user._id, product._id);
      
      review = new Review({
        product: product._id,
        user: user._id,
        order: testOrder._id,
        rating: 5,
        title: 'Excelente producto',
        comment: 'Muy buena calidad, se ve exactamente como en la foto.',
        isVerified: true,
        isApproved: true
      });
      await review.save();
    });

    it('✅ Debería actualizar una reseña', async () => {
      const updateData = {
        rating: 4,
        title: 'Buen producto',
        comment: 'Buena calidad, cumple con las expectativas.'
      };

      const response = await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.review.rating).toBe(4);
      expect(response.body.data.review.title).toBe('Buen producto');
    });

    it('❌ Debería fallar actualizando reseña de otro usuario', async () => {
      const timestamp = Date.now().toString().slice(-6);
      const otherUser = new User({
        username: `otheruser_${timestamp}`,
        email: `other_${timestamp}@test.com`,
        password: 'password',
        role: 'user'
      });
      await otherUser.save();

      const otherUserLogin = await request(app)
        .post('/api/v1/users/login')
        .send({ email: `other_${timestamp}@test.com`, password: 'password' });
      
      const otherUserToken = otherUserLogin.body.data.token;

      const updateData = {
        rating: 4,
        title: 'Buen producto'
      };

      const response = await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/reviews/:id', () => {
    beforeEach(async () => {
      // Crear orden única para esta reseña
      const testOrder = await createTestOrder(user._id, product._id);
      
      review = new Review({
        product: product._id,
        user: user._id,
        order: testOrder._id,
        rating: 5,
        title: 'Excelente producto',
        comment: 'Muy buena calidad, se ve exactamente como en la foto.',
        isVerified: true,
        isApproved: true
      });
      await review.save();
    });

    it('✅ Debería eliminar una reseña', async () => {
      const response = await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('eliminada exitosamente');

      // Verificar que la reseña fue eliminada
      const deletedReview = await Review.findById(review._id);
      expect(deletedReview).toBeNull();
    });

    it('❌ Debería fallar eliminando reseña de otro usuario', async () => {
      const timestamp = Date.now().toString().slice(-6);
      const otherUser = new User({
        username: `otheruser2_${timestamp}`,
        email: `other2_${timestamp}@test.com`,
        password: 'password',
        role: 'user'
      });
      await otherUser.save();

      const otherUserLogin = await request(app)
        .post('/api/v1/users/login')
        .send({ email: `other2_${timestamp}@test.com`, password: 'password' });
      
      const otherUserToken = otherUserLogin.body.data.token;

      const response = await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/reviews/:id/vote-helpful', () => {
    beforeEach(async () => {
      // Crear orden única para esta reseña
      const testOrder = await createTestOrder(user._id, product._id);
      
      review = new Review({
        product: product._id,
        user: user._id,
        order: testOrder._id,
        rating: 5,
        title: 'Excelente producto',
        comment: 'Muy buena calidad, se ve exactamente como en la foto.',
        isVerified: true,
        isApproved: true
      });
      await review.save();
    });

    it('✅ Debería votar una reseña como útil', async () => {
      const response = await request(app)
        .post(`/api/v1/reviews/${review._id}/vote-helpful`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.helpfulVotes).toBe(1);
      expect(response.body.data.notHelpfulVotes).toBe(0);
    });

    it('❌ Debería fallar con reseña inexistente', async () => {
      const response = await request(app)
        .post('/api/v1/reviews/507f1f77bcf86cd799439011/vote-helpful')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/reviews/:id/vote-not-helpful', () => {
    beforeEach(async () => {
      // Crear orden única para esta reseña
      const testOrder = await createTestOrder(user._id, product._id);
      
      review = new Review({
        product: product._id,
        user: user._id,
        order: testOrder._id,
        rating: 5,
        title: 'Excelente producto',
        comment: 'Muy buena calidad, se ve exactamente como en la foto.',
        isVerified: true,
        isApproved: true
      });
      await review.save();
    });

    it('✅ Debería votar una reseña como no útil', async () => {
      const response = await request(app)
        .post(`/api/v1/reviews/${review._id}/vote-not-helpful`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.helpfulVotes).toBe(0);
      expect(response.body.data.notHelpfulVotes).toBe(1);
    });
  });

  describe('POST /api/v1/reviews/:id/report', () => {
    beforeEach(async () => {
      // Crear orden única para esta reseña
      const testOrder = await createTestOrder(user._id, product._id);
      
      review = new Review({
        product: product._id,
        user: user._id,
        order: testOrder._id,
        rating: 5,
        title: 'Excelente producto',
        comment: 'Muy buena calidad, se ve exactamente como en la foto.',
        isVerified: true,
        isApproved: true
      });
      await review.save();
    });

    it('✅ Debería reportar una reseña', async () => {
      const reportData = {
        reason: 'inappropriate' // Usar valor válido del enum
      };

      const response = await request(app)
        .post(`/api/v1/reviews/${review._id}/report`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reportData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reportada exitosamente');
    });

    it('❌ Debería fallar sin razón de reporte', async () => {
      const response = await request(app)
        .post(`/api/v1/reviews/${review._id}/report`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('razón del reporte es requerida');
    });
  });

  describe('GET /api/v1/reviews/recent', () => {
    beforeEach(async () => {
      // Crear órdenes únicas para las reseñas
      const order1 = await createTestOrder(user._id, product._id);
      const order2 = await createTestOrder(user._id, product._id);
      
      // Crear reseñas recientes
      const reviews = [
        {
          product: product._id,
          user: user._id,
          order: order1._id,
          rating: 5,
          title: 'Excelente producto',
          comment: 'Muy buena calidad, se ve exactamente como en la foto.',
          isVerified: true,
          isApproved: true
        },
        {
          product: product._id,
          user: user._id,
          order: order2._id,
          rating: 4,
          title: 'Buen producto',
          comment: 'Buena calidad, cumple con las expectativas.',
          isVerified: true,
          isApproved: true
        }
      ];

      await Review.insertMany(reviews);
    });

    it('✅ Debería obtener reseñas recientes', async () => {
      const response = await request(app)
        .get('/api/v1/reviews/recent')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toHaveLength(2);
    });

    it('✅ Debería limitar el número de reseñas recientes', async () => {
      const response = await request(app)
        .get('/api/v1/reviews/recent?limit=1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toHaveLength(1);
    });
  });

  describe('Rutas de Administrador', () => {
    beforeEach(async () => {
      // Crear orden única para esta reseña
      const testOrder = await createTestOrder(user._id, product._id);
      
      review = new Review({
        product: product._id,
        user: user._id,
        order: testOrder._id,
        rating: 5,
        title: 'Excelente producto',
        comment: 'Muy buena calidad, se ve exactamente como en la foto.',
        isVerified: true,
        isApproved: true
      });
      await review.save();
    });

    describe('GET /api/v1/reviews/admin/reported', () => {
      it('✅ Debería obtener reseñas reportadas (admin)', async () => {
        // Reportar la reseña primero
        await review.reportReview(user._id, 'inappropriate');

        const response = await request(app)
          .get('/api/v1/reviews/admin/reported')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.reviews).toBeDefined();
      });

      it('❌ Debería fallar sin autorización de admin', async () => {
        const response = await request(app)
          .get('/api/v1/reviews/admin/reported')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/v1/reviews/:id/respond', () => {
      it('✅ Debería responder a una reseña (admin)', async () => {
        const responseData = {
          response: 'Gracias por tu comentario. Nos alegra saber que estás satisfecho con el producto.'
        };

        const response = await request(app)
          .post(`/api/v1/reviews/${review._id}/respond`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(responseData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.review.response).toBeDefined();
        expect(response.body.data.review.response.text).toBe(responseData.response);
      });

      it('❌ Debería fallar sin autorización de admin', async () => {
        const responseData = {
          response: 'Gracias por tu comentario.'
        };

        const response = await request(app)
          .post(`/api/v1/reviews/${review._id}/respond`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(responseData)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /api/v1/reviews/:id/moderate', () => {
      it('✅ Debería moderar una reseña (admin)', async () => {
        const moderateData = {
          isApproved: false
        };

        const response = await request(app)
          .put(`/api/v1/reviews/${review._id}/moderate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(moderateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.review.isApproved).toBe(false);
      });

      it('❌ Debería fallar sin autorización de admin', async () => {
        const moderateData = {
          isApproved: false
        };

        const response = await request(app)
          .put(`/api/v1/reviews/${review._id}/moderate`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(moderateData)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/v1/reviews/admin/stats', () => {
      it('✅ Debería obtener estadísticas de reseñas (admin)', async () => {
        const response = await request(app)
          .get('/api/v1/reviews/admin/stats')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });

      it('❌ Debería fallar sin autorización de admin', async () => {
        const response = await request(app)
          .get('/api/v1/reviews/admin/stats')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });
  });
});
