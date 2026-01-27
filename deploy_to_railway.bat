@echo off
echo ========================================
echo   SMART ROAD SYSTEM - RAILWAY SETUP
echo ========================================
echo.

echo Step 1: Installing Railway CLI...
npm install -g @railway/cli
echo.

echo Step 2: Login to Railway...
railway login
echo.

echo Step 3: Initialize Railway Project...
cd backend_django
railway init
echo.

echo Step 4: Linking to Railway...
railway link
echo.

echo Step 5: Adding environment variables...
echo Please set these in Railway Dashboard:
echo - SECRET_KEY = your-secret-key
echo - DEBUG = False
echo - ALLOWED_HOSTS = .railway.app
echo - PORT = 8000
echo.

echo Step 6: Deploying...
railway up
echo.

echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next Steps:
echo 1. Go to Railway Dashboard
echo 2. Click Settings - Domains - Generate Domain
echo 3. Copy your URL
echo 4. Use that URL in frontend .env file
echo.
echo Your backend will be live at:
echo https://[your-project].railway.app
echo.
pause
