const Joi = require('joi');

/**
 * Esquemas de validación para diferentes entidades
 */
const validators = {
  // Validaciones de Usuario
  user: {
    register: Joi.object({
      username: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .required()
        .messages({
          'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
          'string.max': 'El nombre de usuario no puede exceder 50 caracteres',
          'any.required': 'El nombre de usuario es requerido'
        }),
      email: Joi.string()
        .email()
        .lowercase()
        .required()
        .messages({
          'string.email': 'Por favor ingresa un email válido',
          'any.required': 'El email es requerido'
        }),
      password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
        .required()
        .messages({
          'string.min': 'La contraseña debe tener al menos 8 caracteres',
          'string.pattern.base': 'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial',
          'any.required': 'La contraseña es requerida'
        }),
      role: Joi.string()
        .valid('user', 'admin', 'superuser')
        .default('user')
    }),

    login: Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Por favor ingresa un email válido',
          'any.required': 'El email es requerido'
        }),
      password: Joi.string()
        .required()
        .messages({
          'any.required': 'La contraseña es requerida'
        })
    }),

    update: Joi.object({
      username: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .optional(),
      email: Joi.string()
        .email()
        .lowercase()
        .optional(),
      password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
        .optional()
    }).min(1).messages({
      'object.min': 'Debe proporcionar al menos un campo para actualizar'
    })
  },

  // Validaciones de Producto
  product: {
    create: Joi.object({
      name: Joi.string()
        .min(1)
        .max(100)
        .trim()
        .required()
        .messages({
          'string.min': 'El nombre del producto es requerido',
          'string.max': 'El nombre no puede exceder 100 caracteres',
          'any.required': 'El nombre del producto es requerido'
        }),
      description: Joi.string()
        .min(1)
        .max(500)
        .trim()
        .required()
        .messages({
          'string.min': 'La descripción es requerida',
          'string.max': 'La descripción no puede exceder 500 caracteres',
          'any.required': 'La descripción es requerida'
        }),
      price: Joi.number()
        .min(0)
        .precision(2)
        .required()
        .messages({
          'number.min': 'El precio no puede ser negativo',
          'any.required': 'El precio es requerido'
        }),
      category: Joi.string()
        .valid('Camisas', 'Pantalones', 'Zapatos', 'Juego de mesa', 'Reserva', 'Cuentos', 'otro')
        .required()
        .messages({
          'any.only': 'La categoría debe ser una de: Camisas, Pantalones, Zapatos, Juego de mesa, Reserva, Cuentos, otro',
          'any.required': 'La categoría es requerida'
        }),
      code: Joi.string()
        .min(3)
        .max(20)
        .trim()
        .uppercase()
        .required()
        .messages({
          'string.min': 'El código debe tener al menos 3 caracteres',
          'string.max': 'El código no puede exceder 20 caracteres',
          'any.required': 'El código del producto es requerido'
        }),
      sizes: Joi.alternatives()
        .try(
          Joi.array().items(Joi.string().trim()).min(1),
          Joi.string().custom((value, helpers) => {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
              }
              return helpers.error('any.invalid');
            } catch (e) {
              return helpers.error('any.invalid');
            }
          })
        )
        .required()
        .messages({
          'alternatives.match': 'Los tamaños deben ser un array válido',
          'any.required': 'Los tamaños son requeridos'
        }),
      colors: Joi.alternatives()
        .try(
          Joi.array().items(Joi.string().trim()).min(1),
          Joi.string().custom((value, helpers) => {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
              }
              return helpers.error('any.invalid');
            } catch (e) {
              return helpers.error('any.invalid');
            }
          })
        )
        .required()
        .messages({
          'alternatives.match': 'Los colores deben ser un array válido',
          'any.required': 'Los colores son requeridos'
        }),
      stock: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
          'number.min': 'El stock no puede ser negativo',
          'any.required': 'El stock es requerido'
        }),
      isActive: Joi.boolean()
        .default(true)
    }),

    update: Joi.object({
      name: Joi.string()
        .min(1)
        .max(100)
        .trim()
        .optional(),
      description: Joi.string()
        .min(1)
        .max(500)
        .trim()
        .optional(),
      price: Joi.number()
        .min(0)
        .precision(2)
        .optional(),
      category: Joi.string()
        .valid('Camisas', 'Pantalones', 'Zapatos', 'Juego de mesa', 'Reserva', 'Cuentos', 'otro')
        .optional(),
      code: Joi.string()
        .min(3)
        .max(20)
        .trim()
        .uppercase()
        .optional(),
      sizes: Joi.alternatives()
        .try(
          Joi.array().items(Joi.string().trim()).min(1),
          Joi.string().custom((value, helpers) => {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
              }
              return helpers.error('any.invalid');
            } catch (e) {
              return helpers.error('any.invalid');
            }
          })
        )
        .optional()
        .messages({
          'alternatives.match': 'Los tamaños deben ser un array válido'
        }),
      colors: Joi.alternatives()
        .try(
          Joi.array().items(Joi.string().trim()).min(1),
          Joi.string().custom((value, helpers) => {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
              }
              return helpers.error('any.invalid');
            } catch (e) {
              return helpers.error('any.invalid');
            }
          })
        )
        .optional()
        .messages({
          'alternatives.match': 'Los colores deben ser un array válido'
        }),
      stock: Joi.number()
        .integer()
        .min(0)
        .optional(),
      isActive: Joi.boolean()
        .optional()
    }).min(1).messages({
      'object.min': 'Debe proporcionar al menos un campo para actualizar'
    })
  },

  // Validaciones de Evento
  event: {
    create: Joi.object({
      title: Joi.string()
        .min(1)
        .max(100)
        .trim()
        .required()
        .messages({
          'string.min': 'El título es requerido',
          'string.max': 'El título no puede exceder 100 caracteres',
          'any.required': 'El título es requerido'
        }),
      description: Joi.string()
        .min(1)
        .max(1000)
        .trim()
        .required()
        .messages({
          'string.min': 'La descripción es requerida',
          'string.max': 'La descripción no puede exceder 1000 caracteres',
          'any.required': 'La descripción es requerida'
        }),
      organizer: Joi.string()
        .min(1)
        .max(100)
        .trim()
        .required()
        .messages({
          'string.min': 'El organizador es requerido',
          'string.max': 'El organizador no puede exceder 100 caracteres',
          'any.required': 'El organizador es requerido'
        }),
      location: Joi.string()
        .min(1)
        .max(200)
        .trim()
        .required()
        .messages({
          'string.min': 'La ubicación es requerida',
          'string.max': 'La ubicación no puede exceder 200 caracteres',
          'any.required': 'La ubicación es requerida'
        }),
      startDate: Joi.date()
        .iso()
        .required()
        .messages({
          'date.format': 'La fecha de inicio debe estar en formato ISO',
          'any.required': 'La fecha de inicio es requerida'
        }),
      endDate: Joi.date()
        .iso()
        .min(Joi.ref('startDate'))
        .required()
        .messages({
          'date.format': 'La fecha de fin debe estar en formato ISO',
          'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio',
          'any.required': 'La fecha de fin es requerida'
        }),
      startTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'El horario de inicio debe estar en formato HH:mm',
          'any.required': 'El horario de inicio es requerido'
        }),
      endTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          'string.pattern.base': 'El horario de fin debe estar en formato HH:mm',
          'any.required': 'El horario de fin es requerido'
        }),
      requiresRegistration: Joi.boolean()
        .default(false),
      price: Joi.number()
        .min(0)
        .precision(2)
        .default(0)
        .messages({
          'number.min': 'El precio no puede ser negativo'
        }),
      capacity: Joi.number()
        .integer()
        .min(1)
        .allow(null)
        .default(null)
        .messages({
          'number.min': 'La capacidad debe ser mayor a 0'
        }),
      tags: Joi.array()
        .items(Joi.string().trim())
        .default([])
    }),

    update: Joi.object({
      title: Joi.string()
        .min(1)
        .max(100)
        .trim()
        .optional(),
      description: Joi.string()
        .min(1)
        .max(1000)
        .trim()
        .optional(),
      organizer: Joi.string()
        .min(1)
        .max(100)
        .trim()
        .optional(),
      location: Joi.string()
        .min(1)
        .max(200)
        .trim()
        .optional(),
      startDate: Joi.date()
        .iso()
        .optional(),
      endDate: Joi.date()
        .iso()
        .optional(),
      startTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      endTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      requiresRegistration: Joi.boolean()
        .optional(),
      price: Joi.number()
        .min(0)
        .precision(2)
        .optional(),
      capacity: Joi.number()
        .integer()
        .min(1)
        .allow(null)
        .optional(),
      tags: Joi.array()
        .items(Joi.string().trim())
        .optional()
    }).min(1).messages({
      'object.min': 'Debe proporcionar al menos un campo para actualizar'
    })
  },

  // Validaciones de Carrito
  cart: {
    create: Joi.object({
      products: Joi.array()
        .items(Joi.object({
          quantity: Joi.number()
            .integer()
            .min(1)
            .required()
            .messages({
              'number.min': 'La cantidad debe ser mayor a 0',
              'any.required': 'La cantidad es requerida'
            }),
          priceID: Joi.string()
            .required()
            .messages({
              'any.required': 'El ID del precio es requerido'
            }),
          name: Joi.string()
            .required()
            .messages({
              'any.required': 'El nombre del producto es requerido'
            }),
          image: Joi.string()
            .uri()
            .required()
            .messages({
              'string.uri': 'La imagen debe ser una URL válida',
              'any.required': 'La imagen es requerida'
            }),
          price: Joi.number()
            .min(0)
            .precision(2)
            .required()
            .messages({
              'number.min': 'El precio no puede ser negativo',
              'any.required': 'El precio es requerido'
            }),
          slug: Joi.string()
            .required()
            .messages({
              'any.required': 'El slug es requerido'
            })
        }))
        .min(1)
        .required()
        .messages({
          'array.min': 'Debe incluir al menos un producto',
          'any.required': 'Los productos son requeridos'
        })
    })
  },

  // Validaciones de Solicitud de Rol
  roleRequest: {
    create: Joi.object({
      motivation: Joi.string()
        .min(10)
        .max(500)
        .trim()
        .required()
        .messages({
          'string.min': 'La motivación debe tener al menos 10 caracteres',
          'string.max': 'La motivación no puede exceder 500 caracteres',
          'any.required': 'La motivación es requerida'
        })
    }),

    handle: Joi.object({
      decision: Joi.string()
        .valid('approved', 'rejected')
        .required()
        .messages({
          'any.only': 'La decisión debe ser "approved" o "rejected"',
          'any.required': 'La decisión es requerida'
        })
    })
  }
};

/**
 * Middleware de validación genérico
 * @param {Object} schema - Esquema de validación de Joi
 * @param {string} property - Propiedad del request a validar ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors,
        timestamp: new Date().toISOString()
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = {
  validators,
  validate
};

