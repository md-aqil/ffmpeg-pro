# Railway Deployment Guide for FFmpeg Multimedia Suite

This guide explains how to deploy your FFmpeg Multimedia Suite to Railway.com.

## Prerequisites

- Railway account (sign up at https://railway.com)
- GitHub repository with your code
- FFmpeg is automatically available on Railway's nixpacks

## Quick Deploy

### Option 1: One-Click Deploy from GitHub

1. Go to [Railway Dashboard](https://railway.com/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect Node.js and build

### Option 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Configuration Files

The following files have been created/updated for Railway deployment:

1. **railway.json** - Railway configuration
2. **package.json** - Root package with build scripts
3. **client/src/services/api.js** - Updated to use relative API URLs
4. **server/services/ffmpegService.js** - Updated to find FFmpeg dynamically

## Environment Variables

Railway provides these automatically:
- `PORT` - The port your app should listen on
- `NODE_ENV` - Set to "production"

No additional configuration needed!

## Important Notes

### File Storage
Railway's filesystem is ephemeral. Uploaded files will be lost on redeployment. For production:
- Consider using cloud storage (AWS S3, Cloudinary, etc.)
- Or use Railway's persistent disks

### Memory Limits
Railway's free tier has memory limits. Large video processing may require a paid plan.

### Build Command
Railway will run `npm run build` which:
1. Installs client dependencies
2. Builds the React frontend
3. Creates a production-ready bundle

### Start Command
Railway will run `npm start` which:
1. Sets NODE_ENV=production
2. Starts the Express server
3. Serves both API and React frontend

## Troubleshooting

### FFmpeg Not Found
If FFmpeg is not found, set the environment variable:
- Key: `FFMPEG_PATH`
- Value: `/opt/bin/ffmpeg`

### Build Fails
Make sure all dependencies are properly listed in package.json files.

### CORS Issues
The app is configured to serve frontend and backend from the same origin, so CORS should work automatically.

## Scaling

For production use with video processing:
1. Upgrade to a paid Railway plan
2. Consider using external storage for uploaded files
3. Set up a database for tracking conversions
4. Consider using a separate worker for FFmpeg processing

## Custom Domain

1. Go to your project settings in Railway
2. Click "Domains"
3. Add your custom domain
4. Configure DNS records as instructed
