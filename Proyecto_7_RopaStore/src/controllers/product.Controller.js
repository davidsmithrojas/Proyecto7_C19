const ProductService = require('../services/productService');
const ResponseFactory = require('../utils/response');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Obtener todos los productos
 */
exports.getProducts = asyncHandler(async (req, res) => {
  const options = {
    page: req.query.page || 1,
    limit: req.query.limit || 10,
    category: req.query.category,
    search: req.query.search,
    sortBy: req.query.sortBy || 'createdAt',
    sortOrder: req.query.sortOrder || 'desc',
    isActive: req.query.isActive !== 'false'
  };

  const result = await ProductService.getAllProducts(options);
  ResponseFactory.success(res, result, 'Productos obtenidos exitosamente');
});

/**
 * Obtener producto por ID
 */
exports.getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await ProductService.getProductById(id);
  ResponseFactory.success(res, { product }, 'Producto obtenido exitosamente');
});

/**
 * Crear producto
 */
exports.createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  const createdBy = req.user.id;
  
  // Agregar imagen si existe
  if (req.file) {
    productData.image = `/uploads/${req.file.filename}`;
  }
  
  const product = await ProductService.createProduct(productData, createdBy);
  ResponseFactory.created(res, product, 'Producto creado exitosamente');
});

/**
 * Actualizar producto
 */
exports.updateProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedBy = req.user.id;
  
  console.log('updateData recibido:', updateData);
  
  // Agregar imagen si existe
  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }
  
  const product = await ProductService.updateProduct(id, updateData, updatedBy);
  ResponseFactory.updated(res, product, 'Producto actualizado exitosamente');
});

/**
 * Eliminar producto
 */
exports.deleteProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedBy = req.user.id;
  await ProductService.deleteProduct(id, deletedBy);
  ResponseFactory.deleted(res, 'Producto eliminado exitosamente');
});

/**
 * Buscar productos
 */
exports.searchProducts = asyncHandler(async (req, res) => {
  const { q: query } = req.query;
  const options = {
    limit: req.query.limit || 10,
    category: req.query.category
  };

  const products = await ProductService.searchProducts(query, options);
  ResponseFactory.success(res, { products }, 'Búsqueda realizada exitosamente');
});

/**
 * Obtener productos por categoría
 */
exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const options = {
    limit: req.query.limit || 10
  };

  const products = await ProductService.getProductsByCategory(category, options);
  ResponseFactory.success(res, { products }, 'Productos por categoría obtenidos');
});

/**
 * Obtener productos con stock bajo
 */
exports.getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = req.query.threshold || 10;
  const products = await ProductService.getLowStockProducts(threshold);
  ResponseFactory.success(res, { products }, 'Productos con stock bajo obtenidos');
});

/**
 * Obtener estadísticas de productos
 */
exports.getProductStats = asyncHandler(async (req, res) => {
  const stats = await ProductService.getProductStats();
  ResponseFactory.success(res, stats, 'Estadísticas de productos obtenidas');
});