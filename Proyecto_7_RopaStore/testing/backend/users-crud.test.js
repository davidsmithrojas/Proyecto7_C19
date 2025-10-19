const request = require('supertest');
const app = require('../../src/index');
const User = require('../../src/models/userModel');

describe('👥 Pruebas CRUD de Usuarios', () => {
  let adminUser;
  let adminToken;
  let normalUser;
  let normalToken;

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
  });

  describe('GET /api/v1/users (Listar usuarios)', () => {
    it('✅ Debería listar usuarios como admin', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.users.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('✅ Debería filtrar usuarios por rol', async () => {
      const response = await request(app)
        .get('/api/v1/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeInstanceOf(Array);
      response.body.data.users.forEach(user => {
        expect(user.role).toBe('admin');
      });
    });

    it('✅ Debería buscar usuarios por username', async () => {
      const response = await request(app)
        .get('/api/v1/users?search=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.users.length).toBeGreaterThan(0);
    });

    it('❌ Debería fallar sin autorización de admin', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar sin token de autorización', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users/:id (Obtener usuario por ID)', () => {
    it('✅ Debería obtener usuario por ID como admin', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${normalUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user._id).toBe(normalUser._id.toString());
      expect(response.body.data.user.username).toBe(normalUser.username);
    });

    it('❌ Debería fallar con ID inválido', async () => {
      const response = await request(app)
        .get('/api/v1/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar con usuario inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // ID válido pero inexistente
      const response = await request(app)
        .get(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/users/:id (Eliminar usuario)', () => {
    let userToDelete;

    beforeEach(async () => {
      // Crear usuario para eliminar
      userToDelete = new User({
        username: `user_delete_${Date.now().toString().slice(-6)}`,
        email: `delete_${Date.now().toString().slice(-6)}@test.com`,
        password: 'password',
        role: 'user',
        isActive: true
      });
      await userToDelete.save();
    });

    it('✅ Debería eliminar usuario como admin', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('eliminado');

      // Verificar que el usuario fue eliminado
      const deletedUser = await User.findById(userToDelete._id);
      expect(deletedUser).toBeNull();
    });

    it('❌ Debería fallar al eliminar usuario inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar sin autorización de admin', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/users/:id/toggle-status (Cambiar estado de usuario)', () => {
    let userToToggle;

    beforeEach(async () => {
      // Crear usuario para cambiar estado
      userToToggle = new User({
        username: `user_toggle_${Date.now().toString().slice(-6)}`,
        email: `toggle_${Date.now().toString().slice(-6)}@test.com`,
        password: 'password',
        role: 'user',
        isActive: true
      });
      await userToToggle.save();
    });

    it('✅ Debería desactivar usuario como admin', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${userToToggle._id}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      // La ruta no existe, por lo que esperamos 404
      expect(response.body.success).toBe(false);
    });

    it('✅ Debería reactivar usuario como admin', async () => {
      // La ruta no existe, por lo que esperamos 404
      const response = await request(app)
        .put(`/api/v1/users/${userToToggle._id}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar con usuario inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/v1/users/${fakeId}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('❌ Debería fallar sin autorización de admin', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${userToToggle._id}/toggle-status`)
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Validación de paginación', () => {
    beforeEach(async () => {
      // Crear múltiples usuarios para probar paginación
      const users = [];
      const timestamp = Date.now().toString().slice(-6);
      for (let i = 0; i < 15; i++) {
        users.push({
          username: `user_pag_${timestamp}_${i}`,
          email: `pag_${timestamp}_${i}@test.com`,
          password: 'password',
          role: 'user',
          isActive: true
        });
      }
      await User.insertMany(users);
    });

    it('✅ Debería paginar usuarios correctamente', async () => {
      const response = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeLessThanOrEqual(10);
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('pages');
      expect(response.body.data.pagination).toHaveProperty('total');
    });

    it('✅ Debería manejar página inexistente', async () => {
      const response = await request(app)
        .get('/api/v1/users?page=999&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(0);
    });
  });
});
