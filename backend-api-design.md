# Backend API Design

## API Endpoints

### 1. File Upload Endpoint
```
POST /api/upload
```
- **Description**: Uploads a video file for conversion
- **Request**:
  - Form-data with file field named "video"
- **Response**:
 - Success (200): 
    ```json
    {
      "success": true,
      "fileId": "uuid-string",
      "fileName": "original-filename.mp4",
      "message": "File uploaded successfully"
    }
    ```
  - Error (400/500):
    ```json
    {
      "success": false,
      "error": "Error message"
    }
    ```

### 2. Get Conversion Status Endpoint
```
GET /api/status/:fileId
```
- **Description**: Gets the conversion progress/status for a file
- **Parameters**: 
  - fileId (path parameter)
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "status": "processing|completed|failed",
      "progress": 75, // percentage
      "message": "Converting video..."
    }
    ```
  - Error (404/500):
    ```json
    {
      "success": false,
      "error": "File not found"
    }
    ```

### 3. Start Conversion Endpoint
```
POST /api/convert/:fileId
```
- **Description**: Starts the conversion process for an uploaded file
- **Parameters**:
  - fileId (path parameter)
- **Request Body**:
  ```json
  {
    "outputFormat": "mp4|avi|mov|webm",
    "quality": "low|medium|high"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Conversion started"
    }
    ```
  - Error (400/404/500):
    ```json
    {
      "success": false,
      "error": "Error message"
    }
    ```

### 4. Download Converted File Endpoint
```
GET /api/download/:fileId
```
- **Description**: Downloads the converted video file
- **Parameters**:
  - fileId (path parameter)
- **Response**:
  - Success: File stream
  - Error (404/500):
    ```json
    {
      "success": false,
      "error": "File not found or not converted yet"
    }
    ```

### 5. Get Supported Formats Endpoint
```
GET /api/formats
```
- **Description**: Gets the list of supported input/output formats
- **Response**:
  ```json
  {
    "success": true,
    "input": ["mp4", "avi", "mov", "webm"],
    "output": ["mp4", "avi", "mov", "webm"]
  }
  ```

### 6. Get Quality Options Endpoint
```
GET /api/qualities
```
- **Description**: Gets the available quality options
- **Response**:
  ```json
 {
    "success": true,
    "qualities": [
      {"name": "low", "resolution": "480p"},
      {"name": "medium", "resolution": "720p"},
      {"name": "high", "resolution": "1080p"}
    ]
  }
  ```

## Data Flow

### 1. File Upload Process
1. User selects a video file in the frontend
2. Frontend sends POST request to `/api/upload` with file
3. Backend receives file and stores it in `uploads/` directory
4. Backend generates a unique fileId (UUID) for the file
5. Backend returns fileId to frontend

### 2. Conversion Process
1. Frontend sends POST request to `/api/convert/:fileId` with conversion options
2. Backend validates the request and options
3. Backend adds conversion job to processing queue
4. FFmpeg processes the video conversion with specified quality
5. Backend updates progress in database/cache
6. Frontend periodically polls `/api/status/:fileId` to get progress
7. When conversion completes, file is moved to `converted/` directory

### 3. File Download Process
1. User clicks download button in frontend
2. Frontend sends GET request to `/api/download/:fileId`
3. Backend validates file exists and is converted
4. Backend streams the converted file to frontend

### 4. Cleanup Process
1. After successful download or after a time threshold (e.g., 1 hour)
2. Backend job cleans up both original and converted files
3. File records are removed from database/cache

## Error Handling
- All endpoints return appropriate HTTP status codes
- JSON error responses with descriptive messages
- Validation for file types, sizes, and conversion parameters
- Proper logging of errors for debugging

## Security Considerations
- File type validation to prevent malicious uploads
- Size limits for uploaded files
- Sanitization of file names
- Rate limiting to prevent abuse
- CORS configuration for frontend access