const UserService = require('../services/userService');
const ResponseFactory = require('../utils/response');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Solicitar cambio de rol
 */
exports.requestRole = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { motivation } = req.body;
  const request = await UserService.requestRoleChange(userId, motivation);
  ResponseFactory.created(res, request, 'Solicitud de cambio de rol enviada');
});

/**
 * Obtener solicitudes de rol pendientes (solo admin)
 */
exports.getRoleRequests = asyncHandler(async (req, res) => {
  const requests = await UserService.getPendingRoleRequests();
  ResponseFactory.success(res, requests, 'Solicitudes obtenidas');
});

/**
 * Procesar solicitud de rol (aprobar/rechazar)
 */
exports.handleRoleRequest = asyncHandler(async (req, res) => {
  const { id: requestId } = req.params;
  const { decision } = req.body;
  const adminId = req.user.id;
  const request = await UserService.handleRoleRequest(requestId, decision, adminId);
  
  const message = decision === 'approved' 
    ? 'Solicitud aprobada exitosamente' 
    : 'Solicitud rechazada exitosamente';
    
  ResponseFactory.success(res, request, message);
});

