const express = require("express");
const { auth } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/authRol');
const { generalLimiter, writeLimiter } = require('../middlewares/rateLimiter');
const validation = require('../middlewares/validation');
const { upload, handleUploadError } = require('../middlewares/upload');
const parseArrays = require('../middlewares/parseArrays');
const ResponseFactory = require('../utils/response');
const productRouter = express.Router();

// Importar controladores
const {
  getProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
  searchProducts,
  getProductsByCategory,
  getLowStockProducts,
  getProductStats
} = require('../controllers/product.Controller');

// Rutas públicas
productRouter.get('/', 
  generalLimiter,
  getProducts
);

productRouter.get('/search',
  generalLimiter,
  searchProducts
);

productRouter.get('/category/:category',
  generalLimiter,
  getProductsByCategory
);

productRouter.get('/low-stock',
  generalLimiter,
  getLowStockProducts
);

productRouter.get('/categories',
  generalLimiter,
  (req, res) => {
    const categories = ['Camisas', 'Pantalones', 'Zapatos'];
    ResponseFactory.success(res, { categories }, 'Categorías obtenidas exitosamente');
  }
);

// GET /api/v1/products/top-selling - Obtener productos más vendidos
productRouter.get('/top-selling',
  generalLimiter,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      
      // Por ahora, devolver array vacío
      // En el futuro, esto se puede conectar con estadísticas reales
      const products = [];

      ResponseFactory.success(res, { products }, 'Productos más vendidos obtenidos exitosamente');
    } catch (error) {
      ResponseFactory.error(res, 'Error al obtener productos más vendidos', 500);
    }
  }
);

productRouter.get('/:id',
  generalLimiter,
  getProductById
);

// Rutas protegidas (solo admin)
productRouter.post('/',
  auth,
  requireAdmin,
  writeLimiter,
  upload.single('image'),
  handleUploadError,
  parseArrays,
  validation.product.create,
  createProduct
);

productRouter.put('/:id',
  auth,
  requireAdmin,
  writeLimiter,
  upload.single('image'),
  handleUploadError,
  parseArrays,
  validation.product.update,
  updateProductById
);

productRouter.delete('/:id',
  auth,
  requireAdmin,
  writeLimiter,
  deleteProductById
);

productRouter.get('/admin/stats',
  auth,
  requireAdmin,
  getProductStats
);

module.exports = productRouter;