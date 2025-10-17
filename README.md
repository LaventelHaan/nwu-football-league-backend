# NWU Sports Manager

A comprehensive sports league management system for North-West University (NWU) featuring user authentication, player management, fixtures, and standings.

## Features

- **Navigation Bar**: Modern navigation with Standings, Fixtures, Players, Login, and Register buttons
- **User Authentication**: Secure login and registration system with password hashing
- **Database Integration**: MySQL database with separate tables for user registration and login credentials
- **Role-based Access**: Support for Admin, Coach, Player, and Scouter roles
- **Responsive Design**: Modern UI with Tailwind CSS

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v18 or higher)
- MySQL Server
- npm or yarn package manager

## Database Setup

1. **Install MySQL Server** (if not already installed)
   - Download from [MySQL Official Website](https://dev.mysql.com/downloads/mysql/)
   - Follow installation instructions for your operating system

2. **Start MySQL Service**
   - Windows: Start MySQL service from Services or use `net start mysql`
   - macOS: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`

3. **Create Database User** (Optional but recommended)
   ```sql
   CREATE USER 'nwusoccer'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON nwusoccer.* TO 'nwusoccer'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Update Database Configuration**
   - Open `app/backend/server.js`
   - Update the database connection settings:
   ```javascript
   const db = mysql.createConnection({
     host: 'localhost',
     user: 'root', // or 'nwusoccer' if you created a specific user
     password: 'your_mysql_password', // Update with your MySQL password
     database: 'nwusoccer'
   });
   ```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nwu-sports-manager1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install additional dependencies for the backend**
   ```bash
   npm install express mysql2 bcryptjs jsonwebtoken cors
   ```

## Running the Application

### Option 1: Run Backend and Frontend Separately

1. **Start the Backend Server**
   ```bash
   npm run server
   ```
   The backend will run on `http://localhost:3001`

2. **Start the Frontend Development Server** (in a new terminal)
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

### Option 2: Run Both Servers Simultaneously

1. **Install concurrently** (if not already installed)
   ```bash
   npm install concurrently --save-dev
   ```

2. **Run both servers**
   ```bash
   npm run dev:full
   ```

## Database Schema

The application automatically creates the following tables:

### `login_table`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password` (VARCHAR(255), NOT NULL) - Hashed using bcrypt
- `role` (ENUM: 'admin', 'coach', 'player', 'scouter')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `register_table`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `first_name` (VARCHAR(255), NOT NULL)
- `last_name` (VARCHAR(255), NOT NULL)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `phone` (VARCHAR(20))
- `role` (ENUM: 'admin', 'coach', 'player', 'scouter')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## API Endpoints

### Authentication

- **POST** `/api/register` - Register a new user
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@nwu.ac.za",
    "phone": "+27123456789",
    "password": "securepassword",
    "role": "player"
  }
  ```

- **POST** `/api/login` - Login user
  ```json
  {
    "email": "john.doe@nwu.ac.za",
    "password": "securepassword"
  }
  ```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
- **JWT Tokens**: Secure authentication tokens for session management
- **Input Validation**: Server-side validation for all user inputs
- **SQL Injection Prevention**: Using parameterized queries

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL server is running
   - Check database credentials in `app/backend/server.js`
   - Verify MySQL user has proper permissions

2. **Port Already in Use**
   - Backend runs on port 3001, frontend on port 3000
   - Kill processes using these ports or change ports in configuration

3. **Module Not Found Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check if all required packages are listed in `package.json`

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Ensure all prerequisites are installed
3. Verify database connection settings
4. Check that both servers are running

## Development

### Project Structure

```
nwu-sports-manager1/
├── app/
│   ├── backend/
│   │   └── server.js          # Backend API server
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── register/
│   │   └── page.tsx           # Registration page
│   └── home/
│       └── page.tsx           # Home page
├── components/
│   └── ui/
│       └── navigation-bar.tsx # Navigation component
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

