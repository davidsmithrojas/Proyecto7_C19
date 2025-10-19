# 🧪 Sistema de Testing Completo

Este directorio contiene todas las pruebas del proyecto e-commerce, organizadas por tipo y funcionalidad.

## 📁 Estructura de Testing

```
testing/
├── backend/           # Pruebas del backend (API, servicios, modelos)
├── frontend/          # Pruebas del frontend (componentes React)
├── e2e/              # Pruebas end-to-end (flujos completos)
├── run-tests.bat     # Script para ejecutar todas las pruebas
└── README.md         # Esta documentación
```

## 🚀 Ejecutar Pruebas

### Opción 1: Script Interactivo
```bash
.\testing\run-tests.bat
```

### Opción 2: Comandos Directos

#### Backend (API y Servicios)
```bash
npm run test:backend
```

#### Frontend (Componentes React)
```bash
npm run test:frontend
```

#### End-to-End (Flujos Completos)
```bash
npm run test:e2e
```

#### Todas las Pruebas
```bash
npm run test:all
```

## 🔧 Configuración

### Backend Testing
- **Framework**: Jest + Supertest
- **Base de datos**: MongoDB Memory Server (aislada)
- **Cobertura**: Incluida automáticamente
- **Configuración**: `jest.config.js`

### Frontend Testing
- **Framework**: Vitest + Testing Library
- **Entorno**: jsdom (simulación del DOM)
- **Mocks**: localStorage, fetch, APIs
- **Configuración**: `frontend/vitest.config.js`

### End-to-End Testing
- **Framework**: Playwright
- **Navegadores**: Chrome, Firefox, Safari
- **Escenarios**: Flujos completos de usuario

## 📊 Tipos de Pruebas

### 🔐 Autenticación y Usuarios
- ✅ Registro de usuarios
- ✅ Login con credenciales válidas/inválidas
- ✅ Perfil de usuario
- ✅ Autorización y roles
- ✅ Validación de datos

### 🛍️ Productos
- ✅ CRUD de productos
- ✅ Búsqueda y filtros
- ✅ Categorías y stock
- ✅ Validaciones de negocio
- ✅ Permisos de administrador

### 🛒 Carrito de Compras
- ✅ Agregar/eliminar productos
- ✅ Actualizar cantidades
- ✅ Cálculo de totales
- ✅ Persistencia en localStorage
- ✅ Validaciones de stock

### 📦 Órdenes
- ✅ Crear órdenes
- ✅ Estados de órdenes
- ✅ Historial de compras
- ✅ Gestión administrativa
- ✅ Integración con pagos

### 💳 Pagos (Stripe)
- ✅ Procesamiento de pagos
- ✅ Validación de tarjetas
- ✅ Manejo de errores
- ✅ Confirmaciones
- ✅ Modo simulado para desarrollo
- ✅ Integración con órdenes
- ✅ Envío de emails de confirmación

### 👨‍💼 Panel de Administración
- ✅ Dashboard con estadísticas
- ✅ Gestión de productos
- ✅ Gestión de órdenes
- ✅ Gestión de usuarios
- ✅ Reportes y métricas
- ✅ Subida de imágenes de productos
- ✅ CRUD completo de usuarios
- ✅ Estadísticas en tiempo real

### 📧 Sistema de Emails
- ✅ Confirmación de compras
- ✅ Notificaciones a administradores
- ✅ Plantillas HTML personalizadas
- ✅ Configuración de SMTP
- ✅ Modo de prueba para desarrollo

### 🖼️ Gestión de Imágenes
- ✅ Subida de archivos
- ✅ Validación de tipos y tamaños
- ✅ Almacenamiento local
- ✅ Integración con productos

## 🎯 Casos de Prueba Principales

### Flujo de Usuario Completo
1. **Registro** → Validar datos y crear cuenta
2. **Login** → Autenticación exitosa
3. **Navegación** → Explorar catálogo de productos
4. **Compra** → Agregar productos al carrito
5. **Checkout** → Procesar pago y crear orden
6. **Seguimiento** → Ver estado de la orden

### Flujo de Administrador
1. **Login Admin** → Acceso con privilegios
2. **Dashboard** → Ver estadísticas y métricas
3. **Gestión** → CRUD de productos/órdenes/usuarios
4. **Reportes** → Análisis de ventas y usuarios

### Pruebas de Responsividad
- ✅ Diseño móvil (375px)
- ✅ Diseño tablet (768px)
- ✅ Diseño desktop (1200px+)

### Pruebas de Accesibilidad
- ✅ Navegación por teclado
- ✅ Lectores de pantalla
- ✅ Contraste de colores
- ✅ Textos alternativos

## 📈 Métricas de Cobertura

### Backend
- **Líneas de código**: >90%
- **Funciones**: >95%
- **Ramas**: >85%

### Frontend
- **Componentes**: >90%
- **Hooks**: >95%
- **Utilidades**: >85%

## 🐛 Debugging y Troubleshooting

### Errores Comunes

#### Backend
```bash
# Error: MongoDB no conecta
# Solución: Verificar que MongoDB esté ejecutándose

# Error: Puerto en uso
# Solución: Cambiar puerto en .env o cerrar procesos

# Error: Dependencias faltantes
# Solución: npm install
```

#### Frontend
```bash
# Error: Tests no encuentran componentes
# Solución: Verificar imports y rutas

# Error: Mocks no funcionan
# Solución: Verificar setup.js

# Error: Timeout en tests
# Solución: Aumentar timeout en vitest.config.js
```

#### End-to-End
```bash
# Error: Servidores no ejecutándose
# Solución: Ejecutar start-servers.bat primero

# Error: Navegador no abre
# Solución: Instalar Playwright: npx playwright install

# Error: Tests fallan intermitentemente
# Solución: Aumentar timeouts y waits
```

## 📝 Escribir Nuevas Pruebas

### Backend
```javascript
// testing/backend/nueva-funcionalidad.test.js
const request = require('supertest');
const app = require('../../src/index');

describe('Nueva Funcionalidad', () => {
  it('✅ Debería funcionar correctamente', async () => {
    const response = await request(app)
      .get('/api/v1/nueva-ruta')
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
});
```

### Frontend
```javascript
// frontend/src/test/NuevoComponente.test.jsx
import { render, screen } from '@testing-library/react';
import NuevoComponente from '../components/NuevoComponente';

describe('Nuevo Componente', () => {
  it('✅ Debería renderizar correctamente', () => {
    render(<NuevoComponente />);
    expect(screen.getByText('Texto esperado')).toBeInTheDocument();
  });
});
```

### End-to-End
```javascript
// testing/e2e/nuevo-flujo.test.js
const { test, expect } = require('@playwright/test');

test('Nuevo flujo de usuario', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // ... pasos del flujo
  await expect(page.locator('text=Resultado esperado')).toBeVisible();
});
```

## 🎉 Resultados Esperados

### ✅ Pruebas Exitosas
- **Backend**: Todas las rutas API funcionan
- **Frontend**: Todos los componentes se renderizan
- **E2E**: Todos los flujos de usuario completan

### 📊 Reportes
- **Cobertura**: `testing/coverage/`
- **Logs**: Consola durante ejecución
- **Screenshots**: `testing/e2e/screenshots/` (en caso de fallos)

¡El sistema de testing está diseñado para garantizar la calidad y confiabilidad del proyecto! 🚀
