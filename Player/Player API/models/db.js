import mysql from 'mysql2/promise';

// Create a connection pool to the NWU_Sports_League database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'MyNWU@2025',
  database: 'NWU_Sports_League',
});

export default pool;
