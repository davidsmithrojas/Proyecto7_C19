#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config/environment');
const logger = require('../utils/logger');
const { seedDatabase } = require('./seed');

// Función para conectar a la base de datos
async function connectToDatabase() {
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    logger.info('✅ Conectado a MongoDB');
  } catch (error) {
    logger.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Función principal
async function main() {
  try {
    logger.info('🌱 Iniciando proceso de inicialización manual...');
    
    // Conectar a la base de datos
    await connectToDatabase();
    
    // Ejecutar seed
    await seedDatabase();
    
    logger.info('🎉 Proceso de inicialización completado exitosamente');
    
  } catch (error) {
    logger.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    logger.info('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };

