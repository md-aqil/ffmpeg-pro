#!/bin/bash

# Deployment script for FFmpeg Multimedia Suite

echo "Starting deployment process..."

# Navigate to client directory and build React app
echo "Building React frontend..."
cd client
npm run build
cd ..

# Navigate to server directory
cd server

# Install production dependencies
echo "Installing production dependencies..."
npm ci --only=production

echo "Deployment build completed!"
echo "Upload the following directories/files to your Hostinger server:"
echo "1. server/ (entire directory)"
echo "2. client/build/ (generated build directory)"

echo "Deployment steps for Hostinger:"
echo "1. Upload files to your server"
echo "2. Install Node.js dependencies on server: npm ci --only=production"
echo "3. Install PM2 globally: npm install -g pm2"
echo "4. Start application with PM2: pm2 start server.js"
echo "5. Configure NGINX reverse proxy"
echo "6. Set up SSL certificate if needed"