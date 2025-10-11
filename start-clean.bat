@echo off
echo 🚀 NWU Sports Manager - Complete Server Reset & Startup
echo.

echo 🔪 Step 1: Killing all existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ All Node.js processes terminated
) else (
    echo ℹ️  No running Node.js processes found
)
echo.

echo 🧹 Step 2: Cleaning build cache...
if exist ".next" (
    rmdir /s /q ".next" 2>nul
    echo ✅ Build cache cleared
) else (
    echo ℹ️  No build cache to clean
)
echo.

echo 🗄️  Step 3: Starting backend server (port 4001)...
start "Backend Server" cmd /c "npm run server"
echo ⏳ Waiting for backend to initialize...
timeout /t 8 /nobreak >nul
echo ✅ Backend server started
echo.

echo 🌐 Step 4: Starting frontend server (port 4000)...
start "Frontend Server" cmd /c "npm start"
echo ⏳ Waiting for frontend to initialize...
timeout /t 5 /nobreak >nul
echo ✅ Frontend server started
echo.

echo 🎉 Startup complete!
echo.
echo 📋 Server URLs:
echo    Frontend: http://localhost:4000
echo    Backend:  http://localhost:4001
echo.
echo 🧪 Test API: http://localhost:4000/api/test
echo 📝 Register: http://localhost:4000/register
echo.
echo 💡 If you get port conflicts again, just run this script again!
echo.
pause
