@echo off
echo Starting FFmpeg Multimedia Suite...

echo Starting Backend Server...
start "Backend" cmd /k "cd server && node server.js"


echo Starting Frontend Server...  
start "Frontend" cmd /k "cd client && npm start"

echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
pause
