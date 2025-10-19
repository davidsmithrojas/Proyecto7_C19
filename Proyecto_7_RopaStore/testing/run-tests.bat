@echo off
echo ========================================
echo    EJECUTANDO SUITE COMPLETA DE TESTS
echo ========================================
echo.

echo 🧪 Iniciando pruebas del proyecto...
echo.

echo 📋 Tipos de pruebas disponibles:
echo 1. Backend (API y servicios)
echo 2. Frontend (Componentes React)
echo 3. End-to-End (Flujos completos)
echo 4. Todas las pruebas
echo.

set /p choice="Selecciona el tipo de prueba (1-4): "

if "%choice%"=="1" goto backend
if "%choice%"=="2" goto frontend
if "%choice%"=="3" goto e2e
if "%choice%"=="4" goto all
goto invalid

:backend
echo.
echo 🔧 Ejecutando pruebas del Backend...
echo.
cd ..
npm test -- --testPathPattern=testing/backend
goto end

:frontend
echo.
echo ⚛️ Ejecutando pruebas del Frontend...
echo.
cd frontend
npm run test
goto end

:e2e
echo.
echo 🌐 Ejecutando pruebas End-to-End...
echo.
echo Nota: Asegúrate de que los servidores estén ejecutándose
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
npx playwright test testing/e2e
goto end

:all
echo.
echo 🚀 Ejecutando TODAS las pruebas...
echo.

echo 📊 1/3 - Pruebas del Backend
cd ..
npm test -- --testPathPattern=testing/backend
if %errorlevel% neq 0 (
    echo ❌ Fallaron las pruebas del backend
    goto end
)

echo.
echo 📊 2/3 - Pruebas del Frontend
cd frontend
npm run test
if %errorlevel% neq 0 (
    echo ❌ Fallaron las pruebas del frontend
    goto end
)

echo.
echo 📊 3/3 - Pruebas End-to-End
cd ..
echo Asegúrate de que los servidores estén ejecutándose...
pause
npx playwright test testing/e2e

echo.
echo ✅ Todas las pruebas completadas
goto end

:invalid
echo.
echo ❌ Opción inválida. Por favor selecciona 1-4.
goto end

:end
echo.
echo ========================================
echo    PRUEBAS COMPLETADAS
echo ========================================
echo.
echo 📊 Revisa los resultados arriba
echo 📁 Reportes de cobertura en: testing/coverage/
echo.
pause
