const Product = require('../models/productModel');
const logger = require('../utils/logger');

class ProductService {
  /**
   * Crear un nuevo producto
   * @param {Object} productData - Datos del producto
   * @param {string} createdBy - ID del usuario que crea el producto
   * @returns {Promise<Object>} Producto creado
   */
  static async createProduct(productData, createdBy) {
    try {
      const { name, description, price, category, code, sizes, colors, stock, tags = [], images = [] } = productData;

      // Verificar si el producto ya existe
      const existingProduct = await Product.findOne({ name });
      if (existingProduct) {
        throw new Error('Ya existe un producto con este nombre');
      }

      // Crear producto
      const product = new Product({
        name,
        description,
        price,
        category,
        code,
        sizes,
        colors,
        stock,
        tags,
        images,
        createdBy
      });

      await product.save();

      logger.info('Producto creado exitosamente', {
        productId: product._id,
        name: product.name,
        category: product.category,
        createdBy
      });

      return product;
    } catch (error) {
      logger.error('Error al crear producto', { error: error.message, productData, createdBy });
      throw error;
    }
  }

  /**
   * Obtener todos los productos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de productos
   */
  static async getAllProducts(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        isActive = true
      } = options;

      // Construir query
      const query = { isActive };

      if (category) {
        query.category = category;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Configurar paginación
      const skip = (page - 1) * limit;

      // Configurar ordenamiento
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const products = await Product.find(query)
        .populate('createdBy', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Product.countDocuments(query);

      logger.info('Productos obtenidos', {
        count: products.length,
        total,
        page,
        limit,
        filters: { category, search, isActive }
      });

      return {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error al obtener productos', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Obtener producto por ID
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>} Producto encontrado
   */
  static async getProductById(productId) {
    try {
      const product = await Product.findById(productId)
        .populate('createdBy', 'username email')
        .populate('updatedBy', 'username email');

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return product;
    } catch (error) {
      logger.error('Error al obtener producto', { error: error.message, productId });
      throw error;
    }
  }

  /**
   * Actualizar producto
   * @param {string} productId - ID del producto
   * @param {Object} updateData - Datos a actualizar
   * @param {string} updatedBy - ID del usuario que actualiza
   * @returns {Promise<Object>} Producto actualizado
   */
  static async updateProduct(productId, updateData, updatedBy) {
    try {
      console.log('updateData en servicio:', updateData);
      console.log('productId:', productId);
      console.log('updatedBy:', updatedBy);
      
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Verificar si el nombre ya existe en otro producto
      if (updateData.name && updateData.name !== product.name) {
        const existingProduct = await Product.findOne({
          _id: { $ne: productId },
          name: updateData.name
        });

        if (existingProduct) {
          throw new Error('Ya existe un producto con este nombre');
        }
      }

      // Actualizar producto
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { 
          ...updateData,
          updatedBy
        },
        { new: true, runValidators: true }
      ).populate('createdBy', 'username email')
       .populate('updatedBy', 'username email');

      logger.info('Producto actualizado exitosamente', {
        productId,
        updatedFields: Object.keys(updateData),
        updatedBy
      });

      return updatedProduct;
    } catch (error) {
      logger.error('Error al actualizar producto', { 
        error: error.message, 
        productId, 
        updateData, 
        updatedBy 
      });
      throw error;
    }
  }

  /**
   * Eliminar producto (soft delete)
   * @param {string} productId - ID del producto
   * @param {string} deletedBy - ID del usuario que elimina
   * @returns {Promise<Object>} Producto eliminado
   */
  static async deleteProduct(productId, deletedBy) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Soft delete - marcar como inactivo
      const deletedProduct = await Product.findByIdAndUpdate(
        productId,
        { 
          isActive: false,
          updatedBy: deletedBy
        },
        { new: true }
      );

      logger.info('Producto eliminado exitosamente', {
        productId,
        deletedBy
      });

      return deletedProduct;
    } catch (error) {
      logger.error('Error al eliminar producto', { error: error.message, productId, deletedBy });
      throw error;
    }
  }

  /**
   * Buscar productos
   * @param {string} query - Término de búsqueda
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array>} Productos encontrados
   */
  static async searchProducts(query, options = {}) {
    try {
      const { limit = 10, category } = options;

      const searchOptions = { limit };
      if (category) {
        searchOptions.category = category;
      }

      const products = await Product.searchProducts(query, searchOptions);

      logger.info('Búsqueda de productos realizada', {
        query,
        resultsCount: products.length,
        options
      });

      return products;
    } catch (error) {
      logger.error('Error en búsqueda de productos', { error: error.message, query, options });
      throw error;
    }
  }

  /**
   * Obtener productos por categoría
   * @param {string} category - Categoría del producto
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Productos de la categoría
   */
  static async getProductsByCategory(category, options = {}) {
    try {
      const products = await Product.getProductsByCategory(category, options);

      logger.info('Productos obtenidos por categoría', {
        category,
        count: products.length
      });

      return products;
    } catch (error) {
      logger.error('Error al obtener productos por categoría', { 
        error: error.message, 
        category, 
        options 
      });
      throw error;
    }
  }

  /**
   * Obtener productos con stock bajo
   * @param {number} threshold - Umbral de stock bajo
   * @returns {Promise<Array>} Productos con stock bajo
   */
  static async getLowStockProducts(threshold = 10) {
    try {
      const products = await Product.getLowStockProducts(threshold);

      logger.info('Productos con stock bajo obtenidos', {
        threshold,
        count: products.length
      });

      return products;
    } catch (error) {
      logger.error('Error al obtener productos con stock bajo', { 
        error: error.message, 
        threshold 
      });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de productos
   * @returns {Promise<Object>} Estadísticas de productos
   */
  static async getProductStats() {
    try {
      const stats = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            avgPrice: { $avg: '$price' }
          }
        }
      ]);

      const totalProducts = await Product.countDocuments({ isActive: true });
      const totalStock = await Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$stock' } } }
      ]);

      return {
        totalProducts,
        totalStock: totalStock[0]?.total || 0,
        byCategory: stats
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas de productos', { error: error.message });
      throw error;
    }
  }
}

module.exports = ProductService;

