@echo off
chcp 65001 > nul
title Tesla Premium Showroom - Servidor y Plataforma
cls
echo ====================================================================
echo        🚀 TESLA PREMIUM SHOWROOM - INICIADOR DE PLATAFORMA
echo ====================================================================
echo  Plataforma de Usuario : http://localhost:4000/
echo ====================================================================
echo.

:: Verificar si Node.js está disponible
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js no está instalado o no se encuentra en el PATH.
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

:: Abrir navegador automáticamente tras 2 segundos (Solo portal de usuario)
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:4000/"

:: Iniciar servidor
echo ⚡ Iniciando servidor protegido contra caídas con persistencia local...
echo Presiona Ctrl+C en esta ventana para detener el servidor.
echo.
node backend/server.js
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ El servidor se detuvo. Presiona cualquier tecla para reiniciar...
    pause > nul
    goto start
)
