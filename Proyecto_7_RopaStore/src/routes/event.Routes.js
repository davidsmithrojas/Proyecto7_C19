
const express = require('express');
const { auth, optionalAuth } = require('../middlewares/auth');
const { requireAdminOrSuperuser, requireOwnerOrAdmin } = require('../middlewares/authRol');
const { generalLimiter, writeLimiter } = require('../middlewares/rateLimiter');
const validation = require('../middlewares/validation');
const eventRouter = express.Router();

// Importar controladores
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getUpcomingEvents,
  getEventsByDateRange,
  getEventStats
} = require('../controllers/Event.Controller');

// Rutas públicas
eventRouter.get('/',
  generalLimiter,
  getAllEvents
);

eventRouter.get('/upcoming',
  generalLimiter,
  getUpcomingEvents
);

eventRouter.get('/by-date-range',
  generalLimiter,
  getEventsByDateRange
);

eventRouter.get('/:id',
  generalLimiter,
  getEventById
);

// Rutas protegidas para registro en eventos
eventRouter.post('/:id/register',
  auth,
  generalLimiter,
  registerForEvent
);

eventRouter.delete('/:id/register',
  auth,
  generalLimiter,
  cancelRegistration
);

// Rutas protegidas para administración
eventRouter.post('/',
  auth,
  requireAdminOrSuperuser,
  writeLimiter,
  validation.event.create,
  createEvent
);

eventRouter.put('/:id',
  auth,
  requireAdminOrSuperuser,
  writeLimiter,
  validation.event.update,
  updateEvent
);

eventRouter.delete('/:id',
  auth,
  requireAdminOrSuperuser,
  writeLimiter,
  deleteEvent
);

eventRouter.get('/admin/stats',
  auth,
  requireAdminOrSuperuser,
  getEventStats
);

module.exports = eventRouter;