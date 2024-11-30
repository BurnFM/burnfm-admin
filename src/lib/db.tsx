import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST,      // StackCP's provided hostname (address + port)
  user: process.env.DB_USER,      // database username
  password: process.env.DB_PASS,  // database password
  database: process.env.DB_NAME,  // database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});