# NWU Sports Manager - Frontend Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Authentication Flow](#authentication-flow)
5. [Routing](#routing)
6. [State Management](#state-management)
7. [UI Components](#ui-components)
8. [API Integration](#api-integration)
9. [Development Setup](#development-setup)
10. [Environment Variables](#environment-variables)
11. [Building for Production](#building-for-production)
12. [Testing](#testing)
13. [Best Practices](#best-practices)

## Overview

The NWU Sports Manager frontend is a modern web application built with Next.js, providing a responsive and interactive user interface for managing sports teams, players, fixtures, and more. The application follows a role-based access control (RBAC) system with different views for administrators, coaches, and players.

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI Primitives
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context API
- **Data Fetching**: Native Fetch API with SWR
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
app/
├── admin/                 # Admin dashboard and management
│   ├── dashboard/         # Admin overview
│   ├── users/             # User management
│   ├── teams/             # Team management
│   ├── players/           # Player management
│   ├── fixtures/          # Match scheduling
│   ├── venues/            # Venue management
│   └── ...
├── coach/                 # Coach-specific features
│   ├── dashboard/         # Coach overview
│   ├── team/              # Team management
│   ├── players/           # Player management
│   ├── matches/           # Match management
│   └── ...
├── scout/
│   ├──dashboard/ (scout overview)
│   ├──prospects/ (prospect player management)
│   ├──reports/ (scouting reports)
│   ├──events/ (scouting events)
│   ├──regions/ (scouting regions)
│   └── ...
├── players/               # Player-specific features
│   └── [id]/              # Dynamic player profiles
├── auth/                  # Authentication pages
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configs
├── styles/                # Global styles
└── ...
```

## Authentication Flow

1. **Login**
   - User submits credentials to `/api/auth/login`
   - On success, receives JWT token
   - Token is stored in HTTP-only cookies
   - User is redirected to appropriate dashboard based on role

2. **Protected Routes**
   - Uses Next.js middleware for route protection
   - Redirects unauthenticated users to login
   - Role-based access control for admin/coach/player routes

3. **Session Management**
   - Token refresh mechanism
   - Automatic redirect on token expiration
   - Role-based UI rendering

## Routing

The application uses Next.js App Router with the following main routes:

- `/` - Public home page
- `/login` - User authentication
- `/register` - New user registration
- `/admin/*` - Admin dashboard and management
- `/coach/*` - Coach dashboard and team management
- `/players/*` - Player profiles and statistics
- `/fixtures` - Match schedules and results
- `/standings` - League standings

## State Management

- **Local State**: React `useState` for component-level state
- **Global State**: React Context API for app-wide state
  - Auth context (user, token, roles)
  - UI context (theme, notifications)
  - Data cache context (cached API responses)

## UI Components

The application uses a component library built on Radix UI primitives with custom styling. Key components include:

- **Layout Components**: `MainLayout`, `DashboardLayout`
- **Navigation**: `Sidebar`, `TopNav`, `Breadcrumbs`
- **Data Display**: `DataTable`, `Card`, `Badge`
- **Forms**: `Input`, `Select`, `DatePicker`, `FormField`
- **Feedback**: `Toast`, `Alert`, `Dialog`
- **Data Visualization**: `StatsCard`, `ProgressBar`

## API Integration

The frontend communicates with the backend REST API using:

- **API Routes**: Next.js API routes for server-side requests
- **Data Fetching**: `fetch` API with custom hooks
- **Error Handling**: Global error boundary and API error handling
- **Authentication**: Token-based authentication with interceptors

Example API service:

```typescript
// services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
};
```

## Development Setup

1. **Prerequisites**
   - Node.js 18+
   - npm or yarn
   - MySQL database

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3002
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run Development Server**
   ```bash
   # Start frontend
   npm run dev
   
   # In a separate terminal, start backend
   npm run server
   ```

5. **Access the App**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | `http://localhost:3002` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes | - |
| `NEXTAUTH_URL` | Base URL of the site | Yes | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | No | `development` |

## Building for Production

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

3. **Environment Variables**
   Ensure all production environment variables are set in your hosting platform.

## Testing

The application includes the following test types:

- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Storybook + Chromatic
- **E2E Tests**: Cypress

Run tests:
```bash
# Unit tests
npm test

# E2E tests
npm run cypress:open
```

## Best Practices

1. **Component Design**
   - Follow Atomic Design principles
   - Keep components small and focused
   - Use TypeScript for type safety

2. **State Management**
   - Lift state up when needed
   - Use context for global state
   - Avoid prop drilling

3. **Performance**
   - Code splitting with dynamic imports
   - Image optimization
   - Lazy loading for components

4. **Security**
   - Input validation
   - XSS protection
   - Secure HTTP headers

5. **Accessibility**
   - Semantic HTML
   - ARIA attributes
   - Keyboard navigation

## Deployment

The application can be deployed to:

- Vercel (recommended)
- Netlify
- AWS Amplify
- Any Node.js hosting platform

## Support

For any issues or questions, please contact the development team or create an issue in the repository.
