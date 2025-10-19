const mongoose = require('mongoose');
const User = require('../src/models/userModel');

async function verifyUsers() {
  try {
    // Conectar a la base de datos
    await mongoose.connect('mongodb://localhost:27017/proyecto_6_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔍 Verificando usuarios en la base de datos...');

    // Buscar usuarios
    const users = await User.find({}, 'username email role isActive');
    
    console.log(`📊 Total de usuarios encontrados: ${users.length}`);
    
    users.forEach(user => {
      console.log(`👤 ${user.username} (${user.email}) - Rol: ${user.role} - Activo: ${user.isActive}`);
    });

    // Verificar usuarios específicos
    const adminUser = await User.findOne({ email: 'useradmin@test.com' });
    const testUser = await User.findOne({ email: 'usertest@test.com' });

    console.log('\n✅ Verificación de usuarios específicos:');
    console.log(`Admin: ${adminUser ? '✅ Encontrado' : '❌ No encontrado'}`);
    console.log(`Test: ${testUser ? '✅ Encontrado' : '❌ No encontrado'}`);

    if (adminUser) {
      console.log(`   - Username: ${adminUser.username}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Rol: ${adminUser.role}`);
    }

    if (testUser) {
      console.log(`   - Username: ${testUser.username}`);
      console.log(`   - Email: ${testUser.email}`);
      console.log(`   - Rol: ${testUser.role}`);
    }
    
  } catch (error) {
    console.error('❌ Error verificando usuarios:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

verifyUsers();
