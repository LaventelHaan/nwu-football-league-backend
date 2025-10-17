const mysql = require('mysql2');

console.log('Testing database connection...');

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'debruyne17',
  database: 'nwusoccer'
};

const connection = mysql.createConnection(dbConfig);

// Test connection
connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:');
    console.error('Error details:', err.message);
    console.log('\n=== TROUBLESHOOTING ===');
    console.log('1. Make sure MySQL is installed and running');
    console.log('2. Check if the database "nwusoccer" exists');
    console.log('3. Verify the username and password are correct');
    console.log('4. Try creating the database manually:');
    console.log('   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nwusoccer;"');
    process.exit(1);
  }

  console.log('✅ Successfully connected to MySQL database!');
  console.log('Host:', dbConfig.host);
  console.log('Database:', dbConfig.database);
  console.log('User:', dbConfig.user);

  // Test a simple query
  connection.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      console.error('❌ Query test failed:', err);
    } else {
      console.log('✅ Query test successful:', results[0]);
    }

    // Close connection
    connection.end((err) => {
      if (err) {
        console.error('Error closing connection:', err);
      } else {
        console.log('✅ Database connection closed successfully');
      }
      process.exit(0);
    });
  });
});
