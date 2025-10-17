# NWU Sports Manager - Backend Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication](#authentication)
6. [Environment Setup](#environment-setup)
7. [Running the Server](#running-the-server)

## Overview

The NWU Sports Manager backend is a Node.js/Express.js application that serves as the API layer for the sports management system. It handles user authentication, data storage, and business logic for managing sports teams, players, venues, and related operations.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **CORS**: Enabled for cross-origin requests
- **Environment**: Configurable via environment variables

## Database Schema

The database consists of several tables:

### Users Table
- `id`: Primary key
- `first_name`, `last_name`: User's name
- `email`: Unique email address
- `password`: Hashed password
- `role`: User role (admin, coach, player, scout)
- `team`: Associated team
- `position`: Player position (if applicable)
- `created_at`, `updated_at`: Timestamps

### Players Table
- `id`: Primary key
- `name`: Player's full name
- `team`: Team name
- `position`: Playing position
- `age`, `nationality`: Player details
- `goals`, `assists`, `appearances`: Performance metrics
- `yellow_cards`, `red_cards`: Disciplinary records

### Venues Table
- `id`: Primary key
- `name`: Venue name
- `address`: Physical location
- `capacity`: Maximum capacity
- `type`: Type of venue
- `surface`: Playing surface type
- `status`: Current status
- `facilities`: Available amenities

### Other Tables
- `field_bookings`: For managing venue reservations
- `medical_records`: Player health information
- `fixtures`: Match schedules
- `leagues`: Tournament/league information

## API Endpoints

### Authentication
- `POST /api/register`: Register a new user
- `POST /api/login`: User login

### Users Management
- `GET /api/users`: Get all users
- `POST /api/users`: Create a new user
- `PUT /api/users/:id`: Update user
- `DELETE /api/users/:id`: Delete user

### Venues
- `GET /api/venues`: List all venues
- `POST /api/venues`: Add new venue
- `PUT /api/venues/:id`: Update venue
- `DELETE /api/venues/:id`: Remove venue

### Fixtures
- `GET /api/fixtures`: List all matches
- `POST /api/fixtures`: Create new fixture
- `GET /api/fixtures/:id`: Get fixture details
- `PUT /api/fixtures/:id`: Update fixture
- `DELETE /api/fixtures/:id`: Remove fixture

## Authentication

The system uses JWT for authentication. Protected routes require a valid token in the `Authorization` header.

### Login Flow:
1. User submits email/password to `/api/login`
2. Server verifies credentials
3. On success, returns JWT token
4. Client includes token in subsequent requests

### Protected Routes
Most API endpoints require authentication. Include the token in the header:
```
Authorization: Bearer <your-jwt-token>
```

## Environment Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (create a `.env` file):
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=nwusoccer
   JWT_SECRET=your_jwt_secret
   PORT=3002
   ```

3. Database setup:
   - Install MySQL if not already installed
   - Create a new database named `nwusoccer`
   - The server will automatically create tables on startup

## Running the Server

1. Start the server:
   ```bash
   node app/backend/server-fixed.js
   ```
   or with nodemon for development:
   ```bash
   npx nodemon app/backend/server-fixed.js
   ```

2. The server will start on `http://localhost:3002` by default

3. Test the API:
   ```bash
   curl http://localhost:3002/api/test
   ```
   Should return: `{"message":"Backend server is running!"}`

## Error Handling

The API follows RESTful conventions for error responses:
- `200`: Success
- `201`: Resource created
- `400`: Bad request
- `401`: Unauthorized
- `404`: Not found
- `500`: Server error

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens expire after a set duration
- CORS is properly configured
- Input validation is implemented for all endpoints
- SQL injection prevention using parameterized queries

## Testing

Test scripts are available in the root directory:
- `test-backend.js`: Basic API tests
- `test-db.js`: Database connection tests
- `test-venue-api.js`: Venue-related API tests

Run tests with:
```bash
node test-backend.js
```

## Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up HTTPS with a valid certificate
4. Configure proper logging and monitoring
5. Set up database backups

## Troubleshooting

Common issues:
- **Database connection failed**: Verify MySQL is running and credentials are correct
- **Port in use**: Change `PORT` in `.env` or stop the conflicting process
- **JWT errors**: Ensure the secret matches between client and server
- **CORS issues**: Verify the frontend URL is in the allowed origins list

## Support

For any issues or questions, please contact the development team or create an issue in the repository.
