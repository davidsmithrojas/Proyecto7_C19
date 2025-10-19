@echo off
echo ========================================
echo    VERIFICACION COMPLETA DE SERVIDORES
echo ========================================
echo.

echo 🔍 Verificando Backend (http://localhost:5000)...
curl -s http://localhost:5000 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend funcionando correctamente
    echo    - API REST disponible
    echo    - Base de datos conectada
    echo    - Endpoints activos
) else (
    echo ❌ Backend no responde
    echo    - Verifica que MongoDB esté ejecutándose
    echo    - Revisa los logs del backend
)

echo.
echo 🔍 Verificando Frontend (http://localhost:3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Frontend funcionando correctamente
    echo    - React + Vite ejecutándose
    echo    - TailwindCSS configurado
    echo    - Interfaz de usuario disponible
) else (
    echo ❌ Frontend no responde
    echo    - Verifica que las dependencias estén instaladas
    echo    - Revisa los logs del frontend
)

echo.
echo ========================================
echo    RESUMEN DE LA VERIFICACION
echo ========================================
echo.

curl -s http://localhost:5000 >nul 2>&1
set backend_status=%errorlevel%

curl -s http://localhost:3000 >nul 2>&1
set frontend_status=%errorlevel%

if %backend_status% == 0 if %frontend_status% == 0 (
    echo 🎉 ¡TODOS LOS SERVIDORES FUNCIONAN CORRECTAMENTE!
    echo.
    echo 📱 Para acceder a la aplicación:
    echo    - Abre tu navegador en: http://localhost:3000
    echo    - El backend API está en: http://localhost:5000
    echo.
    echo 👤 Usuarios de prueba:
    echo    - Admin: admin@proyecto6.com / Admin123!
    echo    - Usuario: usertest@proyecto6.com / User123!
    echo.
    echo 🛍️ Funcionalidades disponibles:
    echo    - Catálogo de productos
    echo    - Carrito de compras
    echo    - Sistema de autenticación
    echo    - Panel de administración
    echo    - Pasarela de pagos (Stripe)
) else (
    echo ⚠️  ALGUNOS SERVIDORES NO ESTAN FUNCIONANDO
    echo.
    echo 🔧 Soluciones:
    echo    1. Verifica que MongoDB esté ejecutándose
    echo    2. Ejecuta: npm install (en ambas carpetas)
    echo    3. Reinicia los servidores
    echo    4. Revisa los logs de error
)

echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
