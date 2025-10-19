const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Importar modelos
const User = require('../src/models/userModel');
const Product = require('../src/models/productModel');
const Order = require('../src/models/orderModel');
const Cart = require('../src/models/CartModel');

// Función para crear datos de prueba
async function createTestData() {
  try {
    // Crear usuarios de prueba
    const testUsers = [
      {
        username: 'usertest',
        email: 'usertest@test.com',
        password: 'password',
        role: 'user',
        isActive: true
      },
      {
        username: 'useradmin',
        email: 'useradmin@test.com',
        password: 'password',
        role: 'admin',
        isActive: true
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Usuario creado: ${userData.username}`);
      }
    }

    // Crear productos de prueba
    const testProducts = [
      {
        name: 'Camisa Algodón Premium',
        description: 'Camisa de algodón de alta calidad',
        price: 25000,
        stock: 50,
        category: 'Camisas',
        code: 'CAM-001',
        isActive: true
      },
      {
        name: 'Pantalón Jeans Clásico',
        description: 'Pantalón jeans clásico',
        price: 35000,
        stock: 30,
        category: 'Pantalones',
        code: 'PAN-001',
        isActive: true
      },
      {
        name: 'Zapatos Oxford Formales',
        description: 'Zapatos Oxford para ocasiones formales',
        price: 45000,
        stock: 20,
        category: 'Zapatos',
        code: 'ZAP-001',
        isActive: true
      }
    ];

    for (const productData of testProducts) {
      const existingProduct = await Product.findOne({ code: productData.code });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Producto creado: ${productData.name}`);
      }
    }

    console.log('✅ Datos de prueba creados exitosamente');
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error.message);
    throw error;
  }
}

// Función para limpiar datos de prueba
async function cleanupTestData() {
  try {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    console.log('✅ Datos de prueba limpiados');
  } catch (error) {
    console.error('❌ Error limpiando datos de prueba:', error.message);
  }
}

module.exports = {
  createTestData,
  cleanupTestData
};
