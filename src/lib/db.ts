import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'merhaba',
  database: process.env.DB_NAME || 'obilet_db',
  charset: 'utf8mb4',
  timezone: '+00:00'
};

export async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
    throw error;
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Sorgu hatası:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

export async function executeStoredProcedure(procedureName: string, params: any[] = []) {
  const connection = await getConnection();
  try {
    const placeholders = params.map(() => '?').join(', ');
    const query = `CALL ${procedureName}(${placeholders})`;
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Stored procedure hatası:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

export async function executeFunction(functionName: string, params: any[] = []) {
  const connection = await getConnection();
  try {
    const placeholders = params.map(() => '?').join(', ');
    const query = `SELECT ${functionName}(${placeholders}) as result`;
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Function hatası:', error);
    throw error;
  } finally {
    await connection.end();
  }
} 