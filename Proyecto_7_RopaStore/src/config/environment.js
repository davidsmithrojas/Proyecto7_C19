require('dotenv').config();

const config = {
  // Configuración del servidor
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuración de la base de datos
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/proyecto_6_db',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  
  // Configuración JWT
  jwt: {
    secret: process.env.SECRET || 'tu_clave_secreta_muy_segura_aqui_123456789',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    issuer: process.env.JWT_ISSUER || 'proyecto_6_api',
    audience: process.env.JWT_AUDIENCE || 'proyecto_6_users'
  },
  
  // Configuración CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
  },
  
  // Configuración de Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // más permisivo en desarrollo
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Configuración de logging
  logging: {
    level: process.env.NODE_ENV === 'test' ? 'error' : (process.env.LOG_LEVEL || 'info'),
    format: process.env.LOG_FORMAT || 'combined'
  }
};

module.exports = config;

