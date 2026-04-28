#!/bin/bash
set -e

PROJECT="ffmpeg-pro"
SERVICE_USER="ffmpegpro"
PROJECT_GROUP="ffmpegpro-dev"
APP_DIR="/var/www/$PROJECT"
CONFIG_DIR="/etc/$PROJECT"
VPS_USER=$(whoami)

echo "🛠 Starting Remote Setup on VPS..."

# 1. Create service account and group if they don't exist
sudo groupadd -f $PROJECT_GROUP
sudo useradd -r -s /usr/sbin/nologin -g $PROJECT_GROUP $SERVICE_USER || true
sudo usermod -aG $PROJECT_GROUP $VPS_USER

# 2. Setup Directories
sudo mkdir -p $APP_DIR $CONFIG_DIR
sudo unzip -o ~/deploy.zip -d $APP_DIR

# 3. Handle Secrets
sudo mv $APP_DIR/server/.env.production $CONFIG_DIR/.env
sudo chown root:$PROJECT_GROUP $CONFIG_DIR/.env
sudo chmod 640 $CONFIG_DIR/.env

# 4. Set Permissions
sudo chown -R $SERVICE_USER:$PROJECT_GROUP $APP_DIR
sudo chmod -R 750 $APP_DIR
sudo mkdir -p $APP_DIR/server/uploads $APP_DIR/server/converted
sudo chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR/server/uploads $APP_DIR/server/converted

# 5. Install System Dependencies
sudo apt-get update
sudo apt-get install -y ffmpeg nodejs npm unzip

# 6. Install App Dependencies
cd $APP_DIR/server
sudo -u $SERVICE_USER npm install --production

# 7. Configure Systemd Service
sudo mv $APP_DIR/ffmpegpro.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable $PROJECT
sudo systemctl restart $PROJECT

# 8. Configure Nginx
sudo mv $APP_DIR/ffmpegpro.nginx /etc/nginx/sites-available/$PROJECT
sudo ln -sf /etc/nginx/sites-available/$PROJECT /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Remote Setup Complete!"
