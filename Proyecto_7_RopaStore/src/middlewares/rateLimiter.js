const rateLimit = require('express-rate-limit');
const config = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Rate limiter general para toda la API
 * Deshabilitado en entorno de pruebas
 */
const generalLimiter = (config.nodeEnv === 'test' || process.env.DISABLE_RATE_LIMITING === 'true') ? (req, res, next) => next() : rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: config.rateLimit.message,
    timestamp: new Date().toISOString()
  },
  standardHeaders: config.rateLimit.standardHeaders,
  legacyHeaders: config.rateLimit.legacyHeaders,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    
    res.status(429).json({
      success: false,
      message: config.rateLimit.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate limiter más estricto para autenticación
 */
const authLimiter = (config.nodeEnv === 'test' || process.env.DISABLE_RATE_LIMITING === 'true') ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'test' ? 100 : 5, // más permisivo en testing
  message: {
    success: false,
    message: 'Demasiados intentos de login, intenta de nuevo en 15 minutos',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de login, intenta de nuevo en 15 minutos',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate limiter para operaciones de escritura
 * Deshabilitado en entorno de pruebas
 */
const writeLimiter = (config.nodeEnv === 'test' || process.env.DISABLE_RATE_LIMITING === 'true') ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 operaciones de escritura por IP por ventana
  message: {
    success: false,
    message: 'Demasiadas operaciones de escritura, intenta de nuevo más tarde',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Write rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    
    res.status(429).json({
      success: false,
      message: 'Demasiadas operaciones de escritura, intenta de nuevo más tarde',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate limiter para operaciones de administración
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // máximo 50 operaciones de admin por IP por ventana
  message: {
    success: false,
    message: 'Demasiadas operaciones de administración, intenta de nuevo más tarde',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Admin rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    
    res.status(429).json({
      success: false,
      message: 'Demasiadas operaciones de administración, intenta de nuevo más tarde',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  writeLimiter,
  adminLimiter
};

