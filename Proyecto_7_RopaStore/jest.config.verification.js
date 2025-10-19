module.exports = {
  // Configuración específica para test-data-verification.test.js
  testEnvironment: 'node',
  
  // Solo ejecutar el archivo de verificación
  testMatch: [
    '**/testing/backend/test-data-verification.test.js'
  ],
  
  // Configuración de setup específica para verificación
  setupFilesAfterEnv: ['<rootDir>/testing/setup-verification.js'],
  
  // Configuración de cobertura
  collectCoverage: false,
  
  // Configuración de timeouts
  testTimeout: 30000,
  
  // Configuración de workers
  maxWorkers: 1,
  
  // Configuración de verbose
  verbose: true,
  
  // Configuración de forceExit para evitar que Jest se cuelgue
  forceExit: true,
  
  // Configuración de clearMocks
  clearMocks: true,
  restoreMocks: true,
};