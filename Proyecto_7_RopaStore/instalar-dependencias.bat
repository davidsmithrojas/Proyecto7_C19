@echo off
echo ========================================
echo    INSTALANDO DEPENDENCIAS DEL PROYECTO
echo ========================================
echo.

echo 🔧 Instalando dependencias del Backend...
echo.
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del backend
    echo.
    echo Soluciones:
    echo 1. Verifica que Node.js esté instalado
    echo 2. Ejecuta: npm --version
    echo 3. Reintenta la instalación
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Backend instalado correctamente
echo.

echo 🔧 Instalando dependencias del Frontend...
echo.
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del frontend
    echo.
    echo Soluciones:
    echo 1. Verifica que Node.js esté instalado
    echo 2. Ejecuta: npm --version
    echo 3. Reintenta la instalación
    echo.
    pause
    exit /b 1
)

cd ..
echo.
echo ✅ Frontend instalado correctamente
echo.

echo ========================================
echo    INSTALACION COMPLETADA EXITOSAMENTE
echo ========================================
echo.
echo 🎉 Todas las dependencias han sido instaladas
echo.
echo 📋 Próximos pasos:
echo 1. Asegúrate de que MongoDB esté ejecutándose
echo 2. Ejecuta: start-servers.bat
echo 3. Abre tu navegador en: http://localhost:3000
echo.
echo 👤 Usuarios de prueba:
echo    - Admin: admin@proyecto6.com / Admin123!
echo    - Usuario: usertest@proyecto6.com / User123!
echo.
pause
