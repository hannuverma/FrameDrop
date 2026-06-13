# FrameDrop Architecture

## Overview

FrameDrop is a room-based media sharing platform built with a modern client-server architecture. The application enables users to create collaborative spaces (rooms) where they can share and manage photos with role-based access control.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Browser                    │
│  ┌──────────────────────────────────────────────┐   │
│  │   React Frontend (Single Page Application)   │   │
│  │  • Authentication Pages (auth.html)          │   │
│  │  • Lobby/Room List (lobby.html)              │   │
│  │  • Room Gallery (room.html, Room.jsx)        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────┬──────────────────────────────────┘
                  │ HTTP/WebSocket
                  ↓
┌─────────────────────────────────────────────────────┐
│              Backend API Server                      │
│  ┌──────────────────────────────────────────────┐   │
│  │   Express.js REST API                        │   │
│  │  • Authentication endpoints                  │   │
│  │  • Room management endpoints                 │   │
│  │  • Photo upload/management endpoints         │   │
│  │  • Member management endpoints               │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────┬──────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────┐
│              MongoDB Database                        │
│  • Users collection                                 │
│  • Rooms collection                                 │
│  • Photos collection                                │
│  • Relationships and indexing                       │
└─────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 18.3.1** - UI framework
- **Framer Motion** - Animation library
- **Babel** - JSX transpilation
- **CSS3** - Styling with custom properties

### Key Components

#### Authentication Pages (`FrameDrop/auth.html`)
- **Purpose**: User login and registration
- **Features**:
  - Split-layout design (visual + form)
  - Responsive form validation
  - Session management
  - Error handling and feedback

#### Lobby Page (`FrameDrop/lobby.html`)
- **Purpose**: Room discovery and management
- **Features**:
  - Room card grid with cover images
  - Create new room action
  - Role badges (Owner, Admin)
  - Room navigation and search

#### Room Page (`FrameDrop/room.html` & `frontend/src/pages/Room.jsx`)
- **Purpose**: Main collaboration space
- **Key Features**:
  - Photo gallery (masonry/grid layout)
  - Real-time member sidebar
  - Drag-and-drop image upload
  - Photo upload metadata display
  - Member role management
  - Toast notifications
  - Admin/Owner controls

### Component Hierarchy

```
App
├── AuthPage (auth.html)
│   ├── SplitLayout
│   ├── VisualPane
│   └── FormPane
│       └── AuthCard
├── LobbyPage (lobby.html)
│   ├── Header
│   ├── ActionButtons
│   ├── RoomGrid
│   │   └── RoomCard (multiple)
│   └── CreateRoomModal
└── RoomPage (Room.jsx)
    ├── PhotoGallery
    │   └── PhotoCard (multiple)
    ├── Sidebar
    │   └── MemberList
    │       └── MemberRow (multiple)
    ├── FAB (Floating Action Button)
    ├── DragOverlay
    ├── Toast
    └── UploadForm (hidden)
```

### Styling Architecture

**Design System (CSS Variables):**
```css
/* Colors */
--bg: #09090b              /* Primary background */
--surface: rgba(24,24,27,0.6)  /* Secondary background */
--surface-solid: #18181b   /* Solid surface */
--fg: #fafafa              /* Foreground/text */
--muted: #a1a1aa          /* Muted text */
--border: rgba(255,255,255,0.1) /* Borders */
--accent: #a855f7         /* Primary accent (purple) */
--accent-hover: #9333ea   /* Accent hover state */
--accent-soft: rgba(168,85,247,0.15) /* Soft accent */

/* Typography */
--font-display: 'Quicksand', system-ui, sans-serif  /* Headings */
--font-body: 'Inter', system-ui, sans-serif         /* Body text */

/* Spacing */
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
```

**Layout Patterns:**
- Flexbox for component layouts
- CSS Grid for photo galleries
- Glass-morphism with backdrop-filter
- Smooth transitions and animations
- Mobile-first responsive design

### Responsive Breakpoints

```
Mobile: < 600px
Tablet: 600px - 900px  
Desktop: > 900px

Key changes:
- 900px: Hide sidebar, adjust FAB position
- 900px: Room grid adjusts columns
- 600px: Single column layout, optimized touch targets
```

## Backend Architecture

### REST API Structure

#### Authentication Endpoints
```
POST   /auth/register          Register new user
POST   /auth/login             User login
POST   /auth/logout            User logout
GET    /auth/verify            Verify token
```

#### Room Endpoints
```
GET    /rooms                  List all rooms (public/joined)
POST   /rooms                  Create new room
GET    /rooms/:roomId          Get room details
PUT    /rooms/:roomId          Update room (name, description)
DELETE /rooms/:roomId          Delete room (Owner only)
POST   /rooms/:roomId/join     Join a room
POST   /rooms/:roomId/leave    Leave a room
```

#### Photo Endpoints
```
POST   /rooms/:roomId/photos              Upload photo
GET    /rooms/:roomId/photos              List room photos
DELETE /rooms/:roomId/photos/:photoId     Delete photo
```

#### Member Endpoints
```
GET    /rooms/:roomId/members                  List room members
PUT    /rooms/:roomId/members/:memberId        Update member role
DELETE /rooms/:roomId/members/:memberId        Remove member
```

### Data Models

#### User Model
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  avatar: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

#### Room Model
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  owner: ObjectId (User),
  coverImage: String (URL),
  members: [
    {
      user: ObjectId (User),
      role: String (Owner|Admin|Member),
      joinedAt: Date
    }
  ],
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Photo Model
```javascript
{
  _id: ObjectId,
  room: ObjectId (Room),
  uploader: ObjectId (User),
  url: String,
  filename: String,
  size: Number,
  mimeType: String,
  uploadedAt: Date
}
```

### Authentication & Authorization

**Authentication Flow:**
1. User registers/logs in via auth.html
2. Server validates credentials
3. JWT token issued and stored in HTTP-only cookie
4. Token included in subsequent requests
5. Server validates token on protected routes

**Authorization Levels:**
- **Owner**: Full room control, member management, delete room
- **Admin**: Manage members, moderate content, upload/delete photos
- **Member**: View room, upload/delete own photos

### Data Relationships

```
User (1) ──→ (many) Room (as owner)
User (1) ──→ (many) Room (as member via Room.members[])
User (1) ──→ (many) Photo (as uploader)

Room (1) ──→ (many) Photo
Room (1) ──→ (many) Members
```

## State Management

### Frontend State
- **User Auth State**: Logged-in user, token
- **Room State**: Current room data, members, photos
- **UI State**: Toast notifications, drag-over status, modals
- **Upload State**: Progress, pending uploads

### Backend Session Management
- JWT tokens for stateless authentication
- MongoDB for persistent data storage
- In-memory cache for real-time updates (optional)

## File Upload Flow

```
User selects/drags image
    ↓
FormData with file + room ID
    ↓
POST /rooms/:roomId/photos
    ↓
Server receives file
    ↓
Validate file (size, type)
    ↓
Store in file system / cloud storage
    ↓
Create Photo document in MongoDB
    ↓
Return photo metadata
    ↓
Client adds to gallery
    ↓
Toast notification
```

## Real-Time Features

### Current Implementation
- Form submission for uploads
- Page refresh for new photos
- Manual member list updates

### Future Enhancements
- WebSocket connection for live updates
- Real-time photo gallery refresh
- Live member presence indicators
- Activity feed

## Security Considerations

**Frontend:**
- Input validation on forms
- XSS protection via React
- HTTPS for data transmission
- Token refresh mechanism

**Backend:**
- Password hashing (bcrypt)
- SQL injection prevention (MongoDB)
- Rate limiting on endpoints
- CORS configuration
- Input sanitization
- Authorization checks on all endpoints

**Data:**
- JWT tokens (stateless)
- HTTP-only cookies
- Secure password policies
- File type validation

## Performance Optimization

**Frontend:**
- CSS animations for smooth UX
- Lazy loading for images (implied)
- CSS custom properties for theming
- Minified production builds
- Browser caching

**Backend:**
- Database indexing on frequent queries
- Pagination for large result sets
- Caching strategies (Redis optional)
- Compression for responses
- CDN for static assets

**Images:**
- Compression on upload
- Multiple size variants (thumbnail, medium, full)
- Format optimization (WebP, JPEG)

## Development Workflow

1. **Local Development**
   - Frontend: Served from static files
   - Backend: Node.js dev server
   - Database: Local MongoDB

2. **Testing**
   - Unit tests for API endpoints
   - Integration tests for workflows
   - E2E tests for critical paths

3. **Deployment**
   - Frontend: Static hosting (Vercel, Netlify)
   - Backend: Cloud platform (Heroku, AWS, DigitalOcean)
   - Database: MongoDB Atlas or self-hosted
   - File storage: AWS S3 or local storage

## Future Architecture Improvements

- [ ] WebSocket for real-time updates
- [ ] Message queue for async operations
- [ ] Microservices for scaling
- [ ] GraphQL API alternative
- [ ] Mobile app (React Native)
- [ ] Service workers for offline support
- [ ] Video streaming capabilities

## Technology Decision Rationale

| Component | Choice | Reason |
|-----------|--------|--------|
| Frontend | React | Component reusability, ecosystem, performance |
| Animation | Framer Motion | Declarative animations, smooth performance |
| Backend | Express.js | Lightweight, flexible, JavaScript ecosystem |
| Database | MongoDB | Flexible schema, document-based, scalability |
| Styling | CSS + Variables | Light-weight, maintainable, modern browser support |
| Auth | JWT | Stateless, scalable, modern standard |

---

This architecture is designed to be scalable, maintainable, and user-friendly while remaining simple enough for a project of this scope.
