const ResponseFactory = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Middleware de autorización por roles mejorado
 * @param {...string} roles - Roles permitidos
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.role) {
        logger.warn('Intento de acceso sin autenticación', {
          ip: req.ip,
          url: req.originalUrl,
          userAgent: req.get('User-Agent')
        });
        return ResponseFactory.unauthorized(res, 'Autenticación requerida');
      }

      // Verificar que el rol del usuario esté en la lista de roles permitidos
      if (!roles.includes(req.user.role)) {
        logger.warn('Acceso denegado por rol insuficiente', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: roles,
          ip: req.ip,
          url: req.originalUrl
        });
        return ResponseFactory.forbidden(res, `Acceso denegado. Roles requeridos: ${roles.join(', ')}`);
      }

      logger.info('Acceso autorizado', {
        userId: req.user.id,
        userRole: req.user.role,
        ip: req.ip,
        url: req.originalUrl
      });

      next();
    } catch (error) {
      logger.error('Error en autorización', {
        error: error.message,
        ip: req.ip,
        url: req.originalUrl
      });
      return ResponseFactory.error(res, 'Error de autorización');
    }
  };
};

/**
 * Middleware para verificar que el usuario es admin
 */
const requireAdmin = authorizeRoles('admin');

/**
 * Middleware para verificar que el usuario es admin o superuser
 */
const requireAdminOrSuperuser = authorizeRoles('admin', 'superuser');

/**
 * Middleware para verificar que el usuario es superuser
 */
const requireSuperuser = authorizeRoles('superuser');

/**
 * Middleware para verificar que el usuario es el propietario del recurso o admin
 * @param {string} userIdField - Campo que contiene el ID del usuario propietario
 */
const requireOwnerOrAdmin = (userIdField = 'createdBy') => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return ResponseFactory.unauthorized(res, 'Autenticación requerida');
      }

      // Admin puede acceder a todo
      if (req.user.role === 'admin') {
        return next();
      }

      // Obtener el ID del propietario del recurso
      const resourceUserId = req.params[userIdField] || req.body[userIdField];
      
      if (!resourceUserId) {
        logger.warn('No se pudo determinar el propietario del recurso', {
          userId: req.user.id,
          url: req.originalUrl,
          params: req.params,
          body: req.body
        });
        return ResponseFactory.forbidden(res, 'No se pudo verificar la propiedad del recurso');
      }

      // Verificar que el usuario es el propietario
      if (req.user.id !== resourceUserId.toString()) {
        logger.warn('Intento de acceso a recurso de otro usuario', {
          userId: req.user.id,
          resourceUserId,
          url: req.originalUrl
        });
        return ResponseFactory.forbidden(res, 'Solo puedes acceder a tus propios recursos');
      }

      next();
    } catch (error) {
      logger.error('Error en verificación de propiedad', {
        error: error.message,
        ip: req.ip,
        url: req.originalUrl
      });
      return ResponseFactory.error(res, 'Error de autorización');
    }
  };
};

module.exports = {
  authorizeRoles,
  requireAdmin,
  requireAdminOrSuperuser,
  requireSuperuser,
  requireOwnerOrAdmin
};