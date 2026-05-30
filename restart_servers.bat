@echo off
echo.
echo 🔄 Restarting Smart Road System...
echo ==================================
echo.

echo Stopping existing servers...
taskkill /F /FI "WINDOWTITLE eq Django Backend*" 2>nul
taskkill /F /FI "WINDOWTITLE eq React Frontend*" 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Django Backend (Port 8000)...
start "Django Backend" cmd /k "cd /d c:\harsha\SmartRoadSystem\backend_django && python manage.py runserver 8000"
timeout /t 5 /nobreak >nul

echo Starting React Frontend (Port 3000)...
start "React Frontend" cmd /k "cd /d c:\harsha\SmartRoadSystem\frontend && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ✓ Servers restarted!
echo.
echo Testing API...
cd /d c:\harsha\SmartRoadSystem
python test_api.py
echo.
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo Admin Panel: http://localhost:3000/admin/login
echo.
pause
