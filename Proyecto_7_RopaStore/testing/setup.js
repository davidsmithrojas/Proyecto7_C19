const mongoose = require('mongoose');

// Suprimir logs durante las pruebas
require('./setup-silent.js');

// Configurar base de datos principal
beforeAll(async () => {
  // Solo conectar si no hay conexión activa
  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/proyecto_6_db';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }
}, 30000);

// Limpiar solo datos temporales después de cada test
afterEach(async () => {
  try {
    // Limpiar solo colecciones temporales, mantener usuarios y productos
    const collections = mongoose.connection.collections;
    const collectionsToClean = ['carts', 'orders', 'inventorymovements', 'couponusages', 'reviews', 'chats', 'chatmessages'];
    
    // NO limpiar estas colecciones importantes
    const collectionsToPreserve = ['users', 'products'];
    
    for (const collectionName of collectionsToClean) {
      if (collections[collectionName] && !collectionsToPreserve.includes(collectionName)) {
        await collections[collectionName].deleteMany({});
      }
    }
  } catch (error) {
    console.warn('Error limpiando datos temporales:', error.message);
  }
});

// Cerrar conexión después de todos los tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } catch (error) {
    console.warn('Error cerrando conexión:', error.message);
  }
});

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '5001';
