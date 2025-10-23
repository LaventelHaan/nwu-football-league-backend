// scripts/fix-admin-password.js
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fixAdminPassword() {
    const plainTextPassword = "player@123";
    
    console.log('Generating new hash for password:', plainTextPassword);
    
    // Generate a fresh hash
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(plainTextPassword, saltRounds);
    
    console.log('New password hash:', passwordHash);
    
    // Verify the hash works
    const isValid = await bcrypt.compare(plainTextPassword, passwordHash);
    console.log('Hash verification test:', isValid);
    
    if (!isValid) {
        console.log('❌ Hash verification failed!');
        return;
    }
    
    // Database connection
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '2004Jul19@1',
        database: process.env.DB_NAME || 'nwu_sports_league',
    });
    
    try {
        // Update the user's password
        const [result] = await connection.execute(
            'UPDATE users SET password_hash = ? WHERE user_id = ?',
            [passwordHash, 18]
        );
        
        if (result.affectedRows > 0) {
            console.log('✅ Admin password updated successfully!');
            console.log('User ID: 100');
            console.log('Email: admin@nwu.ac.za');
            console.log('Password: admin@123');
            console.log('New Hash:', passwordHash);
            
            // Verify the update
            const [users] = await connection.execute(
                'SELECT user_id, email, password_hash FROM users WHERE user_id = ?',
                [100]
            );
            
            console.log('Updated record:', users[0]);
        } else {
            console.log('❌ No user found with ID 100');
        }
    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        await connection.end();
    }
}

fixAdminPassword();