import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'obilet_db',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function executeStoredProcedure(procedureName: string, params: any[] = []) {
  try {
    const connection = await pool.getConnection();
    
    // Karakter seti ayarları
    await connection.execute('SET NAMES utf8mb4');
    await connection.execute('SET CHARACTER SET utf8mb4');
    await connection.execute('SET character_set_connection=utf8mb4');
    
    const placeholders = params.map(() => '?').join(', ');
    const query = `CALL ${procedureName}(${placeholders})`;
    
    const [results] = await connection.execute(query, params);
    connection.release();
    
    // MySQL stored procedure results come as an array, we want the first result set
    if (Array.isArray(results) && results.length > 0) {
      return Array.isArray(results[0]) ? results[0] : results;
    }
    
    return [];
  } catch (error) {
    console.error('Stored procedure execution error:', error);
    throw error;
  }
}

export async function executeFunction(functionName: string, params: any[] = []) {
  try {
    const connection = await pool.getConnection();
    
    // Karakter seti ayarları
    await connection.execute('SET NAMES utf8mb4');
    await connection.execute('SET CHARACTER SET utf8mb4');
    await connection.execute('SET character_set_connection=utf8mb4');
    
    const placeholders = params.map(() => '?').join(', ');
    const query = `SELECT ${functionName}(${placeholders}) as result`;
    
    const [results]: any = await connection.execute(query, params);
    connection.release();
    
    return Array.isArray(results) && results.length > 0 ? results[0].result : null;
  } catch (error) {
    console.error('Function execution error:', error);
    throw error;
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const connection = await pool.getConnection();
    
    // Karakter seti ayarları
    await connection.execute('SET NAMES utf8mb4');
    await connection.execute('SET CHARACTER SET utf8mb4');
    await connection.execute('SET character_set_connection=utf8mb4');
    
    const [results] = await connection.execute(query, params);
    connection.release();
    
    return results;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export default pool;

