
const express = require('express');
const { auth } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/authRol');
const { authLimiter, generalLimiter } = require('../middlewares/rateLimiter');
const validation = require('../middlewares/validation');
const userRouter = express.Router();

// Importar controladores
const {
  createUser,
  loginUser,
  verifyUser,
  updateUser,
  getUserStats,
  getUsers,
  getUserById,
  deleteUser,
  toggleUserStatus
} = require('../controllers/user.Controller');

const {
  requestRole,
  getRoleRequests,
  handleRoleRequest
} = require('../controllers/role.controller');

// Rutas públicas
userRouter.post('/register', 
  generalLimiter,
  validation.user.register,
  createUser
);

userRouter.post('/login',
  authLimiter,
  validation.user.login,
  loginUser
);

// Rutas protegidas
userRouter.get('/verify-user',
  auth,
  verifyUser
);

userRouter.put('/update',
  auth,
  generalLimiter,
  validation.user.update,
  updateUser
);

userRouter.post('/request-role',
  auth,
  generalLimiter,
  validation.roleRequest.create,
  requestRole
);

// Rutas de administración
userRouter.get('/role-requests',
  auth,
  requireAdmin,
  getRoleRequests
);

userRouter.put('/role-requests/:id',
  auth,
  requireAdmin,
  generalLimiter,
  validation.roleRequest.handle,
  handleRoleRequest
);

userRouter.get('/stats',
  auth,
  requireAdmin,
  getUserStats
);

// Rutas CRUD para administración de usuarios
userRouter.get('/',
  auth,
  requireAdmin,
  generalLimiter,
  getUsers
);

userRouter.get('/:id',
  auth,
  requireAdmin,
  getUserById
);

userRouter.post('/',
  auth,
  requireAdmin,
  generalLimiter,
  validation.user.register,
  createUser
);

userRouter.put('/:id',
  auth,
  requireAdmin,
  generalLimiter,
  validation.user.update,
  updateUser
);

userRouter.delete('/:id',
  auth,
  requireAdmin,
  deleteUser
);

userRouter.patch('/:id/toggle-status',
  auth,
  requireAdmin,
  toggleUserStatus
);

module.exports = userRouter;