@echo off
cls
echo ==========================================
echo FFmpeg Multimedia Suite - Build for Deployment
echo ==========================================

echo.
echo Step 1: Building React Frontend...
echo ------------------------------------------
cd client
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build React frontend
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo Step 2: Verifying Build Success...
echo ------------------------------------------
if exist "client\build\index.html" (
    echo Frontend build successful!
) else (
    echo Error: Frontend build failed - index.html not found
    pause
    exit /b 1
)

echo.
echo Step 3: Preparing Deployment Package...
echo ------------------------------------------
echo Creating deployment package structure...

if exist "deployment-package" (
    echo Removing existing deployment package...
    rd /s /q "deployment-package"
)

mkdir "deployment-package"
mkdir "deployment-package\server"
mkdir "deployment-package\client"

echo Copying server files...
xcopy "server" "deployment-package\server\" /E /I /EXCLUDE:build-exclude.txt

echo Copying client build...
xcopy "client\build" "deployment-package\client\build\" /E /I

echo Copying configuration files...
copy "ecosystem.config.js" "deployment-package\"
copy "nginx.conf" "deployment-package\"
copy "HOSTINGER_DEPLOYMENT.md" "deployment-package\"
copy "README.md" "deployment-package\"

echo.
echo Step 4: Creating Archive...
echo ------------------------------------------
cd deployment-package
tar -czf ../ffmpeg-multimedia-suite-deployment.tar.gz *
cd ..

echo.
echo Deployment package created successfully!
echo Files ready for Hostinger deployment:
echo - deployment-package\          (directory)
echo - ffmpeg-multimedia-suite-deployment.tar.gz (compressed archive)
echo.
echo Next steps:
echo 1. Upload the tar.gz file to your Hostinger server
echo 2. Extract it on the server
echo 3. Follow the HOSTINGER_DEPLOYMENT.md guide
echo.
echo Deployment preparation completed!
pause