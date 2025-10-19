# 🛍️ Tienda de Ropa Online - E-commerce Completo

Una aplicación de comercio electrónico completa para una tienda de ropa online, construida con tecnologías modernas y siguiendo las mejores prácticas de desarrollo.

## 🎯 Características Principales

### Para Clientes
- **Catálogo de Productos**: Navegación intuitiva con filtros por categoría, talla, color y precio
- **Carrito de Compras**: Gestión completa con persistencia en localStorage
- **Autenticación Segura**: Registro e inicio de sesión con JWT
- **Perfil de Usuario**: Gestión completa de datos personales
- **Proceso de Pago**: Integración con Stripe para pagos seguros
- **Historial de Pedidos**: Seguimiento de compras realizadas
- **Diseño Responsive**: Optimizado para todos los dispositivos

### Para Administradores
- **Panel de Administración**: Dashboard con estadísticas en tiempo real
- **Gestión de Productos**: CRUD completo con imágenes y categorías
- **Gestión de Pedidos**: Administración de órdenes con estados
- **Gestión de Usuarios**: Administración de usuarios y roles
- **Estadísticas Avanzadas**: Métricas de ventas, usuarios y productos

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de JavaScript para interfaces de usuario
- **Vite** - Herramienta de construcción rápida
- **TailwindCSS** - Framework de CSS utilitario
- **React Router DOM** - Enrutamiento del lado del cliente
- **React Hook Form** - Manejo de formularios
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos SVG

### Backend
- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación con tokens
- **bcryptjs** - Hashing de contraseñas
- **Stripe** - Procesamiento de pagos
- **Joi** - Validación de datos
- **Winston** - Logging estructurado

## 📁 Estructura del Proyecto

```
ecommerce-ropa/
├── backend/                 # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/         # Configuración de la aplicación
│   │   ├── controllers/    # Controladores de la API
│   │   ├── middlewares/    # Middlewares personalizados
│   │   ├── models/         # Modelos de Mongoose
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Lógica de negocio
│   │   ├── utils/          # Utilidades y helpers
│   │   └── scripts/        # Scripts de inicialización
│   ├── package.json
│   └── README.md
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── context/        # Contextos de React
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── services/       # Servicios de API
│   │   └── utils/          # Utilidades
│   ├── package.json
│   └── README.md
├── images/                 # Imágenes de productos
└── README.md               # Este archivo
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- MongoDB (local o Atlas)
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd ecommerce-ropa
```

### 2. Configurar el Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar el archivo .env con tus configuraciones
npm run dev
```

### 3. Configurar el Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Inicializar la Base de Datos
```bash
cd backend
npm run seed
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Documentación API**: http://localhost:5000/api-docs

## 👥 Usuarios de Prueba

### Administrador
- **Email**: useradmin@test.com
- **Contraseña**: password

### Usuario Regular
- **Email**: usertest@test.com
- **Contraseña**: password

## 💳 Datos de Prueba para Pagos

- **Tarjeta de Prueba**: 4242 4242 4242 4242
- **CVV**: Cualquier número de 3 dígitos
- **Fecha de Vencimiento**: Cualquier fecha futura

## 🔧 Scripts Disponibles

### Backend
- `npm run dev` - Inicia el servidor en modo desarrollo
- `npm run start` - Inicia el servidor en modo producción
- `npm run seed` - Inicializa la base de datos con datos de prueba
- `npm run test` - Ejecuta las pruebas

### Frontend
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la construcción de producción

## 📊 Funcionalidades Implementadas

### ✅ Completadas
- [x] Autenticación y autorización con JWT
- [x] Gestión de usuarios con roles
- [x] Catálogo de productos con filtros
- [x] Carrito de compras con persistencia
- [x] Proceso de checkout
- [x] Panel de administración
- [x] Gestión de pedidos
- [x] Diseño responsive
- [x] Validación de formularios
- [x] Manejo de errores
- [x] Logging estructurado
- [x] Rate limiting
- [x] CORS configurado
- [x] Middleware de seguridad

### ✅ Nuevas Funcionalidades Implementadas
- [x] **Gestión de Inventario en Tiempo Real**: Sistema completo de seguimiento de stock con historial de movimientos, alertas de stock bajo y estadísticas en tiempo real
- [x] **Sistema de Cupones y Descuentos**: Creación y gestión de cupones con diferentes tipos (porcentaje, fijo, envío gratis), restricciones por producto/categoría y seguimiento de uso
- [x] **Reseñas y Calificaciones**: Sistema completo de reseñas con verificación de compra, votos de utilidad, moderación y estadísticas de productos
- [x] **Chat de Soporte en Vivo**: Sistema de chat en tiempo real con asignación de agentes, categorización de tickets y seguimiento de conversaciones
- [x] **Sistema de Notificaciones por Email**: Confirmaciones de compra, notificaciones administrativas y plantillas personalizadas
- [x] **Integración Completa con Stripe**: Procesamiento de pagos con modo simulado para desarrollo y webhooks para confirmación

## 🆕 Detalles de las Nuevas Funcionalidades

### 📦 Gestión de Inventario en Tiempo Real
- **Seguimiento Automático**: Actualización automática del stock al realizar compras
- **Historial Completo**: Registro de todos los movimientos (ventas, restock, ajustes, devoluciones)
- **Alertas de Stock**: Notificaciones cuando el stock está bajo
- **Estadísticas Avanzadas**: Métricas de movimientos por período y producto
- **API Endpoints**: `/api/v1/inventory/*` para gestión completa

### 🎫 Sistema de Cupones y Descuentos
- **Tipos de Cupón**: Porcentaje, monto fijo, envío gratis
- **Restricciones Flexibles**: Por producto, categoría, usuario o monto mínimo
- **Límites de Uso**: Control de cantidad de usos y fechas de validez
- **Seguimiento Completo**: Historial de uso y estadísticas
- **API Endpoints**: `/api/v1/coupons/*` para gestión completa

### ⭐ Reseñas y Calificaciones
- **Verificación de Compra**: Solo usuarios que compraron pueden reseñar
- **Sistema de Votos**: Los usuarios pueden votar si una reseña es útil
- **Moderación**: Sistema de reportes y aprobación de reseñas
- **Estadísticas de Producto**: Calificación promedio y distribución de estrellas
- **API Endpoints**: `/api/v1/reviews/*` para gestión completa

### 💬 Chat de Soporte en Vivo
- **Chat en Tiempo Real**: Sistema de mensajería instantánea
- **Asignación de Agentes**: Los administradores pueden asignar chats
- **Categorización**: Clasificación por tipo de consulta y prioridad
- **Seguimiento**: Historial completo de conversaciones
- **API Endpoints**: `/api/v1/chat/*` para gestión completa

## 🔒 Seguridad

- Autenticación JWT con expiración
- Hashing de contraseñas con bcrypt
- Validación de datos con Joi
- Rate limiting para prevenir ataques
- CORS configurado correctamente
- Headers de seguridad con Helmet
- Validación de entrada en frontend y backend

## 📱 Diseño Responsive

La aplicación está completamente optimizada para:
- **Móviles** (320px - 768px)
- **Tablets** (768px - 1024px)
- **Desktop** (1024px+)

## 🚀 Despliegue

### Backend (Heroku/Railway)
1. Conectar repositorio
2. Configurar variables de entorno
3. Desplegar automáticamente

### Frontend (Vercel/Netlify)
1. Conectar repositorio
2. Configurar build command: `npm run build`
3. Configurar output directory: `dist`

### Base de Datos (MongoDB Atlas)
1. Crear cluster en MongoDB Atlas
2. Configurar conexión en variables de entorno
3. Configurar IP whitelist

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

Desarrollado como proyecto de aprendizaje y demostración de habilidades en desarrollo full-stack.

## 🔌 API Endpoints

### Endpoints Principales
- **Usuarios**: `/api/v1/users` - Gestión de usuarios y autenticación
- **Productos**: `/api/v1/products` - Catálogo y gestión de productos
- **Carrito**: `/api/v1/cart` - Gestión del carrito de compras
- **Órdenes**: `/api/v1/orders` - Procesamiento y gestión de pedidos
- **Pagos**: `/api/v1/payments` - Integración con Stripe
- **Dashboard**: `/api/v1/dashboard` - Estadísticas y métricas

### Nuevos Endpoints
- **Inventario**: `/api/v1/inventory` - Gestión de stock en tiempo real
- **Cupones**: `/api/v1/coupons` - Sistema de descuentos y cupones
- **Reseñas**: `/api/v1/reviews` - Sistema de calificaciones y reseñas
- **Chat**: `/api/v1/chat` - Soporte en vivo y mensajería

### Documentación de la API
La API incluye documentación completa con ejemplos de uso para cada endpoint. Puedes acceder a la documentación en:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Postman Collection**: Incluida en el repositorio

## 📞 Soporte

Si tienes preguntas o necesitas ayuda, puedes:
- Abrir un issue en GitHub
- Contactar al desarrollador
- Revisar la documentación de la API
- Usar el chat de soporte en vivo en la aplicación

---

**¡Gracias por usar nuestra tienda de ropa online! 🛍️**