const logger = require('../utils/logger');
const ResponseFactory = require('../utils/response');
const config = require('../config/environment');

/**
 * Middleware centralizado para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  logger.logError(err, req);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de duplicado de Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} ya existe`;
    error = {
      message,
      statusCode: 409
    };
  }

  // Error de ObjectId inválido
  if (err.name === 'CastError') {
    const message = 'ID inválido';
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = {
      message,
      statusCode: 401
    };
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = {
      message,
      statusCode: 401
    };
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const message = 'JSON inválido';
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de límite de tamaño de archivo
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Archivo demasiado grande';
    error = {
      message,
      statusCode: 413
    };
  }

  // Error de límite de rate limiting
  if (err.status === 429) {
    const message = 'Demasiadas solicitudes';
    error = {
      message,
      statusCode: 429
    };
  }

  // Error de conexión a base de datos
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    const message = 'Error de conexión a la base de datos';
    error = {
      message,
      statusCode: 503
    };
  }

  // Error por defecto
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  // En desarrollo, incluir stack trace
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  res.status(statusCode).json(response);
};

/**
 * Middleware para manejar rutas no encontradas
 */
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Middleware para manejar errores asíncronos
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};

