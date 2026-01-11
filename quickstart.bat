@echo off
REM Quick Start Script for Smart Road System (Windows)

echo.
echo 🚀 Smart Road Construction ^& Monitoring System
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✓ Node.js version:
node --version
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend
if not exist "node_modules" (
    call npm install
) else (
    echo ✓ Backend dependencies already installed
)

REM Check if .env exists
if not exist ".env" (
    echo.
    echo ⚠️  Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please update .env with your MongoDB URI
)

cd ..

REM Setup Frontend
echo.
echo 🎨 Setting up Frontend...
cd frontend
if not exist "node_modules" (
    call npm install
) else (
    echo ✓ Frontend dependencies already installed
)

cd ..

echo.
echo ✨ Setup Complete!
echo.
echo 📝 Next Steps:
echo 1. Configure backend\.env with your MongoDB URI
echo 2. Start MongoDB:
echo    - Local: mongod
echo    - Or update MONGODB_URI in .env for MongoDB Atlas
echo.
echo 3. In one terminal, start the backend:
echo    cd backend ^&^& npm start
echo.
echo 4. In another terminal, start the frontend:
echo    cd frontend ^&^& npm start
echo.
echo 5. Seed sample data (optional):
echo    cd backend ^&^& node seed.js
echo.
echo 📱 Access the application:
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:5000/api
echo.
echo 🎯 Sample Road IDs for testing:
echo    - ROAD-001
echo    - ROAD-002
echo    - ROAD-003
echo.
pause
