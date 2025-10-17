# MySQL Setup Guide

## If you don't know your MySQL password:

### Method 1: Reset MySQL Password
1. Open Command Prompt as Administrator
2. Stop MySQL service:
   ```
   net stop mysql
   ```
3. Start MySQL in safe mode:
   ```
   mysqld --skip-grant-tables
   ```
4. Open another Command Prompt and connect:
   ```
   mysql -u root
   ```
5. Reset password:
   ```sql
   USE mysql;
   UPDATE user SET authentication_string=PASSWORD('newpassword') WHERE User='root';
   FLUSH PRIVILEGES;
   EXIT;
   ```
6. Restart MySQL service:
   ```
   net start mysql
   ```

### Method 2: Use XAMPP (Recommended)
1. Download XAMPP from https://www.apachefriends.org/
2. Install XAMPP
3. Open XAMPP Control Panel
4. Start MySQL service
5. Default password is usually empty (no password)

### Method 3: Check if MySQL is running with no password
Try these common configurations:

1. **No password** (empty string):
   ```javascript
   password: ''
   ```

2. **Common passwords**:
   ```javascript
   password: 'root'
   password: 'password'
   password: 'admin'
   ```

3. **Check Windows Services**:
   - Press `Win + R`, type `services.msc`
   - Look for MySQL service
   - Right-click and check properties

## After setting up MySQL:

1. Update the password in `app/backend/server.js` and `test-db.js`
2. Run: `node test-db.js` to test connection
3. If successful, run: `node app/backend/server.js` to start the server
4. In another terminal, run: `npm run dev` to start the frontend

## Quick Test Commands:

```bash
# Test database connection
node test-db.js

# Start backend server
node app/backend/server.js

# Start frontend (in new terminal)
npm run dev
```

