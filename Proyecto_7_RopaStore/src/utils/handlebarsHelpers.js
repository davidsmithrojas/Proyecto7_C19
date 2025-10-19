const handlebars = require('handlebars');

// Helper para multiplicar dos números
handlebars.registerHelper('multiply', function(a, b) {
  return a * b;
});

// Helper para comparar valores
handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

// Helper para formatear fechas
handlebars.registerHelper('formatDate', function(date) {
  return new Date(date).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Helper para formatear moneda
handlebars.registerHelper('formatCurrency', function(amount) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount);
});

// Helper para capitalizar texto
handlebars.registerHelper('capitalize', function(str) {
  if (typeof str === 'string') {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return str;
});

// Helper para truncar texto
handlebars.registerHelper('truncate', function(str, len) {
  if (str && str.length > len) {
    return str.substring(0, len) + '...';
  }
  return str;
});

module.exports = handlebars;
