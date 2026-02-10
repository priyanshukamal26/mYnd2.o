@echo off
echo ===================================================
echo   Starting mYnd2.0 Development Environment
echo ===================================================

echo.
echo Installing root dependencies (if needed)...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing root dependencies!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Installing server dependencies (if needed)...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing server dependencies!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Pushing database schema...
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo Error pushing database schema!
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo Starting application...
echo   - Frontend: http://localhost:8080
echo   - Backend: http://localhost:3001
echo.
call npm run dev:full

pause
