@echo off
echo 🚀 Starting NWU Sports Manager...
echo.

echo 🔪 Killing any existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo ✅ Starting backend server...
start "Backend Server" cmd /c "cd /d %~dp0 && npm run server"

echo ⏳ Waiting for backend to start...
timeout /t 5 >nul

echo ✅ Starting frontend server...
start "Frontend Server" cmd /c "cd /d %~dp0 && npm start"

echo.
echo 🎉 Servers starting! Check the command windows for status.
echo Frontend will be available at: http://localhost:7000
echo Backend API will be available at: http://localhost:3001
echo.
pause
