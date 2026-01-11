@echo off
echo ========================================
echo Smart Road System - Django Backend
echo ========================================
echo.

cd /d "%~dp0"

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting Django development server on port 5000...
echo.
echo Server will be available at: http://localhost:5000
echo API endpoints at: http://localhost:5000/api/
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver 5000
