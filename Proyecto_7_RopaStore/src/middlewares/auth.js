const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const logger = require('../utils/logger');
const ResponseFactory = require('../utils/response');

/**
 * Middleware de autenticación mejorado
 */
const auth = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    
    if (!authorization) {
      logger.warn('Intento de acceso sin token', {
        ip: req.ip,
        url: req.originalUrl,
        userAgent: req.get('User-Agent')
      });
      return ResponseFactory.unauthorized(res, 'Token de acceso requerido');
    }

    const [type, token] = authorization.split(' ');
    
    if (type !== 'Bearer' && type !== 'token') {
      logger.warn('Formato de token inválido', {
        ip: req.ip,
        url: req.originalUrl,
        type
      });
      return ResponseFactory.unauthorized(res, 'Formato de token inválido');
    }

    if (!token) {
      logger.warn('Token vacío', {
        ip: req.ip,
        url: req.originalUrl
      });
      return ResponseFactory.unauthorized(res, 'Token de acceso requerido');
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    });

    // Verificar que el token tenga la estructura esperada
    if (!decoded.id || !decoded.role) {
      logger.warn('Token con estructura inválida', {
        ip: req.ip,
        url: req.originalUrl,
        decoded
      });
      return ResponseFactory.unauthorized(res, 'Token inválido');
    }

    // Agregar información del usuario al request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };

    logger.info('Usuario autenticado', {
      userId: req.user.id,
      role: req.user.role,
      ip: req.ip,
      url: req.originalUrl
    });

    next();
  } catch (error) {
    logger.error('Error en autenticación', {
      error: error.message,
      ip: req.ip,
      url: req.originalUrl,
      userAgent: req.get('User-Agent')
    });

    if (error.name === 'TokenExpiredError') {
      return ResponseFactory.unauthorized(res, 'Token expirado');
    }
    
    if (error.name === 'JsonWebTokenError') {
      return ResponseFactory.unauthorized(res, 'Token inválido');
    }

    return ResponseFactory.unauthorized(res, 'Error de autenticación');
  }
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
const optionalAuth = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    
    if (!authorization) {
      return next();
    }

    const [type, token] = authorization.split(' ');
    
    if ((type === 'Bearer' || type === 'token') && token) {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience
      });

      if (decoded.id && decoded.role) {
        req.user = {
          id: decoded.id,
          role: decoded.role,
          iat: decoded.iat,
          exp: decoded.exp
        };
      }
    }
    
    next();
  } catch (error) {
    // En autenticación opcional, continuamos sin usuario
    next();
  }
};

module.exports = {
  auth,
  optionalAuth
};

