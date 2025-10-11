const mysql = require('mysql2');

console.log('🔍 Testing database connection...');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'debruyne17',
  database: 'nwusoccer'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    console.error('Error details:', err.message);
    console.error('Error code:', err.code);
    process.exit(1);
  }

  console.log('✅ Connected to MySQL database');

  // Test a simple query
  db.query('SELECT 1 as test', (err, results) => {
    if (err) {
      console.error('❌ Query failed:', err);
      process.exit(1);
    }

    console.log('✅ Query successful:', results);
    db.end();
    console.log('🎉 Database test completed successfully!');
  });
});
