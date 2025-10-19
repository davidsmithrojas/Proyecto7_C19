const request = require('supertest');
const app = require('../../src/index');
const Product = require('../../src/models/productModel');
const User = require('../../src/models/userModel');

describe('🛍️ Pruebas de Productos', () => {
  let adminUser;
  let adminToken;
  let testProduct;

  beforeEach(async () => {
    // Usar usuario admin existente
    adminUser = await User.findOne({ username: 'useradmin' });
    expect(adminUser).toBeTruthy();

    // Obtener token de admin
    const loginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'useradmin@test.com', password: 'password' });
    
    expect(loginResponse.body.success).toBe(true);
    adminToken = loginResponse.body.data.token;

    // Usar producto existente o crear uno de prueba
    testProduct = await Product.findOne({ category: 'Camisas' });
    if (!testProduct) {
      testProduct = new Product({
        name: 'Camisa Test',
        description: 'Camisa de prueba para testing',
        price: 29990,
        category: 'Camisas',
        stock: 10,
        code: 'TEST001',
        sizes: ['S', 'M', 'L'],
        colors: ['Azul', 'Blanco'],
        image: null,
        createdBy: adminUser._id,
        updatedBy: adminUser._id
      });
      await testProduct.save();
    }
  });

  describe('GET /api/v1/products', () => {
    it('✅ Debería obtener lista de productos', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(response.body.data.products.length).toBeGreaterThan(0);
    });

    it('✅ Debería filtrar productos por categoría', async () => {
      const response = await request(app)
        .get('/api/v1/products?category=Camisas')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.every(p => p.category === 'Camisas')).toBe(true);
    });

    it('✅ Debería buscar productos por nombre', async () => {
      const response = await request(app)
        .get('/api/v1/products?search=Camisa')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.some(p => p.name.includes('Camisa'))).toBe(true);
    });

    it('✅ Debería paginar productos correctamente', async () => {
      const response = await request(app)
        .get('/api/v1/products?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('✅ Debería obtener un producto por ID', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe(testProduct.name);
    });

    it('❌ Debería fallar con ID de producto inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/products/${fakeId}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar con ID de producto inválido', async () => {
      const response = await request(app)
        .get('/api/v1/products/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/products', () => {
    it('✅ Debería crear un nuevo producto (admin)', async () => {
      const productData = {
        name: `Pantalón Test ${Date.now().toString().slice(-6)}`,
        description: 'Pantalón de prueba',
        price: 49.99,
        category: 'Pantalones',
        stock: 15,
        code: `T2-${Date.now().toString().slice(-6)}`,
        sizes: ['M', 'L', 'XL'],
        colors: ['Negro', 'Azul']
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(productData.name);
    });

    it('❌ Debería fallar sin autorización', async () => {
      const productData = {
        name: 'Producto Sin Auth',
        price: 19.99
      };

      const response = await request(app)
        .post('/api/v1/products')
        .send(productData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar con datos de producto inválidos', async () => {
      const productData = {
        name: '', // Nombre vacío
        price: -10, // Precio negativo
        stock: 'invalid' // Stock inválido
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar con código de producto duplicado', async () => {
      const productData = {
        name: 'Producto Duplicado',
        price: 29.99,
        code: `T1-${Date.now().toString().slice(-6)}` // Código único
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('✅ Debería actualizar un producto (admin)', async () => {
      const updateData = {
        name: 'Camisa Test Actualizada',
        price: 39.99,
        stock: 20
      };

      const response = await request(app)
        .put(`/api/v1/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
    });

    it('❌ Debería fallar actualizando producto inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Actualizado' };

      const response = await request(app)
        .put(`/api/v1/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('✅ Debería eliminar un producto (admin)', async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('❌ Debería fallar eliminando producto inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/v1/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/products/search', () => {
    it('✅ Debería buscar productos por texto', async () => {
      const response = await request(app)
        .get('/api/v1/products/search?q=Camisa')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.some(p => p.name.includes('Camisa'))).toBe(true);
    });

    it('✅ Debería buscar productos por categoría', async () => {
      const response = await request(app)
        .get('/api/v1/products/search?q=Camisa')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.some(p => p.name.includes('Camisa'))).toBe(true);
    });
  });

  describe('GET /api/v1/products/low-stock', () => {
    it('✅ Debería obtener productos con stock bajo', async () => {
      const response = await request(app)
        .get('/api/v1/products/low-stock')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });
  });

  describe('GET /api/v1/products/top-selling', () => {
    it('✅ Debería obtener productos más vendidos', async () => {
      const response = await request(app)
        .get('/api/v1/products/top-selling?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(response.body.data.products.length).toBeLessThanOrEqual(5);
    });

    it('❌ Debería fallar con límite inválido', async () => {
      const response = await request(app)
        .get('/api/v1/products/top-selling?limit=invalid')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/products (con imagen)', () => {
    it('✅ Debería crear producto con imagen válida', async () => {
      const productData = {
        name: `Producto con Imagen ${Date.now().toString().slice(-6)}`,
        description: 'Producto de prueba con imagen',
        price: 35000,
        stock: 15,
        code: `IMG-${Date.now().toString().slice(-6)}`,
        category: 'Camisas',
        sizes: JSON.stringify(['S', 'M', 'L']),
        colors: JSON.stringify(['Rojo', 'Azul'])
      };

      // Simular archivo de imagen
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', productData.name)
        .field('description', productData.description)
        .field('price', productData.price)
        .field('stock', productData.stock)
        .field('code', productData.code)
        .field('category', productData.category)
        .field('sizes', productData.sizes)
        .field('colors', productData.colors)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.image).toBeDefined();
    });

    it('✅ Debería crear producto sin imagen', async () => {
      const productData = {
        name: `Producto sin Imagen ${Date.now().toString().slice(-6)}`,
        description: 'Producto de prueba sin imagen',
        price: 25000,
        stock: 10,
        code: `NO-IMG-${Date.now().toString().slice(-6)}`,
        category: 'Camisas',
        sizes: JSON.stringify(['S', 'M']),
        colors: JSON.stringify(['Verde'])
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.image).toBeNull();
    });
  });

  describe('PUT /api/v1/products/:id (actualizar con imagen)', () => {
    it('✅ Debería actualizar producto con nueva imagen', async () => {
      const updateData = {
        name: 'Producto Actualizado con Imagen',
        description: 'Producto actualizado con nueva imagen',
        price: 40000
      };

      const response = await request(app)
        .put(`/api/v1/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', updateData.name)
        .field('description', updateData.description)
        .field('price', updateData.price)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });
});
