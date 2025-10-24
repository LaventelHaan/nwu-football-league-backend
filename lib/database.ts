import mysql from 'mysql2/promise'

const config = {
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'Dragonballz1',
  database: process.env.MYSQLDATABASE || 'nwu_football_league',
  port: process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT) : 3306
};

const pool = mysql.createPool(config)

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