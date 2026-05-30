@echo off
echo.
echo 🚀 Starting Smart Road System...
echo ================================
echo.

REM Start Django Backend in a new window
echo Starting Django Backend (Port 8000)...
start "Django Backend" cmd /k "cd /d c:\harsha\SmartRoadSystem\backend_django && python manage.py runserver 8000"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start Frontend in a new window
echo Starting React Frontend (Port 3000)...
start "React Frontend" cmd /k "cd /d c:\harsha\SmartRoadSystem\frontend && npm start"

echo.
echo ✓ Servers starting...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit (servers will continue running)...
pause >nul
