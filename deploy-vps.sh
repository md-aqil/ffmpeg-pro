#!/bin/bash

# Configuration
VPS_IP="187.127.154.55"
VPS_USER="aqil"
PROJECT="ffmpeg-pro"

echo "🚀 Starting Standardized VPS Deployment for $PROJECT..."

# 1. Build Frontend
echo "📦 Building frontend..."
cd client && npm run build
cd ..

# 2. Create Deployment Package
echo "📦 Creating deployment package..."
zip -r deploy.zip server client/build package.json start.sh server/.env.production ffmpegpro.service ffmpegpro.nginx -x "server/node_modules/*" "server/uploads/*" "server/converted/*"

# 3. Upload to VPS
echo "📤 Uploading package to VPS..."
scp deploy.zip $VPS_USER@$VPS_IP:/home/$VPS_USER/

# 4. Remote Execution
echo "⚙️  Executing remote setup script..."
# We run the setup script directly using -t to ensure interactive sudo password entry
ssh -t $VPS_USER@$VPS_IP "unzip -p ~/deploy.zip server/setup-vps.sh > ~/setup-vps.sh && chmod +x ~/setup-vps.sh && ./setup-vps.sh && rm ~/setup-vps.sh"

# Cleanup
rm deploy.zip
echo "🎉 Done! Project is hosted at http://$VPS_IP"
