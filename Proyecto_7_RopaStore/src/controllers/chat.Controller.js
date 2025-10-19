const ChatService = require('../services/chatService');
const ResponseFactory = require('../utils/response');
const { asyncHandler } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

/**
 * Crear nuevo chat
 */
exports.createChat = asyncHandler(async (req, res) => {
  const chatData = req.body;
  const userId = req.user.id;

  const result = await ChatService.createChat(chatData, userId);
  
  ResponseFactory.success(res, result, 'Chat creado exitosamente', 201);
});

/**
 * Obtener chats del usuario
 */
exports.getUserChats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await ChatService.getUserChats(userId);
  
  ResponseFactory.success(res, result, 'Chats obtenidos exitosamente');
});

/**
 * Obtener chat por ID
 */
exports.getChatById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await ChatService.getChatById(id, userId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Chat obtenido exitosamente');
});

/**
 * Enviar mensaje
 */
exports.sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const messageData = req.body;
  const userId = req.user.id;

  const result = await ChatService.sendMessage(chatId, messageData, userId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 400);
  }

  ResponseFactory.success(res, result, 'Mensaje enviado exitosamente');
});

/**
 * Obtener mensajes de un chat
 */
exports.getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { page = 1, limit = 50, before, after } = req.query;
  const userId = req.user.id;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    before,
    after
  };

  const result = await ChatService.getChatMessages(chatId, userId, options);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Mensajes obtenidos exitosamente');
});

/**
 * Asignar chat a agente (solo admin/soporte)
 */
exports.assignChatToAgent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { agentId } = req.body;

  if (!agentId) {
    return ResponseFactory.error(res, 'ID del agente es requerido', 400);
  }

  const result = await ChatService.assignChatToAgent(id, agentId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 400);
  }

  ResponseFactory.success(res, result, 'Chat asignado exitosamente');
});

/**
 * Cerrar chat
 */
exports.closeChat = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { resolution } = req.body;
  const userId = req.user.id;

  const result = await ChatService.closeChat(id, userId, resolution);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 400);
  }

  ResponseFactory.success(res, result, 'Chat cerrado exitosamente');
});

/**
 * Obtener chats activos (solo admin/soporte)
 */
exports.getActiveChats = asyncHandler(async (req, res) => {
  const result = await ChatService.getActiveChats();
  
  ResponseFactory.success(res, result, 'Chats activos obtenidos exitosamente');
});

/**
 * Obtener estadísticas de chat (solo admin)
 */
exports.getChatStats = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const result = await ChatService.getChatStats(parseInt(days));
  
  ResponseFactory.success(res, result, 'Estadísticas de chat obtenidas exitosamente');
});

/**
 * Obtener mensajes no leídos
 */
exports.getUnreadMessages = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await ChatService.getUnreadMessages(userId);
  
  ResponseFactory.success(res, result, 'Mensajes no leídos obtenidos exitosamente');
});

/**
 * Marcar mensaje como leído
 */
exports.markMessageAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  const result = await ChatService.markMessageAsRead(messageId, userId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Mensaje marcado como leído');
});

/**
 * Editar mensaje
 */
exports.editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { message } = req.body;
  const userId = req.user.id;

  if (!message) {
    return ResponseFactory.error(res, 'El mensaje es requerido', 400);
  }

  const result = await ChatService.editMessage(messageId, message, userId);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 400);
  }

  ResponseFactory.success(res, result, 'Mensaje editado exitosamente');
});

/**
 * Obtener chat por ID para administración
 */
exports.getChatForAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await ChatService.getChatById(id, req.user.id);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Chat obtenido exitosamente');
});

/**
 * Obtener mensajes de chat para administración
 */
exports.getChatMessagesForAdmin = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { page = 1, limit = 50, before, after } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    before,
    after
  };

  const result = await ChatService.getChatMessages(chatId, req.user.id, options);
  
  if (!result.success) {
    return ResponseFactory.error(res, result.error, 404);
  }

  ResponseFactory.success(res, result, 'Mensajes obtenidos exitosamente');
});
