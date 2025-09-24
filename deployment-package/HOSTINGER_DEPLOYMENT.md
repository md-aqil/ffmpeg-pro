# Hostinger Deployment Guide

This guide provides detailed instructions for deploying the FFmpeg Multimedia Suite on Hostinger VPS hosting.

## Prerequisites

1. Hostinger VPS plan with SSH access
2. A domain name (recommended)
3. FFmpeg installed on your server

## Step-by-Step Deployment

### 1. Prepare Your Local Environment

First, build your React frontend application:

```bash
cd client
npm run build
cd ..
```

This creates a production-ready build in the `client/build/` directory.

### 2. Prepare Files for Upload

You need to upload these files/directories to your Hostinger server:

- `server/` (entire directory)
- `client/build/` (the build directory created in step 1)
- `ecosystem.config.js`
- `nginx.conf`

### 3. Access Your Hostinger Server via SSH

Use an SSH client to connect to your Hostinger VPS:

```bash
ssh username@your-server-ip
```

### 4. Install Required Software

Update your system and install necessary software:

```bash
# Update package list
sudo apt update

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install FFmpeg
sudo apt install ffmpeg

# Install PM2 globally
sudo npm install -g pm2

# Install NGINX (if not already installed)
sudo apt install nginx
```

### 5. Upload Application Files

Use SFTP or SCP to upload your application files to the server. For example:

```bash
# From your local machine
scp -r server username@your-server-ip:/home/username/ffmpeg-suite/
scp -r client/build username@your-server-ip:/home/username/ffmpeg-suite/client/
scp ecosystem.config.js username@your-server-ip:/home/username/ffmpeg-suite/
scp nginx.conf username@your-server-ip:/home/username/ffmpeg-suite/
```

### 6. Install Dependencies

Navigate to your server directory and install production dependencies:

```bash
cd /home/username/ffmpeg-suite/server
npm ci --only=production
```

### 7. Configure Environment Variables

Create a `.env.production` file in the server directory:

```bash
cd /home/username/ffmpeg-suite/server
nano .env.production
```

Add the following content:

```
NODE_ENV=production
PORT=3001
```

### 8. Start Application with PM2

Use PM2 to manage your Node.js application:

```bash
cd /home/username/ffmpeg-suite
pm2 start ecosystem.config.js
```

Save the PM2 configuration:

```bash
pm2 save
```

Configure PM2 to start on system boot:

```bash
pm2 startup
```

### 9. Configure NGINX

Copy the NGINX configuration:

```bash
sudo cp nginx.conf /etc/nginx/sites-available/ffmpeg-suite
```

Edit the configuration to match your domain and paths:

```bash
sudo nano /etc/nginx/sites-available/ffmpeg-suite
```

Key changes to make:
1. Replace `your-domain.com` with your actual domain
2. Update paths to match your file locations

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/ffmpeg-suite /etc/nginx/sites-enabled/
```

Test the NGINX configuration:

```bash
sudo nginx -t
```

If the test passes, restart NGINX:

```bash
sudo systemctl restart nginx
```

### 10. Set Up SSL Certificate (Optional but Recommended)

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
```

Obtain and install SSL certificate:

```bash
sudo certbot --nginx -d your-domain.com
```

### 11. Final Testing

1. Check if your application is running:
   ```bash
   pm2 list
   ```

2. Check NGINX status:
   ```bash
   sudo systemctl status nginx
   ```

3. Visit your domain in a web browser

## Useful PM2 Commands

- `pm2 list` - List all running applications
- `pm2 stop ffmpeg-multimedia-suite` - Stop the application
- `pm2 restart ffmpeg-multimedia-suite` - Restart the application
- `pm2 logs` - View application logs
- `pm2 monit` - Monitor applications

## Troubleshooting

### Common Issues

1. **FFmpeg not found**: Ensure FFmpeg is installed and accessible in PATH
2. **Permission errors**: Check directory permissions for uploads/converted directories
3. **NGINX configuration errors**: Validate with `sudo nginx -t`
4. **Port conflicts**: Ensure port 80/443 and 3001 are not used by other applications

### Checking Logs

View application logs:
```bash
pm2 logs ffmpeg-multimedia-suite
```

View NGINX error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

View NGINX access logs:
```bash
sudo tail -f /var/log/nginx/access.log
```

## Performance Optimization

1. **File Storage**: Consider using external storage for large files
2. **Caching**: Implement Redis for caching frequently accessed data
3. **Load Balancing**: For high traffic, consider multiple instances behind a load balancer
4. **CDN**: Use a CDN for static assets

## Security Considerations

1. **Firewall**: Configure UFW to restrict access
2. **Rate Limiting**: Implement rate limiting in NGINX
3. **File Validation**: Ensure proper file type and size validation
4. **Regular Updates**: Keep Node.js, NGINX, and system packages updated

## Backup and Maintenance

1. **Regular Backups**: Implement automated backups for code and data
2. **Monitoring**: Set up monitoring for uptime and performance
3. **Log Rotation**: Configure log rotation to prevent disk space issues

## Scaling Considerations

For high-traffic applications:
1. Use a database for storing file metadata
2. Implement a job queue system (e.g., Bull, Agenda)
3. Use separate servers for frontend, backend, and database
4. Implement load balancing
5. Use a CDN for static assets