@echo off
echo Clearing all converted and uploaded files...

REM Remove all files from the deployment package converted directory
if exist "deployment-package\server\converted\*" (
    echo Removing files from deployment-package\server\converted/
    del /q "deployment-package\server\converted\*"
)

REM Remove all files from the server converted directory
if exist "server\converted\*" (
    echo Removing files from server/converted/
    del /q "server\converted\*"
)

REM Remove all files from the deployment package uploads directory
if exist "deployment-package\server\uploads\*" (
    echo Removing files from deployment-package\server\uploads/
    del /q "deployment-package\server\uploads\*"
)

REM Remove all files from the server uploads directory
if exist "server\uploads\*" (
    echo Removing files from server/uploads/
    del /q "server\uploads\*"
)

echo.
echo All converted and uploaded files have been removed.
echo Only .gitkeep files remain to preserve the directory structure.
pause