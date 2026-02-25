# TaskFlow - Task Management Application

A production-ready full-stack Task Management Application with a **separated frontend and backend architecture**. Built with **Next.js** (frontend), **Express.js** (backend), **MongoDB**, and **TypeScript**. Features JWT authentication with HTTP-only cookies, AES encryption for sensitive data, full CRUD operations with pagination/filtering/search, and a clean responsive UI.

## Live Demo

- **Live URL**: [Your deployed URL here]
- **GitHub Repository**: [Your GitHub URL here]

---

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│              Frontend (Next.js)                   │
│  Port: 3000                                      │
│  Next.js App Router (React + Tailwind CSS)       │
│  ┌────────┐  ┌──────────┐  ┌──────────────┐     │
│  │ Login  │  │ Register │  │  Dashboard   │     │
│  └────────┘  └──────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────┐    │
│  │  Next.js Middleware                      │    │
│  │  (Route protection using jose JWT)       │    │
│  └──────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │  Next.js Rewrites (API Proxy)            │    │
│  │  /api/* → Backend server                 │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────┬────────────────────────────┘
                      │ Proxied HTTP Requests
                      │ (JWT in HTTP-only Cookie)
┌─────────────────────▼────────────────────────────┐
│              Backend (Express.js)                 │
│  Port: 5000                                      │
│  ┌──────────────┐  ┌────────────────────────┐    │
│  │  Auth APIs   │  │     Task APIs          │    │
│  │ /register    │  │ GET    /api/tasks      │    │
│  │ /login       │  │ POST   /api/tasks      │    │
│  │ /logout      │  │ GET    /api/tasks/:id  │    │
│  │ /me          │  │ PUT    /api/tasks/:id  │    │
│  └──────────────┘  │ DELETE /api/tasks/:id  │    │
│                     └────────────────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │  Security Layer                          │    │
│  │  • bcrypt password hashing (salt: 12)    │    │
│  │  • AES-256 payload encryption            │    │
│  │  • Input sanitization & validation       │    │
│  │  • HTTP-only Secure cookies              │    │
│  │  • JWT auth middleware                   │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────┬────────────────────────────┘
                      │ Mongoose ODM
┌─────────────────────▼────────────────────────────┐
│              MongoDB Atlas                        │
│  ┌────────────┐  ┌────────────┐                  │
│  │   Users    │  │   Tasks    │                  │
│  │ - name     │  │ - title    │                  │
│  │ - email    │  │ - desc     │                  │
│  │ - password │  │ - status   │                  │
│  │   (hashed) │  │ - user ref │                  │
│  └────────────┘  └────────────┘                  │
└──────────────────────────────────────────────────┘
```

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend    | Express.js (Standalone REST API)    |
| Database   | MongoDB with Mongoose ODM           |
| Auth       | JWT (jsonwebtoken + jose), bcryptjs |
| Encryption | AES-256 (crypto-js)                 |
| Language   | TypeScript (both frontend & backend)|
| Deployment | Vercel (frontend) + any Node.js host (backend) |

## Features

### Authentication & Security
- User registration with input validation
- Login with email/password
- JWT tokens stored in HTTP-only cookies (not localStorage)
- Secure cookie flags (HttpOnly, Secure, SameSite)
- bcrypt password hashing with salt rounds of 12
- AES-256 encryption for sensitive response payload fields
- Input sanitization to prevent XSS
- Proper authorization — users access only their own tasks
- Structured error handling with appropriate HTTP status codes
- Environment variables (never hardcoded)

### Task Management
- **Create** tasks with title, description, and status
- **Read** tasks with pagination (configurable page size)
- **Update** task title, description, and status
- **Delete** tasks with confirmation dialog
- **Filter** tasks by status (Todo, In Progress, Done)
- **Search** tasks by title (case-insensitive partial match)
- Quick status change from task cards

### Frontend
- Protected routes via Next.js middleware
- Responsive design with Tailwind CSS
- Clean, modern UI with loading states
- Delete confirmation modal
- Form validation with error messages
- Auto-redirect authenticated users from auth pages
- API proxy via Next.js rewrites (seamless cookie handling)

### Backend
- RESTful API with Express.js
- CORS configured for frontend origin
- Cookie-parser for JWT cookie handling
- Express auth middleware for route protection
- MongoDB connection with caching (singleton pattern)
- Input validation and sanitization layer

## Project Structure

```
sell/
├── backend/                          # Express.js Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .gitignore
│   └── src/
│       ├── server.ts                 # Express server entry point
│       ├── config/
│       │   └── db.ts                 # MongoDB connection (cached)
│       ├── middleware/
│       │   └── auth.ts               # JWT auth middleware & utilities
│       ├── models/
│       │   ├── User.ts               # User model (bcrypt hashing)
│       │   └── Task.ts               # Task model
│       ├── routes/
│       │   ├── auth.ts               # Auth routes (register/login/logout/me)
│       │   └── tasks.ts              # Task CRUD routes
│       └── utils/
│           ├── crypto.ts             # AES-256 encryption/decryption
│           └── validation.ts         # Input validation & sanitization
│
├── frontend/                         # Next.js Frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts                # Next.js config & security headers
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   ├── .env.example
│   ├── .gitignore
│   └── src/
│       ├── middleware.ts             # Route protection (jose JWT)
│       ├── lib/
│       │   └── auth.ts              # Server-side auth helpers
│       ├── app/
│       │   ├── globals.css           # Tailwind CSS imports
│       │   ├── layout.tsx            # Root layout
│       │   ├── page.tsx              # Landing page
│       │   ├── login/page.tsx        # Login page
│       │   ├── register/page.tsx     # Registration page
│       │   └── dashboard/page.tsx    # Protected dashboard
│       └── components/
│           ├── Navbar.tsx            # Navigation bar
│           ├── TaskCard.tsx          # Task display card
│           ├── TaskForm.tsx          # Create/Edit task form
│           └── Pagination.tsx        # Pagination controls
│
└── README.md                         # This file
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd sell
```

### 2. Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Edit .env with your values:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
# JWT_SECRET=your-strong-random-secret-key
# AES_SECRET_KEY=your-aes-256-encryption-key-32ch
# PORT=5000
# FRONTEND_URL=http://localhost:3000
# NODE_ENV=development

# Start backend in development mode
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Setup Frontend

```bash
# Open a new terminal, navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Edit .env.local with your values:
# NEXT_PUBLIC_API_URL=http://localhost:5000
# JWT_SECRET=your-strong-random-secret-key (same as backend)

# Start frontend in development mode
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Build for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## Deployment

### Backend Deployment (Railway / Render / any Node.js host)
1. Push code to GitHub
2. Connect `backend/` folder to your hosting provider
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Connect `frontend/` folder to [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your deployed backend URL
   - `JWT_SECRET` = same as backend
4. Deploy

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST /api/auth/register
Create a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "encryptedEmail": "U2FsdGVkX1+..."
    }
  }
}
```

**Error (400 Validation):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" }
  ]
}
```

**Error (409 Conflict):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

#### POST /api/auth/login
Authenticate user and receive JWT cookie.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "encryptedEmail": "U2FsdGVkX1+..."
    }
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

#### POST /api/auth/logout
Clear authentication cookie.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET /api/auth/me
Get current authenticated user info.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

---

### Task Endpoints

> All task endpoints require authentication (JWT cookie).

#### GET /api/tasks
List tasks with pagination, filtering, and search.

**Query Parameters:**
| Parameter  | Type   | Default     | Description                     |
|-----------|--------|-------------|---------------------------------|
| page      | number | 1           | Page number                     |
| limit     | number | 10          | Items per page (max 50)         |
| status    | string | -           | Filter: todo, in-progress, done |
| search    | string | -           | Search by title                 |
| sortBy    | string | createdAt   | Sort field                      |
| sortOrder | string | desc        | Sort order: asc or desc         |

**Example:** `GET /api/tasks?page=1&limit=10&status=todo&search=deploy`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "65f1b2c3d4e5f6a7b8c9d0e1",
        "title": "Deploy application",
        "description": "Deploy to Vercel",
        "status": "todo",
        "user": "65f1a2b3c4d5e6f7a8b9c0d1",
        "createdAt": "2026-02-25T10:30:00.000Z",
        "updatedAt": "2026-02-25T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

#### POST /api/tasks
Create a new task.

**Request:**
```json
{
  "title": "Complete API integration",
  "description": "Connect frontend to backend APIs",
  "status": "todo"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "65f1b2c3d4e5f6a7b8c9d0e1",
      "title": "Complete API integration",
      "description": "Connect frontend to backend APIs",
      "status": "todo",
      "user": "65f1a2b3c4d5e6f7a8b9c0d1",
      "createdAt": "2026-02-25T10:30:00.000Z",
      "updatedAt": "2026-02-25T10:30:00.000Z"
    }
  }
}
```

---

#### GET /api/tasks/:id
Get a specific task by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "task": {
      "_id": "65f1b2c3d4e5f6a7b8c9d0e1",
      "title": "Complete API integration",
      "description": "Connect frontend to backend APIs",
      "status": "todo",
      "createdAt": "2026-02-25T10:30:00.000Z"
    }
  }
}
```

---

#### PUT /api/tasks/:id
Update a task (partial updates supported).

**Request:**
```json
{
  "title": "Updated title",
  "status": "in-progress"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "_id": "65f1b2c3d4e5f6a7b8c9d0e1",
      "title": "Updated title",
      "description": "Connect frontend to backend APIs",
      "status": "in-progress",
      "updatedAt": "2026-02-25T11:00:00.000Z"
    }
  }
}
```

---

#### DELETE /api/tasks/:id
Delete a task.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

## Security Implementation Details

| Feature | Implementation |
|---------|-------------|
| Password Hashing | bcrypt with 12 salt rounds |
| JWT Storage | HTTP-only cookie (not localStorage) |
| Cookie Flags | HttpOnly, Secure (prod), SameSite=Lax |
| Payload Encryption | AES-256 via crypto-js |
| Input Sanitization | XSS prevention, HTML tag removal |
| Authorization | User-scoped task queries (MongoDB filter) |
| Route Protection | Next.js middleware (frontend) + Express middleware (backend) |
| Env Variables | .env / .env.local (never committed) |
| CORS | Configured for frontend origin only |

## How the Frontend-Backend Separation Works

1. **Frontend (Next.js on port 3000)**: Handles UI rendering, route protection via middleware, and proxies all `/api/*` requests to the backend using Next.js rewrites in `next.config.ts`.

2. **Backend (Express.js on port 5000)**: Handles all business logic, database operations, authentication, and API responses. CORS is configured to accept requests from the frontend origin.

3. **Cookie Flow**: The backend sets HTTP-only cookies in responses. Since the frontend proxies requests through Next.js rewrites, cookies are set on the frontend's domain, ensuring seamless authentication.

4. **JWT Verification**: The frontend middleware uses `jose` to verify JWTs for route protection (redirect logic). The backend uses `jsonwebtoken` for full JWT operations (sign, verify) in API routes.

## License

MIT
