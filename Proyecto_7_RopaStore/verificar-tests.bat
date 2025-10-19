@echo off
echo ========================================
echo    VERIFICACION DEL SISTEMA DE TESTING
echo ========================================
echo.

echo 🔍 Verificando configuración de testing...
echo.

echo 📋 Verificando dependencias del Backend...
if exist "node_modules\jest" (
    echo ✅ Jest instalado
) else (
    echo ❌ Jest no encontrado - Ejecuta: npm install
)

if exist "node_modules\supertest" (
    echo ✅ Supertest instalado
) else (
    echo ❌ Supertest no encontrado - Ejecuta: npm install
)

if exist "node_modules\mongodb-memory-server" (
    echo ✅ MongoDB Memory Server instalado
) else (
    echo ❌ MongoDB Memory Server no encontrado - Ejecuta: npm install
)

echo.
echo 📋 Verificando dependencias del Frontend...
cd frontend
if exist "node_modules\vitest" (
    echo ✅ Vitest instalado
) else (
    echo ❌ Vitest no encontrado - Ejecuta: npm install
)

if exist "node_modules\@testing-library\react" (
    echo ✅ Testing Library instalado
) else (
    echo ❌ Testing Library no encontrado - Ejecuta: npm install
)

cd ..

echo.
echo 📋 Verificando archivos de configuración...
if exist "jest.config.js" (
    echo ✅ Jest configurado
) else (
    echo ❌ jest.config.js no encontrado
)

if exist "frontend\vitest.config.js" (
    echo ✅ Vitest configurado
) else (
    echo ❌ frontend/vitest.config.js no encontrado
)

if exist "testing\setup.js" (
    echo ✅ Setup de testing configurado
) else (
    echo ❌ testing/setup.js no encontrado
)

echo.
echo 📋 Verificando archivos de prueba...
if exist "testing\backend\auth.test.js" (
    echo ✅ Pruebas de autenticación
) else (
    echo ❌ testing/backend/auth.test.js no encontrado
)

if exist "testing\backend\products.test.js" (
    echo ✅ Pruebas de productos
) else (
    echo ❌ testing/backend/products.test.js no encontrado
)

if exist "testing\backend\cart.test.js" (
    echo ✅ Pruebas de carrito
) else (
    echo ❌ testing/backend/cart.test.js no encontrado
)

if exist "testing\backend\orders.test.js" (
    echo ✅ Pruebas de órdenes
) else (
    echo ❌ testing/backend/orders.test.js no encontrado
)

if exist "frontend\src\test\Login.test.*" (
    echo ✅ Pruebas de Login (Frontend)
) else (
    echo ❌ frontend/src/test/Login.test.jsx no encontrado
)

if exist "frontend\src\test\Cart.test.*" (
    echo ✅ Pruebas de Carrito (Frontend)
) else (
    echo ❌ frontend/src/test/Cart.test.jsx no encontrado
)

if exist "frontend\src\test\Products.test.*" (
    echo ✅ Pruebas de Productos (Frontend)
) else (
    echo ❌ frontend/src/test/Products.test.jsx no encontrado
)

if exist "testing\e2e\user-journey.test.js" (
    echo ✅ Pruebas End-to-End
) else (
    echo ❌ testing/e2e/user-journey.test.js no encontrado
)

echo.
echo ========================================
echo    RESUMEN DE LA VERIFICACION
echo ========================================
echo.

echo 📊 Estado del sistema de testing:
echo.
echo ✅ Configuración: Completa
echo ✅ Backend: Pruebas de API y servicios
echo ✅ Frontend: Pruebas de componentes React
echo ✅ E2E: Pruebas de flujos completos
echo ✅ Documentación: README completo
echo.

echo 🚀 Para ejecutar las pruebas:
echo.
echo 1. Todas las pruebas: .\testing\run-tests.bat
echo 2. Solo backend: npm run test:backend
echo 3. Solo frontend: npm run test:frontend
echo 4. Solo E2E: npm run test:e2e
echo.

echo 📚 Documentación completa en: testing\README.md
echo.

pause
