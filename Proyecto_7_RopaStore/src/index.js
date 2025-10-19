require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Importar configuración y utilidades
const config = require('./config/environment');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');

// Importar rutas
const userRoutes = require('./routes/user.Routes');
const productRoutes = require('./routes/product.Routes');
const eventRoutes = require('./routes/event.Routes');
const cartRoutes = require('./routes/cart.Routes');
const dashboardRoutes = require('./routes/dashboard.Routes');
const orderRoutes = require('./routes/order.Routes');
const paymentRoutes = require('./routes/payment.Routes');
const inventoryRoutes = require('./routes/inventory.Routes');
const couponRoutes = require('./routes/coupon.Routes');
const reviewRoutes = require('./routes/review.Routes');
const chatRoutes = require('./routes/chat.Routes');

// Crear aplicación Express
const app = express();

// Conectar a la base de datos
connectDB();

// Importar y ejecutar seed después de la conexión
const { seedDatabase, needsSeeding } = require('./scripts/seed');

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    // Esperar un poco para asegurar que la conexión esté establecida
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar si necesita inicialización
    const needsInit = await needsSeeding();
    
    if (needsInit) {
      logger.info('🌱 La base de datos necesita inicialización...');
      await seedDatabase();
    } else {
      logger.info('✅ La base de datos ya está inicializada');
    }
  } catch (error) {
    logger.error('❌ Error durante la inicialización de la base de datos:', error);
    // No salir del proceso, solo loggear el error
  }
}

// Ejecutar inicialización
initializeDatabase();

// Middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Configurar CORS
app.use(cors(config.cors));

// Rate limiting global
app.use(generalLimiter);

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else if (config.nodeEnv === 'test') {
  // No usar morgan en entorno de pruebas
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para confiar en proxies (para rate limiting)
app.set('trust proxy', 1);

// Ruta de salud de la API
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API REST Proyecto 6 - MongoDB',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    endpoints: {
      users: '/api/v1/users',
      products: '/api/v1/products',
      events: '/api/v1/events',
      cart: '/api/v1/cart',
      orders: '/api/v1/orders',
      payments: '/api/v1/payments',
      dashboard: '/api/v1/dashboard',
      inventory: '/api/v1/inventory',
      coupons: '/api/v1/coupons',
      reviews: '/api/v1/reviews',
      chat: '/api/v1/chat'
    }
  });
});

// Ruta de salud del sistema
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: config.nodeEnv
  });
});

// Rutas de la API
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/chat', chatRoutes);

// Middleware para rutas no encontradas
app.use(notFound);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', { reason, promise });
  process.exit(1);
});

// Iniciar servidor
const server = app.listen(config.port, () => {
  logger.info(`🚀 Servidor ejecutándose en puerto ${config.port}`);
  logger.info(`🌍 Entorno: ${config.nodeEnv}`);
  logger.info(`📊 Base de datos: ${config.database.uri}`);
  logger.info(`🔗 API disponible en: http://localhost:${config.port}`);
});

// Configurar timeout del servidor
server.timeout = 30000; // 30 segundos

module.exports = app;