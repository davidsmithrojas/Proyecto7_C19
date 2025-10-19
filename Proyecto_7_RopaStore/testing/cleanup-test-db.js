const mongoose = require('mongoose');

async function cleanupTestDatabase() {
  try {
    // Conectar a la base de datos de testing
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🧹 Limpiando base de datos de testing...');

    // Obtener todas las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Eliminar todas las colecciones
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).drop();
      console.log(`✅ Colección ${collection.name} eliminada`);
    }

    console.log('🎉 Base de datos de testing limpiada exitosamente');
    
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

cleanupTestDatabase();
