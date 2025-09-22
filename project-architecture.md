# Video Converter Web App - Project Architecture

## Overall Project Structure

```
video-converter-app/
├── client/                 # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── ...
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── assets/        # Images, icons, etc.
│   │   ├── services/      # API service calls
│   │   ├── utils/         # Utility functions
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── ...
├── server/                # Node.js backend
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Custom middleware
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── uploads/          # Temporary file storage
│   ├── converted/        # Converted file storage
│   ├── app.js
│   ├── server.js
│   └── package.json
├── docs/                 # Documentation
├── README.md
└── package.json          # Root package.json for project scripts
```

## Technology Stack

### Frontend
- React (Create React App)
- Axios for HTTP requests
- React Dropzone for file uploads
- React Router for navigation
- CSS Modules or Styled Components for styling

### Backend
- Node.js with Express.js
- FFmpeg for video processing
- Multer for file uploads
- CORS for cross-origin requests
- Dotenv for environment variables

## Ports Configuration
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Supported Formats
- Input: mp4, avi, mov, webm
- Output: mp4, avi, mov, webm

## Quality Options
- Low: 480p
- Medium: 720p
- High: 1080p