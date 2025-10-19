const mongoose = require('mongoose');

// Configurar para usar la base de datos principal
process.env.NODE_ENV = 'development';

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
    console.log('Conectado a la base de datos principal para verificación');
  }
}, 30000);

// No limpiar la base de datos en este test ya que queremos verificar datos existentes
afterEach(async () => {
  // No hacer nada - queremos mantener los datos para verificación
});

// Cerrar conexión después de todos los tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Conexión a la base de datos cerrada');
    }
  } catch (error) {
    console.warn('Error cerrando conexión:', error.message);
  }
});

// Configurar variables de entorno para testing
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '5001';

// Deshabilitar rate limiting para pruebas de verificación
process.env.DISABLE_RATE_LIMITING = 'true';