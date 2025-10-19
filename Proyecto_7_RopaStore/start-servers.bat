@echo off
echo ========================================
echo    INICIANDO SERVIDORES DE DESARROLLO
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Presiona Ctrl+C para detener ambos servidores
echo.

echo Iniciando Backend...
start "Backend Server" cmd /k "cd /d %~dp0 && npm run dev"

echo Esperando 5 segundos para que el backend se inicie...
timeout /t 5 /nobreak >nul

echo Iniciando Frontend...
start "Frontend Server" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo ========================================
echo    SERVIDORES INICIADOS EXITOSAMENTE
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
