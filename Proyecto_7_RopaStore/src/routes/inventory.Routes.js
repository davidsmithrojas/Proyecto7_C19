const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.Controller');
const { auth } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/authRol');

// Rutas públicas (requieren autenticación)
router.use(auth);

// Rutas para usuarios autenticados
router.get('/product/:productId/history', inventoryController.getProductHistory);
router.get('/recent-movements', inventoryController.getRecentMovements);
router.get('/stats', inventoryController.getInventoryStats);
router.post('/check-stock/:productId', inventoryController.checkStock);
router.get('/low-stock', inventoryController.getLowStockProducts);
router.get('/dashboard', inventoryController.getInventoryDashboard);

// Rutas solo para administradores
router.post('/adjust-stock/:productId', 
  authorizeRoles('admin', 'superuser'), 
  inventoryController.adjustStock
);

router.post('/restock/:productId', 
  authorizeRoles('admin', 'superuser'), 
  inventoryController.restock
);

module.exports = router;
