# Frontend - Tienda de Ropa Online

Este es el frontend de la tienda de ropa online construido con React, Vite y TailwindCSS.

## 🚀 Tecnologías Utilizadas

- **React 18** - Biblioteca de JavaScript para construir interfaces de usuario
- **Vite** - Herramienta de construcción rápida para aplicaciones web modernas
- **TailwindCSS** - Framework de CSS utilitario para diseño rápido
- **React Router DOM** - Enrutamiento del lado del cliente para React
- **React Hook Form** - Biblioteca para manejo de formularios
- **Axios** - Cliente HTTP para realizar peticiones a la API
- **React Hot Toast** - Biblioteca para notificaciones toast
- **Lucide React** - Iconos SVG para React

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── auth/           # Componentes de autenticación
│   │   └── layout/         # Componentes de layout
│   ├── context/            # Contextos de React para estado global
│   ├── hooks/              # Hooks personalizados
│   ├── pages/              # Páginas de la aplicación
│   │   └── admin/          # Páginas del panel de administración
│   ├── services/           # Servicios para comunicación con la API
│   ├── utils/              # Utilidades y helpers
│   ├── assets/             # Recursos estáticos
│   ├── App.jsx             # Componente principal
│   ├── main.jsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── public/                 # Archivos públicos
├── package.json            # Dependencias y scripts
├── vite.config.js          # Configuración de Vite
├── tailwind.config.js      # Configuración de TailwindCSS
└── README.md               # Este archivo
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Instalación

1. Navega al directorio del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📱 Funcionalidades

### Para Usuarios
- **Catálogo de Productos**: Navegación y búsqueda de productos
- **Carrito de Compras**: Gestión de productos con persistencia en localStorage
- **Autenticación**: Registro e inicio de sesión con JWT
- **Perfil de Usuario**: Gestión de datos personales
- **Pedidos**: Historial de compras
- **Checkout**: Proceso de pago con Stripe

### Para Administradores
- **Panel de Administración**: Dashboard con estadísticas
- **Gestión de Productos**: CRUD completo de productos
- **Gestión de Pedidos**: Administración de órdenes
- **Gestión de Usuarios**: Administración de usuarios del sistema

## 🎨 Diseño

El diseño utiliza TailwindCSS con una paleta de colores personalizada:
- **Primary**: Azul (#3b82f6)
- **Secondary**: Gris (#64748b)
- **Success**: Verde
- **Warning**: Amarillo
- **Error**: Rojo

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la construcción de producción
- `npm run lint` - Ejecuta el linter de ESLint

## 🌐 API Integration

El frontend se comunica con el backend a través de:
- **Base URL**: `http://localhost:5000/api/v1`
- **Autenticación**: JWT tokens en headers
- **Endpoints principales**:
  - `/users` - Gestión de usuarios
  - `/products` - Gestión de productos
  - `/orders` - Gestión de pedidos
  - `/payments` - Procesamiento de pagos

## 📦 Contextos de Estado

### AuthContext
Maneja la autenticación del usuario:
- Login/logout
- Registro
- Verificación de token
- Actualización de perfil

### CartContext
Gestiona el carrito de compras:
- Agregar/remover productos
- Actualizar cantidades
- Persistencia en localStorage
- Cálculo de totales

### ProductContext
Maneja los productos:
- Listado con filtros
- Búsqueda
- Paginación
- Categorías

## 🔒 Seguridad

- Validación de formularios con React Hook Form
- Protección de rutas con ProtectedRoute
- Manejo seguro de tokens JWT
- Validación de roles para administradores

## 📱 Responsive Design

La aplicación está diseñada para ser completamente responsive:
- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm, md, lg, xl
- **Grid System**: CSS Grid y Flexbox
- **Componentes Adaptativos**: Se adaptan a diferentes tamaños de pantalla

## 🚀 Despliegue

Para desplegar en producción:

1. Construye la aplicación:
```bash
npm run build
```

2. Los archivos estáticos se generan en la carpeta `dist/`

3. Sirve los archivos con un servidor web (nginx, Apache, etc.)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
