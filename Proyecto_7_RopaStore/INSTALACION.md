# 🚀 Guía de Instalación - Tienda de Ropa Online

Esta guía te ayudará a instalar y configurar la aplicación completa paso a paso.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior) - [Descargar aquí](https://nodejs.org/)
- **MongoDB** (local o Atlas) - [Descargar aquí](https://www.mongodb.com/try/download/community)
- **Git** - [Descargar aquí](https://git-scm.com/)

## 🛠️ Instalación Rápida (Windows)

### Opción 1: Scripts Automáticos

1. **Clona el repositorio:**
```bash
git clone <url-del-repositorio>
cd ecommerce-ropa
```

2. **Instala todas las dependencias:**
```bash
# Ejecuta el script de instalación
install-all.bat
```

3. **Inicia los servidores:**
```bash
# Ejecuta el script de inicio
start-dev.bat
```

### Opción 2: Instalación Manual

1. **Instala dependencias del backend:**
```bash
cd backend
npm install
```

2. **Instala dependencias del frontend:**
```bash
cd frontend
npm install
```

3. **Inicia el backend:**
```bash
cd backend
npm run dev
```

4. **Inicia el frontend (en otra terminal):**
```bash
cd frontend
npm run dev
```

## ⚙️ Configuración

### 1. Configurar Variables de Entorno

#### Backend
Crea un archivo `.env` en la carpeta `backend`:

```env
# Puerto del servidor
PORT=5000

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/proyecto_6_db

# JWT
SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=1h

# Stripe (opcional para desarrollo)
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_de_stripe

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_DIR=logs
```

#### Frontend
Crea un archivo `.env` en la carpeta `frontend`:

```env
# URL de la API
VITE_API_URL=http://localhost:5000/api/v1

# Stripe (opcional para desarrollo)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_de_stripe

# Configuración de la app
VITE_APP_NAME=Tienda de Ropa Online
VITE_APP_VERSION=1.0.0
```

### 2. Configurar MongoDB

#### Opción A: MongoDB Local
1. Instala MongoDB Community Server
2. Inicia el servicio de MongoDB
3. La aplicación se conectará automáticamente a `mongodb://localhost:27017/proyecto_6_db`

#### Opción B: MongoDB Atlas (Recomendado)
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea un cluster gratuito
3. Obtén la cadena de conexión
4. Actualiza `MONGODB_URI` en el archivo `.env` del backend

### 3. Inicializar la Base de Datos

```bash
cd backend
npm run seed
```

Esto creará:
- Usuarios de prueba (admin y usuario regular)
- 10 productos de ropa con imágenes
- Datos de ejemplo para testing

## 🚀 Iniciar la Aplicación

### Desarrollo
```bash
# Opción 1: Script automático
start-dev.bat

# Opción 2: Manual
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Producción
```bash
# Construir frontend
cd frontend
npm run build

# Iniciar backend
cd backend
npm start
```

## 🌐 Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Documentación API**: http://localhost:5000/api-docs

## 👥 Usuarios de Prueba

### Administrador
- **Email**: admin@proyecto6.com
- **Contraseña**: Admin123!

### Usuario Regular
- **Email**: usertest@proyecto6.com
- **Contraseña**: User123!

## 💳 Datos de Prueba para Pagos

- **Tarjeta de Prueba**: 4242 4242 4242 4242
- **CVV**: Cualquier número de 3 dígitos
- **Fecha de Vencimiento**: Cualquier fecha futura

## 🔧 Comandos Útiles

### Backend
```bash
cd backend
npm run dev          # Desarrollo
npm run start        # Producción
npm run seed         # Inicializar BD
npm run test         # Ejecutar pruebas
npm run lint         # Linter
```

### Frontend
```bash
cd frontend
npm run dev          # Desarrollo
npm run build        # Construir
npm run preview      # Previsualizar
npm run lint         # Linter
```

## 🐛 Solución de Problemas

### Error de Conexión a MongoDB
```bash
# Verificar que MongoDB esté ejecutándose
mongod --version

# Iniciar MongoDB
sudo systemctl start mongod  # Linux
net start MongoDB            # Windows
```

### Error de Puerto en Uso
```bash
# Cambiar puerto en .env
PORT=5001  # Backend
# O en vite.config.js para frontend
```

### Error de Dependencias
```bash
# Limpiar cache y reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Error de Permisos (Linux/Mac)
```bash
# Dar permisos de ejecución
chmod +x *.sh
```

## 📱 Verificar Instalación

1. **Backend funcionando:**
   - Visita http://localhost:5000
   - Deberías ver: `{"success":true,"message":"API REST Proyecto 6 - MongoDB"}`

2. **Frontend funcionando:**
   - Visita http://localhost:3000
   - Deberías ver la página principal de la tienda

3. **Base de datos:**
   - Los productos deberían aparecer en el catálogo
   - Puedes hacer login con los usuarios de prueba

## 🆘 Obtener Ayuda

Si tienes problemas:

1. **Revisa los logs:**
   - Backend: `backend/logs/`
   - Frontend: Consola del navegador

2. **Verifica la configuración:**
   - Archivos `.env` correctos
   - MongoDB ejecutándose
   - Puertos disponibles

3. **Reinstala dependencias:**
   ```bash
   npm run install-all
   ```

4. **Reinicia todo:**
   ```bash
   # Detener servidores (Ctrl+C)
   # Ejecutar nuevamente
   start-dev.bat
   ```

## ✅ Checklist de Instalación

- [ ] Node.js instalado (v16+)
- [ ] MongoDB instalado y ejecutándose
- [ ] Repositorio clonado
- [ ] Dependencias instaladas
- [ ] Variables de entorno configuradas
- [ ] Base de datos inicializada
- [ ] Backend ejecutándose (puerto 5000)
- [ ] Frontend ejecutándose (puerto 3000)
- [ ] Login funcionando
- [ ] Productos visibles
- [ ] Carrito funcionando

¡Listo! Tu tienda de ropa online está funcionando. 🎉
