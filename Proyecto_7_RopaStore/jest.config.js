module.exports = {
  // Configuración para pruebas de backend
  testEnvironment: 'node',
  
  // Directorio de pruebas
  testMatch: [
    '**/testing/backend/**/*.test.js'
  ],
  
  // Configuración de setup y teardown
  setupFilesAfterEnv: ['<rootDir>/testing/setup.js'],
  
  // Configuración de cobertura
  collectCoverage: false,
  
  // Configuración de timeouts
  testTimeout: 30000,
  
  // Configuración de workers
  maxWorkers: 1,
  
  // Configuración de verbose
  verbose: true,
  
  // Permitir logs durante las pruebas
  silent: false,
  
  // Configuración de forceExit para evitar que Jest se cuelgue
  forceExit: true,
  
  // Configuración de clearMocks
  clearMocks: true,
  restoreMocks: true,
  
  // Configuración de setupFiles - usar base de datos principal
  setupFiles: ['<rootDir>/testing/setup-main-db.js']
};