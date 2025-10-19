const EventService = require('../services/eventService');
const ResponseFactory = require('../utils/response');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Obtener todos los eventos
 */
exports.getAllEvents = asyncHandler(async (req, res) => {
  const options = {
    page: req.query.page || 1,
    limit: req.query.limit || 10,
    search: req.query.search,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    isActive: req.query.isActive !== 'false',
    sortBy: req.query.sortBy || 'startDate',
    sortOrder: req.query.sortOrder || 'asc'
  };

  const result = await EventService.getAllEvents(options);
  ResponseFactory.success(res, result, 'Eventos obtenidos exitosamente');
});

/**
 * Obtener evento por ID
 */
exports.getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await EventService.getEventById(id);
  ResponseFactory.success(res, { event }, 'Evento obtenido exitosamente');
});

/**
 * Crear evento
 */
exports.createEvent = asyncHandler(async (req, res) => {
  const eventData = req.body;
  const createdBy = req.user.id;
  const event = await EventService.createEvent(eventData, createdBy);
  ResponseFactory.created(res, event, 'Evento creado exitosamente');
});

/**
 * Actualizar evento
 */
exports.updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedBy = req.user.id;
  const userRole = req.user.role;
  const event = await EventService.updateEvent(id, updateData, updatedBy, userRole);
  ResponseFactory.updated(res, event, 'Evento actualizado exitosamente');
});

/**
 * Eliminar evento
 */
exports.deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedBy = req.user.id;
  const userRole = req.user.role;
  await EventService.deleteEvent(id, deletedBy, userRole);
  ResponseFactory.deleted(res, 'Evento eliminado exitosamente');
});

/**
 * Registrar usuario en evento
 */
exports.registerForEvent = asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;
  const userId = req.user.id;
  const event = await EventService.registerUserForEvent(eventId, userId);
  ResponseFactory.success(res, { event }, 'Registro en evento exitoso');
});

/**
 * Cancelar registro en evento
 */
exports.cancelRegistration = asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;
  const userId = req.user.id;
  const event = await EventService.cancelUserRegistration(eventId, userId);
  ResponseFactory.success(res, { event }, 'Registro cancelado exitosamente');
});

/**
 * Obtener eventos próximos
 */
exports.getUpcomingEvents = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 10;
  const events = await EventService.getUpcomingEvents(limit);
  ResponseFactory.success(res, { events }, 'Eventos próximos obtenidos');
});

/**
 * Obtener eventos por rango de fechas
 */
exports.getEventsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return ResponseFactory.error(res, 'Fechas de inicio y fin son requeridas', 400);
  }

  const events = await EventService.getEventsByDateRange(new Date(startDate), new Date(endDate));
  ResponseFactory.success(res, { events }, 'Eventos por rango de fechas obtenidos');
});

/**
 * Obtener estadísticas de eventos
 */
exports.getEventStats = asyncHandler(async (req, res) => {
  const stats = await EventService.getEventStats();
  ResponseFactory.success(res, stats, 'Estadísticas de eventos obtenidas');
});