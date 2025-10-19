@echo off
echo ========================================
echo    EJECUTANDO PRUEBAS SIMPLIFICADAS
echo ========================================
echo.

echo 🔧 Ejecutando solo pruebas de autenticación...
npm run test -- --testPathPatterns=testing/backend/auth.test.js --verbose

echo.
echo 🔧 Ejecutando solo pruebas de productos...
npm run test -- --testPathPatterns=testing/backend/products.test.js --verbose

echo.
echo ========================================
echo    PRUEBAS COMPLETADAS
echo ========================================
echo.
pause
