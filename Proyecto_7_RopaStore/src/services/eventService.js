const Event = require('../models/EventModel');
const logger = require('../utils/logger');

class EventService {
  /**
   * Crear un nuevo evento
   * @param {Object} eventData - Datos del evento
   * @param {string} createdBy - ID del usuario que crea el evento
   * @returns {Promise<Object>} Evento creado
   */
  static async createEvent(eventData, createdBy) {
    try {
      const event = new Event({
        ...eventData,
        createdBy
      });

      await event.save();

      logger.info('Evento creado exitosamente', {
        eventId: event._id,
        title: event.title,
        createdBy
      });

      return event;
    } catch (error) {
      logger.error('Error al crear evento', { error: error.message, eventData, createdBy });
      throw error;
    }
  }

  /**
   * Obtener todos los eventos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Lista de eventos con paginación
   */
  static async getAllEvents(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        startDate,
        endDate,
        isActive = true,
        sortBy = 'startDate',
        sortOrder = 'asc'
      } = options;

      // Construir query
      const query = { isActive };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { organizer: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) query.startDate.$gte = new Date(startDate);
        if (endDate) query.startDate.$lte = new Date(endDate);
      }

      // Configurar paginación
      const skip = (page - 1) * limit;

      // Configurar ordenamiento
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const events = await Event.find(query)
        .populate('createdBy', 'username email')
        .populate('updatedBy', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Event.countDocuments(query);

      logger.info('Eventos obtenidos', {
        count: events.length,
        total,
        page,
        limit,
        filters: { search, startDate, endDate, isActive }
      });

      return {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error al obtener eventos', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Obtener evento por ID
   * @param {string} eventId - ID del evento
   * @returns {Promise<Object>} Evento encontrado
   */
  static async getEventById(eventId) {
    try {
      const event = await Event.findById(eventId)
        .populate('createdBy', 'username email')
        .populate('updatedBy', 'username email')
        .populate('registrations.user', 'username email');

      if (!event) {
        throw new Error('Evento no encontrado');
      }

      return event;
    } catch (error) {
      logger.error('Error al obtener evento', { error: error.message, eventId });
      throw error;
    }
  }

  /**
   * Actualizar evento
   * @param {string} eventId - ID del evento
   * @param {Object} updateData - Datos a actualizar
   * @param {string} updatedBy - ID del usuario que actualiza
   * @param {string} userRole - Rol del usuario que actualiza
   * @returns {Promise<Object>} Evento actualizado
   */
  static async updateEvent(eventId, updateData, updatedBy, userRole) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Evento no encontrado');
      }

      // Verificar permisos
      if (userRole !== 'admin' && event.createdBy.toString() !== updatedBy) {
        throw new Error('No tienes permisos para editar este evento');
      }

      // Actualizar evento
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { 
          ...updateData,
          updatedBy
        },
        { new: true, runValidators: true }
      ).populate('createdBy', 'username email')
       .populate('updatedBy', 'username email');

      logger.info('Evento actualizado exitosamente', {
        eventId,
        updatedFields: Object.keys(updateData),
        updatedBy,
        userRole
      });

      return updatedEvent;
    } catch (error) {
      logger.error('Error al actualizar evento', { 
        error: error.message, 
        eventId, 
        updateData, 
        updatedBy, 
        userRole 
      });
      throw error;
    }
  }

  /**
   * Eliminar evento
   * @param {string} eventId - ID del evento
   * @param {string} deletedBy - ID del usuario que elimina
   * @param {string} userRole - Rol del usuario que elimina
   * @returns {Promise<Object>} Evento eliminado
   */
  static async deleteEvent(eventId, deletedBy, userRole) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Evento no encontrado');
      }

      // Verificar permisos
      if (userRole !== 'admin' && event.createdBy.toString() !== deletedBy) {
        throw new Error('No tienes permisos para eliminar este evento');
      }

      // Soft delete - marcar como inactivo
      const deletedEvent = await Event.findByIdAndUpdate(
        eventId,
        { 
          isActive: false,
          updatedBy: deletedBy
        },
        { new: true }
      );

      logger.info('Evento eliminado exitosamente', {
        eventId,
        deletedBy,
        userRole
      });

      return deletedEvent;
    } catch (error) {
      logger.error('Error al eliminar evento', { 
        error: error.message, 
        eventId, 
        deletedBy, 
        userRole 
      });
      throw error;
    }
  }

  /**
   * Registrar usuario en evento
   * @param {string} eventId - ID del evento
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Evento actualizado
   */
  static async registerUserForEvent(eventId, userId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Evento no encontrado');
      }

      if (!event.isActive) {
        throw new Error('El evento no está disponible');
      }

      await event.registerUser(userId);

      logger.info('Usuario registrado en evento', {
        eventId,
        userId
      });

      return event;
    } catch (error) {
      logger.error('Error al registrar usuario en evento', { 
        error: error.message, 
        eventId, 
        userId 
      });
      throw error;
    }
  }

  /**
   * Cancelar registro de usuario en evento
   * @param {string} eventId - ID del evento
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Evento actualizado
   */
  static async cancelUserRegistration(eventId, userId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Evento no encontrado');
      }

      await event.cancelRegistration(userId);

      logger.info('Registro de usuario cancelado en evento', {
        eventId,
        userId
      });

      return event;
    } catch (error) {
      logger.error('Error al cancelar registro de usuario', { 
        error: error.message, 
        eventId, 
        userId 
      });
      throw error;
    }
  }

  /**
   * Obtener eventos próximos
   * @param {number} limit - Límite de eventos
   * @returns {Promise<Array>} Eventos próximos
   */
  static async getUpcomingEvents(limit = 10) {
    try {
      const events = await Event.getUpcomingEvents(limit);

      logger.info('Eventos próximos obtenidos', {
        count: events.length,
        limit
      });

      return events;
    } catch (error) {
      logger.error('Error al obtener eventos próximos', { error: error.message, limit });
      throw error;
    }
  }

  /**
   * Obtener eventos por rango de fechas
   * @param {Date} startDate - Fecha de inicio
   * @param {Date} endDate - Fecha de fin
   * @returns {Promise<Array>} Eventos en el rango
   */
  static async getEventsByDateRange(startDate, endDate) {
    try {
      const events = await Event.getEventsByDateRange(startDate, endDate);

      logger.info('Eventos obtenidos por rango de fechas', {
        startDate,
        endDate,
        count: events.length
      });

      return events;
    } catch (error) {
      logger.error('Error al obtener eventos por rango de fechas', { 
        error: error.message, 
        startDate, 
        endDate 
      });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de eventos
   * @returns {Promise<Object>} Estadísticas de eventos
   */
  static async getEventStats() {
    try {
      const stats = await Event.aggregate([
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            activeEvents: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            totalRegistrations: {
              $sum: { $size: '$registrations' }
            }
          }
        }
      ]);

      const upcomingEvents = await Event.countDocuments({
        isActive: true,
        startDate: { $gte: new Date() }
      });

      const pastEvents = await Event.countDocuments({
        isActive: true,
        endDate: { $lt: new Date() }
      });

      return {
        ...stats[0],
        upcomingEvents,
        pastEvents
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas de eventos', { error: error.message });
      throw error;
    }
  }
}

module.exports = EventService;

