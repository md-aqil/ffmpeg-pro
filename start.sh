#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting FFmpeg Multimedia Suite..."

echo "Starting Backend (port 3001)..."
cd server && npm start &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

echo "Starting Frontend (port 3000)..."
cd client && npm start &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

echo ""
echo "🚀 Servers starting..."
echo "   Backend: http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait