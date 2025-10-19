// Configuración de entorno para pruebas
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/proyecto_6_db_test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_purposes_only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_AUDIENCE = 'proyecto_6_users';
process.env.JWT_ISSUER = 'proyecto_6_api';

// Configuración de email para pruebas (deshabilitado)
process.env.EMAIL_HOST = '';
process.env.EMAIL_PORT = '';
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';

// Configuración de Stripe para pruebas
process.env.STRIPE_SECRET_KEY = 'sk_test_51234567890abcdef';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890abcdef';
