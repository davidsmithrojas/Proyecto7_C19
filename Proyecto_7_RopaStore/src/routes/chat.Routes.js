const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.Controller');
const { auth } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/authRol');
const { generalLimiter, writeLimiter } = require('../middlewares/rateLimiter');

// Middleware de autenticación para todas las rutas
router.use(auth);

// Rutas públicas (requieren autenticación)
router.post('/', writeLimiter, chatController.createChat);
router.get('/user', generalLimiter, chatController.getUserChats);
router.get('/unread', generalLimiter, chatController.getUnreadMessages);
router.get('/:id', generalLimiter, chatController.getChatById);
router.get('/:chatId/messages', generalLimiter, chatController.getChatMessages);
router.post('/:chatId/messages', writeLimiter, chatController.sendMessage);
router.put('/:messageId/read', writeLimiter, chatController.markMessageAsRead);
router.put('/:messageId/edit', writeLimiter, chatController.editMessage);
router.put('/:id/close', writeLimiter, chatController.closeChat);

// Rutas solo para administradores y soporte
router.get('/admin/active', 
  generalLimiter,
  authorizeRoles('admin', 'superuser'), 
  chatController.getActiveChats
);

router.get('/admin/stats', 
  generalLimiter,
  authorizeRoles('admin', 'superuser'), 
  chatController.getChatStats
);

router.get('/admin/:id', 
  generalLimiter,
  authorizeRoles('admin', 'superuser'), 
  chatController.getChatForAdmin
);

router.get('/admin/:chatId/messages', 
  generalLimiter,
  authorizeRoles('admin', 'superuser'), 
  chatController.getChatMessagesForAdmin
);

router.post('/:id/assign', 
  writeLimiter,
  authorizeRoles('admin', 'superuser'), 
  chatController.assignChatToAgent
);

module.exports = router;
