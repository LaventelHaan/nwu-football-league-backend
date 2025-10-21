import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

const pool = mysql.createPool(dbConfig)

export async function query(sql: string, params: any[] = []) {
  try {
    // Use query for non-prepared statements (transactions, etc.)
    if (sql.toUpperCase().startsWith('START') || 
        sql.toUpperCase().startsWith('COMMIT') || 
        sql.toUpperCase().startsWith('ROLLBACK') ||
        sql.toUpperCase().startsWith('BEGIN')) {
      const connection = await pool.getConnection()
      try {
        const [rows] = await connection.query(sql)
        return rows
      } finally {
        connection.release()
      }
    } else {
      // Use execute for prepared statements (prevents SQL injection)
      const [rows] = await pool.execute(sql, params)
      return rows
    }
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getConnection() {
  return await pool.getConnection()
}

export async function withTransaction(callback: (connection: any) => Promise<any>) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default pool