# Child Care Compass - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

## Database Setup

1. Create a PostgreSQL database:
```bash
createdb childcare_compass
```

2. Copy the environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=childcare_compass
DB_USER=postgres
DB_PASSWORD=your_password
```

4. Initialize the database:
```bash
npm run init-db
```

This will create all tables and insert demo data.

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode (Recommended)

Run both frontend and backend concurrently:
```bash
npm run dev:all
```

Or run them separately:

**Frontend:**
```bash
npm run dev
```
Access at: http://localhost:5173

**Backend:**
```bash
npm run dev:server
```
Access at: http://localhost:3001

### Production Mode

1. Build the frontend:
```bash
npm run build
```

2. Start the backend server:
```bash
npm run server
```

## Demo Credentials

After running the database initialization, use these credentials to log in:

- **Admin**: admin@demo.com / demo123
- **Teacher**: teacher@demo.com / demo123
- **Parent**: parent@demo.com / demo123

## Features

### Implemented

✅ User authentication (JWT-based)
✅ Role-based access control (Admin, Teacher, Parent)
✅ Child management (CRUD operations)
✅ Attendance tracking (check-in/check-out)
✅ Activity logging (photos, meals, naps, etc.)
✅ Real-time updates (WebSocket/Socket.io)
✅ Messaging system
✅ Kanban-style daily operations board
✅ Multi-tenant architecture
✅ Health records and immunizations
✅ Consent forms management
✅ Shift scheduling
✅ Lesson planning

### Tech Stack

**Frontend:**
- React 19 with TypeScript
- React Router (HashRouter)
- TanStack Query (React Query)
- Zustand (State Management)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Socket.io Client (Real-time)

**Backend:**
- Express.js
- PostgreSQL with pg driver
- Socket.io (WebSocket)
- JWT Authentication
- bcrypt (Password hashing)
- Zod (Validation)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user

### Children
- `GET /api/children` - Get all children
- `GET /api/children/:id` - Get single child
- `POST /api/children` - Create child
- `PUT /api/children/:id` - Update child
- `DELETE /api/children/:id` - Delete child

### Activities
- `GET /api/activities` - Get activities
- `POST /api/activities` - Create activity
- `POST /api/activities/bulk` - Create bulk activities

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/check-in` - Check in child
- `POST /api/attendance/check-out` - Check out child

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `PATCH /api/messages/:id/read` - Mark as read

## Architecture

The application follows a multi-tenant SaaS architecture where each childcare center is isolated by `center_id`. All API requests are scoped to the authenticated user's center.

### Database Schema

See `backend/config/schema.sql` for the complete database schema including:
- Centers (tenant root)
- Users (Admin, Teacher, Parent roles)
- Children
- Classrooms
- Activities
- Attendance
- Messages
- Invoices
- Health records
- Consent forms
- Lesson plans

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify the database exists: `psql -l | grep childcare_compass`

### Port Already in Use
- Frontend (5173): Change in `vite.config.ts`
- Backend (3001): Change `PORT` in `.env`

### WebSocket Connection Failed
- Ensure backend is running
- Check CORS settings in `backend/server.ts`
- Verify `VITE_API_URL` in frontend `.env`

## Contributing

This is a demo application showcasing a modern childcare management system. Feel free to extend it with additional features!
