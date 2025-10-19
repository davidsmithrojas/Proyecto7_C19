/**
 * Factory Pattern para crear respuestas consistentes de la API
 */
class ResponseFactory {
  /**
   * Respuesta exitosa
   * @param {Object} res - Objeto response de Express
   * @param {*} data - Datos a enviar
   * @param {string} message - Mensaje de éxito
   * @param {number} statusCode - Código de estado HTTP
   */
  static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data })
    };
    
    return res.status(statusCode).json(response);
  }

  /**
   * Respuesta de error
   * @param {Object} res - Objeto response de Express
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - Código de estado HTTP
   * @param {*} details - Detalles adicionales del error
   */
  static error(res, message = 'Error interno del servidor', statusCode = 500, details = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      ...(details && { details })
    };
    
    return res.status(statusCode).json(response);
  }

  /**
   * Respuesta de validación
   * @param {Object} res - Objeto response de Express
   * @param {Array} errors - Array de errores de validación
   */
  static validationError(res, errors) {
    return this.error(res, 'Error de validación', 400, { errors });
  }

  /**
   * Respuesta de autenticación
   * @param {Object} res - Objeto response de Express
   * @param {string} message - Mensaje de error de autenticación
   */
  static unauthorized(res, message = 'No autorizado') {
    return this.error(res, message, 401);
  }

  /**
   * Respuesta de autorización
   * @param {Object} res - Objeto response de Express
   * @param {string} message - Mensaje de error de autorización
   */
  static forbidden(res, message = 'Acceso denegado') {
    return this.error(res, message, 403);
  }

  /**
   * Respuesta de recurso no encontrado
   * @param {Object} res - Objeto response de Express
   * @param {string} message - Mensaje de recurso no encontrado
   */
  static notFound(res, message = 'Recurso no encontrado') {
    return this.error(res, message, 404);
  }

  /**
   * Respuesta de conflicto
   * @param {Object} res - Objeto response de Express
   * @param {string} message - Mensaje de conflicto
   */
  static conflict(res, message = 'Conflicto con el estado actual') {
    return this.error(res, message, 409);
  }

  /**
   * Respuesta de creación exitosa
   * @param {Object} res - Objeto response de Express
   * @param {*} data - Datos del recurso creado
   * @param {string} message - Mensaje de éxito
   */
  static created(res, data, message = 'Recurso creado exitosamente') {
    return this.success(res, data, message, 201);
  }

  /**
   * Respuesta de actualización exitosa
   * @param {Object} res - Objeto response de Express
   * @param {*} data - Datos del recurso actualizado
   * @param {string} message - Mensaje de éxito
   */
  static updated(res, data, message = 'Recurso actualizado exitosamente') {
    return this.success(res, data, message, 200);
  }

  /**
   * Respuesta de eliminación exitosa
   * @param {Object} res - Objeto response de Express
   * @param {string} message - Mensaje de éxito
   */
  static deleted(res, message = 'Recurso eliminado exitosamente') {
    return this.success(res, null, message, 200);
  }
}

module.exports = ResponseFactory;

