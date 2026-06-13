# FrameDrop Backend

The Node.js/Express API server for FrameDrop - a room-based media sharing platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Docker](#docker)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The FrameDrop backend provides a REST API for managing:
- User authentication and sessions
- Room creation and management
- Photo uploads and management
- Member roles and permissions
- Real-time data synchronization

## 🛠 Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB 9.6.3
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: Bcrypt.js 3.0.3
- **File Upload**: Multer 2.1.1
- **Image Storage**: Cloudinary CDN
- **Environment**: dotenv 17.4.2
- **Development**: Nodemon 3.1.14
- **Linting**: ESLint 10.4.1
- **Testing**: Jest 30.4.2, Supertest 7.2.2

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                  # Express application setup
│   ├── server.js               # Entry point (see ../server.js)
│   ├── db/
│   │   └── db.js               # MongoDB connection setup
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── rooms.js            # Room routes
│   │   ├── photos.js           # Photo routes
│   │   └── members.js          # Member routes
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── roomController.js   # Room management logic
│   │   ├── photoController.js  # Photo upload logic
│   │   └── memberController.js # Member management logic
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Room.js             # Room schema
│   │   ├── Photo.js            # Photo schema
│   │   └── index.js            # Model exports
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   ├── errorHandler.js     # Error handling
│   │   └── validation.js       # Input validation
│   └── utils/
│       ├── cloudinary.js       # Cloudinary integration
│       ├── jwt.js              # JWT helpers
│       └── constants.js        # App constants
├── package.json                # Dependencies and scripts
├── package-lock.json           # Locked dependencies
├── .env                        # Environment variables template
├── .env.example                # Example env configuration
├── .dockerignore               # Docker ignore rules
├── DockerFile                  # Container configuration
├── eslint.config.mjs           # ESLint configuration
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)
- Cloudinary account (for image hosting)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/hannuverma/FrameDrop.git
cd FrameDrop/backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env .env.local
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/framedrop?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d

# Cloudinary (for image hosting)
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif
```

### Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment type | development/production |
| `MONGODB_URI` | Database connection string | mongodb+srv://... |
| `JWT_SECRET` | Secret key for JWT signing | long-random-string |
| `JWT_EXPIRY` | Token expiration time | 7d |
| `CLOUDINARY_*` | Image hosting credentials | see Cloudinary docs |
| `FRONTEND_URL` | Frontend origin for CORS | http://localhost:8000 |
| `MAX_FILE_SIZE` | Maximum upload size in bytes | 5242880 |
| `ALLOWED_MIME_TYPES` | Allowed file types | image/jpeg,image/png,... |

## ▶️ Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

The server will start on `http://localhost:3000` and automatically restart when files change.

### Production Mode

```bash
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Linting

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint -- --fix
```

## 📚 API Endpoints

### Authentication

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "user": { id, username, email }
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "user": { id, username, email },
  "token": "eyJhbGc..."
}
```

#### Verify Token
```
GET /auth/verify
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "user": { id, username, email }
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Rooms

#### List Rooms
```
GET /rooms
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "rooms": [...]
}
```

#### Create Room
```
POST /rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Room",
  "description": "A room for sharing photos",
  "isPublic": true
}

Response (201):
{
  "success": true,
  "room": { id, name, description, owner, members, ... }
}
```

#### Get Room Details
```
GET /rooms/:roomId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "room": { ... }
}
```

#### Update Room
```
PUT /rooms/:roomId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "isPublic": false
}

Response (200):
{
  "success": true,
  "room": { ... }
}
```

#### Delete Room (Owner only)
```
DELETE /rooms/:roomId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Room deleted successfully"
}
```

#### Join Room
```
POST /rooms/:roomId/join
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Joined room successfully"
}
```

#### Leave Room
```
POST /rooms/:roomId/leave
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Left room successfully"
}
```

### Photos

#### List Room Photos
```
GET /rooms/:roomId/photos
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "photos": [...]
}
```

#### Upload Photo
```
POST /rooms/:roomId/photos
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- file: <image file>

Response (201):
{
  "success": true,
  "photo": { id, url, uploader, uploadedAt, ... }
}
```

#### Delete Photo
```
DELETE /rooms/:roomId/photos/:photoId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Photo deleted successfully"
}
```

### Members

#### List Room Members
```
GET /rooms/:roomId/members
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "members": [...]
}
```

#### Update Member Role (Admin/Owner only)
```
PUT /rooms/:roomId/members/:memberId
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "Admin"  // or "Member"
}

Response (200):
{
  "success": true,
  "member": { ... }
}
```

#### Remove Member (Admin/Owner only)
```
DELETE /rooms/:roomId/members/:memberId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Member removed successfully"
}
```

## 🗄️ Database Models

### User Model

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  avatar: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Room Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  owner: ObjectId (references User),
  coverImage: String,
  members: [
    {
      user: ObjectId (references User),
      role: String (enum: ["Owner", "Admin", "Member"]),
      joinedAt: Date
    }
  ],
  isPublic: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Photo Model

```javascript
{
  _id: ObjectId,
  room: ObjectId (references Room, required),
  uploader: ObjectId (references User, required),
  url: String (required),
  filename: String,
  size: Number,
  mimeType: String,
  uploadedAt: Date,
  metadata: {
    width: Number,
    height: Number
  }
}
```

## 🔐 Authentication

### How JWT Works

1. User logs in with email and password
2. Server validates credentials and generates JWT token
3. Token is sent to client (stored in cookie or localStorage)
4. Client includes token in Authorization header: `Bearer <token>`
5. Server verifies token on protected routes
6. Token expires after specified duration (default: 7 days)

### Protected Routes

All routes except `/auth/register` and `/auth/login` require a valid JWT token:

```javascript
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access Control

- **Owner**: Full room control, delete room, manage all members
- **Admin**: Manage members, moderate content, delete any photo
- **Member**: View room, upload/delete own photos

## 🚨 Error Handling

All endpoints return standardized error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (no valid token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

## 🧪 Testing

### Test Structure

```
__tests__/
├── auth.test.js
├── rooms.test.js
├── photos.test.js
└── members.test.js
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.js

# Run with coverage report
npm test -- --coverage

# Watch mode (re-run on changes)
npm test -- --watch
```

### Writing Tests

Tests use Jest and Supertest:

```javascript
describe('Authentication', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
```

## 🐳 Docker

### Build Docker Image

```bash
docker build -f DockerFile -t framedrop-backend:latest .
```

### Run Container

```bash
docker run -d \
  --name framedrop \
  -p 3000:3000 \
  -e MONGODB_URI=your_connection_string \
  -e JWT_SECRET=your_secret \
  framedrop-backend:latest
```

### Docker Compose (Optional)

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/framedrop
      - JWT_SECRET=your_secret
    depends_on:
      - mongo
  
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running or check your `MONGODB_URI` in `.env`

#### JWT Token Invalid
```
Error: Invalid token
```
**Solution**: 
- Verify the token is being sent correctly in the Authorization header
- Check that `JWT_SECRET` matches between server instances
- Verify token hasn't expired

#### Cloudinary Upload Fails
```
Error: Invalid Cloudinary credentials
```
**Solution**: 
- Verify `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are correct
- Check Cloudinary account settings and API credentials

#### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution**: 
- Change `PORT` in `.env` to an available port
- Or kill the process using port 3000: `lsof -i :3000 | kill -9 <PID>`

#### CORS Errors
```
Error: Cross-Origin Request Blocked
```
**Solution**: 
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check that CORS middleware is properly configured in `src/app.js`

## 📝 Development Notes

- Keep models and controllers separate for better maintainability
- Use middleware for common operations (auth, validation, error handling)
- Write tests for new endpoints before implementing
- Follow the ESLint configuration for code consistency
- Update this README when adding new features

## 🔗 Related Documentation

- [Project Architecture](../ARCHITECTURE.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Main README](../README.md)

## 📞 Support

For issues or questions:
1. Check this README and ARCHITECTURE.md
2. Search existing GitHub issues
3. Create a new issue with detailed description

---

**Happy coding! 🚀**
