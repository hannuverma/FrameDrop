# FrameDrop 🎬

A room-based media sharing platform that lets users create collaborative spaces to share and manage photos together.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Room Management**: Create, join, and manage collaborative rooms
- **Photo Sharing**: Upload and share photos within rooms
- **Member Roles**: Owner, Admin, and Member roles with different permissions
- **Real-time Gallery**: View and manage shared photos in a dynamic gallery
- **Member Management**: Manage room members and their roles
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **Framer Motion** - Smooth animations
- **Babel** - JSX transpilation
- **CSS3** - Modern styling with custom properties

### Backend
- **Node.js** - Runtime environment
- **Express.js 5.2.1** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage and CDN

### Development Tools
- **ESLint** - Code linting
- **Jest** - Testing framework
- **Nodemon** - Development server with auto-reload
- **Docker** - Containerization

## 📁 Project Structure

```
FrameDrop/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── app.js          # Express app setup
│   │   ├── db/             # Database configuration
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Helper functions
│   ├── package.json        # Dependencies
│   ├── server.js           # Server entry point
│   ├── .env                # Environment variables
│   └── DockerFile          # Container configuration
├── FrameDrop/              # Frontend files
│   ├── auth.html           # Authentication page
│   ├── lobby.html          # Room list page
│   ├── room.html           # Room page
│   ├── css/                # Stylesheets
│   └── js/                 # Frontend JavaScript
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   └── styles/         # Component styles
│   └── package.json        # Dependencies
├── ARCHITECTURE.md         # Detailed architecture documentation
├── CONTRIBUTING.md         # Contribution guidelines
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- MongoDB (local or MongoDB Atlas)
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy and edit .env file
cp .env .env.local
```

Required environment variables:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Open the frontend files in your browser or set up a local development server:
```bash
# Option 1: Use a simple HTTP server
python -m http.server 8000

# Option 2: Use live-server
npx live-server
```

2. Access the application at `http://localhost:8000` (or your chosen port)

## 💻 Development

### Backend Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run linter
npm run lint
```

### Project Guidelines

- Follow the code style defined in `.eslintrc.config.mjs`
- Write tests for new features
- Update ARCHITECTURE.md if making significant changes
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines

## 🐳 Docker Deployment

Build and run the backend using Docker:

```bash
# Build the image
docker build -f backend/DockerFile -t framedrop-backend .

# Run the container
docker run -p 3000:3000 \
  -e MONGODB_URI=your_connection_string \
  -e JWT_SECRET=your_secret \
  framedrop-backend
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| GET | `/auth/verify` | Verify JWT token |

### Room Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rooms` | List all public rooms and joined rooms |
| POST | `/rooms` | Create a new room |
| GET | `/rooms/:roomId` | Get room details |
| PUT | `/rooms/:roomId` | Update room info |
| DELETE | `/rooms/:roomId` | Delete room (Owner only) |
| POST | `/rooms/:roomId/join` | Join a room |
| POST | `/rooms/:roomId/leave` | Leave a room |

### Photo Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rooms/:roomId/photos` | List room photos |
| POST | `/rooms/:roomId/photos` | Upload a photo |
| DELETE | `/rooms/:roomId/photos/:photoId` | Delete a photo |

### Member Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rooms/:roomId/members` | List room members |
| PUT | `/rooms/:roomId/members/:memberId` | Update member role |
| DELETE | `/rooms/:roomId/members/:memberId` | Remove member |

For detailed API documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md#backend-architecture)

## 📖 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture and design
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to the project
- **Backend README** - [backend/README.md](./backend/README.md)

## 🔐 Security

FrameDrop implements several security measures:

- **Password Hashing**: Bcrypt for secure password storage
- **JWT Authentication**: Stateless token-based authentication
- **Input Validation**: Server-side validation of all inputs
- **CORS Protection**: Cross-origin resource sharing configuration
- **Authorization**: Role-based access control on all endpoints
- **HTTPS Ready**: Prepared for secure connections

## 🚢 Deployment

### Frontend
- Deploy static files to Vercel, Netlify, or AWS S3
- Configure CORS headers for API communication

### Backend
- Deploy to Heroku, AWS, DigitalOcean, or any Node.js hosting
- Set up environment variables on your hosting platform
- Use MongoDB Atlas for managed database

## 🐛 Issues & Support

Found a bug? Have a feature request? Please open an issue on GitHub with:
- Clear description of the problem
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code of conduct
- Development setup
- Pull request process
- Coding standards

## 📞 Contact

For questions or inquiries, please reach out through GitHub issues.

---

Made with ❤️ by Hannu Verma
