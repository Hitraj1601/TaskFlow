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
│  │ /register    │  │ GET    /api/v1/tasks   │    │
│  │ /login       │  │ POST   /api/v1/tasks   │    │
│  │ /logout      │  │ GET    /api/v1/tasks/:id│   │
│  │ /me          │  │ PUT    /api/v1/tasks/:id│   │
│  └──────────────┘  │ DELETE /api/v1/tasks/:id│   │
│                     └────────────────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │  Admin APIs (role: admin)                │    │
│  │  GET /api/v1/admin/users                 │    │
│  │  GET /api/v1/admin/tasks                 │    │
│  │  DELETE /api/v1/admin/tasks/:id          │    │
│  │  PUT /api/v1/admin/users/:id/role        │    │
│  └──────────────────────────────────────────┘    │
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
│  │ - role     │  └────────────┘                  │
│  └────────────┘                                  │
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
- **Role-based access control** (user vs admin roles)
- JWT tokens stored in HTTP-only cookies (not localStorage)
- Secure cookie flags (HttpOnly, Secure, SameSite)
- bcrypt password hashing with salt rounds of 12
- AES-256 encryption for sensitive response payload fields
- Input sanitization to prevent XSS
- Proper authorization — users access only their own tasks
- Admin endpoints for managing all users and tasks
- Structured error handling with appropriate HTTP status codes
- Environment variables (never hardcoded)
- **API versioning** (v1 prefix for all endpoints)

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
| Role-Based Access | user vs admin roles with middleware enforcement |
| Route Protection | Next.js middleware (frontend) + Express middleware (backend) |
| API Versioning | All endpoints versioned under `/api/v1/` |
| Env Variables | .env / .env.local (never committed) |
| CORS | Configured for frontend origin only |

## How the Frontend-Backend Separation Works

1. **Frontend (Next.js on port 3000)**: Handles UI rendering, route protection via middleware, and proxies all `/api/*` requests to the backend using Next.js rewrites in `next.config.ts`.

2. **Backend (Express.js on port 5000)**: Handles all business logic, database operations, authentication, and API responses. CORS is configured to accept requests from the frontend origin.

3. **Cookie Flow**: The backend sets HTTP-only cookies in responses. Since the frontend proxies requests through Next.js rewrites, cookies are set on the frontend's domain, ensuring seamless authentication.

4. **JWT Verification**: The frontend middleware uses `jose` to verify JWTs for route protection (redirect logic). The backend uses `jsonwebtoken` for full JWT operations (sign, verify) in API routes.

---

## API Versioning

All API endpoints are versioned under `/api/v1/` for future-proof scalability:

| Versioned Route | Description |
|----------------|-------------|
| `POST /api/v1/auth/register` | Register new user |
| `POST /api/v1/auth/login` | Authenticate user |
| `POST /api/v1/auth/logout` | Clear auth cookie |
| `GET /api/v1/auth/me` | Get current user |
| `GET /api/v1/tasks` | List user's tasks |
| `POST /api/v1/tasks` | Create task |
| `GET /api/v1/tasks/:id` | Get task by ID |
| `PUT /api/v1/tasks/:id` | Update task |
| `DELETE /api/v1/tasks/:id` | Delete task |
| `GET /api/v1/admin/users` | List all users (admin) |
| `GET /api/v1/admin/tasks` | List all tasks (admin) |
| `DELETE /api/v1/admin/tasks/:id` | Delete any task (admin) |
| `PUT /api/v1/admin/users/:id/role` | Update user role (admin) |

> Backward-compatible unversioned routes (`/api/auth/*`, `/api/tasks/*`) are also supported.

---

## Role-Based Access Control (RBAC)

Users are assigned one of two roles:

| Role | Permissions |
|------|------------|
| **user** (default) | Register, login, CRUD own tasks, view own profile |
| **admin** | All user permissions + view all users, view/delete all tasks, change user roles |

**How it works:**
- Role is stored in the User model (`role: "user" | "admin"`)
- Role is included in JWT token payload
- Backend middleware `adminMiddleware` checks role before granting access to admin routes
- Admin routes return `403 Forbidden` for non-admin users

---

## API Documentation (Postman)

A complete Postman collection is included at `TaskFlow.postman_collection.json`.

**How to use:**
1. Open Postman
2. Click **Import** → select `TaskFlow.postman_collection.json`
3. Set the `baseUrl` variable to your server URL (default: `http://localhost:3000`)
4. Start testing endpoints!

The collection includes:
- All auth endpoints with example requests/responses
- All CRUD task endpoints
- Admin-only endpoints
- Error response examples
- Query parameter documentation

---

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Clone the repository
git clone <your-repo-url>
cd sell

# Start all services (MongoDB + Backend + Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

This starts:
- **MongoDB** on port 27017
- **Backend API** on port 5000
- **Frontend** on port 3000

### Build Individual Images

```bash
# Backend
cd backend
docker build -t taskflow-backend .

# Frontend
cd ..
docker build -t taskflow-frontend .
```

---

## Scalability Notes

### Current Architecture Strengths
- **Modular structure**: Backend routes, middleware, models, and utils are cleanly separated, making it easy to add new modules (e.g., comments, notifications, teams).
- **Database indexing**: Compound indexes on `user+status` and `user+title` for efficient queries.
- **Pagination**: All list endpoints support configurable pagination to avoid unbounded queries.
- **Stateless auth**: JWT-based authentication allows horizontal scaling without shared session state.

### Scaling Strategies for Production

#### 1. Horizontal Scaling & Load Balancing
- Deploy multiple backend instances behind a load balancer (Nginx, AWS ALB, or Kubernetes Ingress).
- Since auth is stateless (JWT in cookies), any instance can handle any request — no sticky sessions needed.
- Use PM2 cluster mode to utilize all CPU cores on a single server.

#### 2. Caching Layer (Redis)
- Add Redis for:
  - **Session caching**: Cache user profiles to reduce DB lookups on every request.
  - **API response caching**: Cache frequently-read task lists with TTL-based invalidation.
  - **Rate limiting**: Implement sliding-window rate limiting per IP/user.
- Example: Cache `GET /api/v1/tasks` results per user with a 30-second TTL, invalidated on create/update/delete.

#### 3. Database Scaling
- **MongoDB Atlas** auto-scaling with sharding on the `user` field for task collections.
- **Read replicas**: Route read-heavy queries (task listing, search) to secondary replicas.
- **Connection pooling**: Already implemented via Mongoose singleton pattern.

#### 4. Microservices Evolution
- Current monolithic backend can be split into:
  - **Auth Service**: User registration, login, token management
  - **Task Service**: CRUD operations for tasks
  - **Admin Service**: User management, analytics
  - **Notification Service**: Email/push notifications on task status changes
- Use a message queue (RabbitMQ/Redis Streams) for async communication between services.

#### 5. API Gateway
- Add an API Gateway (Kong, AWS API Gateway) for:
  - Rate limiting per API key
  - Request/response transformation
  - API analytics and monitoring
  - SSL termination

#### 6. Monitoring & Observability
- Integrate structured logging (Winston/Pino) with log aggregation (ELK Stack, Datadog).
- Add health check endpoints (already implemented: `/api/v1/health`).
- Implement metrics collection (Prometheus + Grafana) for request latency, error rates, and throughput.

#### 7. CI/CD & DevOps
- Docker containers for consistent deployment (Dockerfiles included).
- Docker Compose for local development and testing.
- GitHub Actions for automated testing, linting, and deployment.

---

## License

MIT
