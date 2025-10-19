const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/environment');
const logger = require('../utils/logger');

// Importar modelos después de la conexión
let User, Product;

// Datos de usuarios predeterminados
const defaultUsers = [
  {
    username: 'useradmin',
    email: 'useradmin@test.com',
    password: 'password',
    role: 'admin',
    firstName: 'Usuario',
    lastName: 'Administrador',
    rut: '123456789',
    phone: '999999999',
    location: 'Santiago de Chile'
  },
  {
    username: 'usertest',
    email: 'usertest@test.com',
    password: 'password',
    role: 'user',
    firstName: 'Usuario',
    lastName: 'Prueba',
    rut: '123456789',
    phone: '999999999',
    location: 'Santiago de Chile'
  }
];

// Datos de productos de ropa predeterminados
const defaultProducts = [
  // Camisas
  {
    name: 'Camisa Algodón Premium',
    description: 'Camisa de algodón 100% premium, corte clásico y cómodo para ocasiones formales y casuales',
    price: 25000,
    category: 'Camisas',
    stock: 30,
    code: 'CAM-001',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanco', 'Azul', 'Negro', 'Gris'],
    images: [{
      url: '/images/camisa-algodon-premium.jpg',
      alt: 'Camisa Algodón Premium',
      isPrimary: true
    }],
    isActive: true
  },
  {
    name: 'Camisa Polo Casual',
    description: 'Camisa polo de algodón piqué, perfecta para el día a día y actividades deportivas',
    price: 18000,
    category: 'Camisas',
    stock: 25,
    code: 'CAM-002',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanco', 'Negro', 'Azul', 'Verde', 'Rojo'],
    images: [{
      url: '/images/camisa-polo-casual.jpg',
      alt: 'Camisa Polo Casual',
      isPrimary: true
    }],
    isActive: true
  },
  {
    name: 'Camisa Lino Verano',
    description: 'Camisa de lino 100% para el verano, fresca y transpirable, ideal para climas cálidos',
    price: 32000,
    category: 'Camisas',
    stock: 20,
    code: 'CAM-003',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Blanco', 'Azul Claro', 'Verde Menta'],
    images: [{
      url: '/images/camisa-lino-verano.jpg',
      alt: 'Camisa Lino Verano',
      isPrimary: true
    }],
    isActive: true
  },

  // Pantalones
  {
    name: 'Pantalón Jeans Clásico',
    description: 'Jeans de mezclilla clásico, corte recto y cómodo para cualquier ocasión',
    price: 35000,
    category: 'Pantalones',
    stock: 40,
    code: 'PAN-001',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Azul Clásico', 'Azul Oscuro', 'Negro', 'Gris'],
    images: [{
      url: '/images/pantalon-jeans-clasico.jpg',
      alt: 'Pantalón Jeans Clásico',
      isPrimary: true
    }],
    isActive: true
  },
  {
    name: 'Pantalón Chino Elegante',
    description: 'Pantalón chino de algodón, perfecto para oficina o eventos casuales elegantes',
    price: 28000,
    category: 'Pantalones',
    stock: 35,
    code: 'PAN-002',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Beige', 'Azul Marino', 'Gris', 'Negro', 'Verde Oliva'],
    images: [{
      url: '/images/pantalon-chino-elegante.jpg',
      alt: 'Pantalón Chino Elegante',
      isPrimary: true
    }],
    isActive: true
  },
  {
    name: 'Pantalón Deportivo',
    description: 'Pantalón deportivo con tecnología de secado rápido, ideal para actividades físicas',
    price: 22000,
    category: 'Pantalones',
    stock: 30,
    code: 'PAN-003',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Gris', 'Azul', 'Verde', 'Rojo'],
    images: [{
      url: '/images/pantalon-deportivo.jpg',
      alt: 'Pantalón Deportivo',
      isPrimary: true
    }],
    isActive: true
  },

  // Zapatos
  {
    name: 'Zapatos Oxford Formales',
    description: 'Zapatos Oxford de cuero genuino, elegantes y cómodos para ocasiones formales',
    price: 45000,
    category: 'Zapatos',
    stock: 25,
    code: 'ZAP-001',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['Negro', 'Marrón', 'Azul Marino'],
    images: [{
      url: '/images/zapatos-oxford-formales.jpg',
      alt: 'Zapatos Oxford Formales',
      isPrimary: true
    }],
    isActive: true
  },
  {
    name: 'Zapatillas Deportivas',
    description: 'Zapatillas deportivas con tecnología de amortiguación, perfectas para correr y entrenar',
    price: 38000,
    category: 'Zapatos',
    stock: 30,
    code: 'ZAP-002',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['Blanco', 'Negro', 'Azul', 'Rojo', 'Verde'],
    images: [{
      url: '/images/zapatillas-deportivas.jpg',
      alt: 'Zapatillas Deportivas',
      isPrimary: true
    }],
    isActive: true
  },
  {
    name: 'Zapatos Casuales',
    description: 'Zapatos casuales de cuero, cómodos y versátiles para el día a día',
    price: 32000,
    category: 'Zapatos',
    stock: 20,
    code: 'ZAP-003',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['Negro', 'Marrón', 'Gris', 'Azul'],
    images: [{
      url: '/images/zapatos-casuales.jpg',
      alt: 'Zapatos Casuales',
      isPrimary: true
    }],
    isActive: true
  }
];

// Función para crear usuarios predeterminados
async function seedUsers() {
  try {
    logger.info('Iniciando creación de usuarios predeterminados...');
    
    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (!existingUser) {
        // No hashear la contraseña aquí, el modelo lo hará automáticamente
        const user = new User(userData);

        await user.save();
        logger.info(`Usuario creado: ${userData.username} (${userData.email})`);
      } else {
        logger.info(`Usuario ya existe: ${userData.username} (${userData.email})`);
      }
    }
    
    logger.info('Proceso de usuarios completado');
  } catch (error) {
    logger.error('Error creando usuarios predeterminados:', error);
    throw error;
  }
}

// Función para crear productos predeterminados
async function seedProducts() {
  try {
    logger.info('Iniciando creación de productos predeterminados...');
    
    // Obtener el ID del usuario admin para usar como createdBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      logger.error('No se encontró usuario admin para asignar como creador de productos');
      return; // Salir sin error si no hay admin
    }
    
    for (const productData of defaultProducts) {
      const existingProduct = await Product.findOne({ 
        code: productData.code
      });

      if (!existingProduct) {
        const product = new Product({
          ...productData,
          createdBy: adminUser._id,
          updatedBy: adminUser._id
        });
        await product.save();
        logger.info(`Producto creado: ${productData.name} (${productData.code})`);
      } else {
        logger.info(`Producto ya existe: ${productData.name} (${productData.code})`);
      }
    }
    
    logger.info('Proceso de productos completado');
  } catch (error) {
    logger.error('Error creando productos predeterminados:', error);
    throw error;
  }
}

// Función principal de inicialización
async function seedDatabase() {
  try {
    logger.info('🌱 Iniciando proceso de inicialización de la base de datos...');
    
    // Conectar a la base de datos si no está conectada
    if (mongoose.connection.readyState !== 1) {
      logger.info('Conectando a la base de datos...');
      await mongoose.connect(config.database.uri, config.database.options);
    }

    // Importar modelos después de la conexión
    User = require('../models/userModel');
    Product = require('../models/productModel');

    // Crear usuarios predeterminados
    await seedUsers();
    
    // Crear productos predeterminados
    await seedProducts();
    
    logger.info('✅ Inicialización de la base de datos completada exitosamente');
    
    // Mostrar resumen
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    
    logger.info(`📊 Resumen de la base de datos:`);
    logger.info(`   - Usuarios: ${userCount}`);
    logger.info(`   - Productos: ${productCount}`);
    
  } catch (error) {
    logger.error('❌ Error durante la inicialización de la base de datos:', error);
    throw error;
  }
}

// Función para verificar si la base de datos necesita inicialización
async function needsSeeding() {
  try {
    // Conectar a la base de datos si no está conectada
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.database.uri, config.database.options);
    }

    // Importar modelos después de la conexión
    User = require('../models/userModel');
    Product = require('../models/productModel');

    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    
    // Si no hay usuarios o productos, necesita inicialización
    return userCount === 0 || productCount === 0;
  } catch (error) {
    logger.error('Error verificando si necesita inicialización:', error);
    return true; // En caso de error, asumir que necesita inicialización
  }
}

module.exports = {
  seedDatabase,
  needsSeeding,
  defaultUsers,
  defaultProducts
};

// Si se ejecuta directamente, correr el seed
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seed:', error);
      process.exit(1);
    });
}
