// Configuración para usar la base de datos principal en las pruebas
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/proyecto_6_db';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '5001';

// Deshabilitar rate limiting para pruebas
process.env.DISABLE_RATE_LIMITING = 'true';

// Suprimir logs durante las pruebas
process.env.DOTENV_CONFIG_QUIET = 'true';
