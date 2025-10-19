const { validate, validators } = require('../utils/validators');

/**
 * Middlewares de validación para diferentes entidades
 */
const validation = {
  // Validaciones de Usuario
  user: {
    register: validate(validators.user.register),
    login: validate(validators.user.login),
    update: validate(validators.user.update)
  },

  // Validaciones de Producto
  product: {
    create: validate(validators.product.create),
    update: validate(validators.product.update)
  },

  // Validaciones de Evento
  event: {
    create: validate(validators.event.create),
    update: validate(validators.event.update)
  },

  // Validaciones de Carrito
  cart: {
    create: validate(validators.cart.create)
  },

  // Validaciones de Solicitud de Rol
  roleRequest: {
    create: validate(validators.roleRequest.create),
    handle: validate(validators.roleRequest.handle)
  }
};

module.exports = validation;

