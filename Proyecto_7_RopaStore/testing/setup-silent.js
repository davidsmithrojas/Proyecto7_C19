// Configuración para suprimir logs durante las pruebas
const mongoose = require('mongoose');

// Suprimir logs de dotenv
process.env.DOTENV_CONFIG_QUIET = 'true';

// Suprimir warnings de Mongoose
mongoose.set('debug', false);

// Suprimir warnings de Node.js sobre Mongoose
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  // Suprimir warnings de Mongoose y MongoDB
  if (warning.name === 'Warning' && 
      (warning.message.includes('Mongoose') || 
       warning.message.includes('MONGODB DRIVER') ||
       warning.message.includes('Duplicate schema index'))) {
    return;
  }
  // Mostrar otros warnings importantes
  console.warn(warning);
});

// Suprimir logs de Mongoose directamente
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suprimir warnings de Mongoose
  if (args.some(arg => typeof arg === 'string' && 
    (arg.includes('Mongoose') || arg.includes('MONGODB DRIVER')))) {
    return;
  }
  originalConsoleError(...args);
};

// Suprimir logs de console durante las pruebas
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

    // Permitir todos los console.log temporalmente para debugging
    console.log = (...args) => {
      originalConsoleLog(...args);
    };

console.warn = (...args) => {
  // Suprimir warnings de Mongoose y dotenv
  if (args.some(arg => typeof arg === 'string' && 
    (arg.includes('Mongoose') || arg.includes('dotenv') || arg.includes('MONGODB DRIVER')))) {
    return;
  }
  originalConsoleWarn(...args);
};

console.info = (...args) => {
  // Suprimir info de dotenv
  if (args.some(arg => typeof arg === 'string' && arg.includes('dotenv'))) {
    return;
  }
  originalConsoleInfo(...args);
};

// Restaurar console al finalizar
afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.info = originalConsoleInfo;
});
