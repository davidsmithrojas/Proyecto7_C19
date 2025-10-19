const mongoose = require('mongoose');
const config = require('./environment');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        await mongoose.connect(config.database.uri, config.database.options);
        logger.info('MongoDB conectado exitosamente', {
            uri: config.database.uri,
            environment: config.nodeEnv
        });
        
        // Configurar eventos de conexión
        mongoose.connection.on('error', (err) => {
            logger.error('Error de conexión a MongoDB:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB desconectado');
        });
        
        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconectado');
        });
        
    } catch (error) {
        logger.error('Error al conectar a MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;