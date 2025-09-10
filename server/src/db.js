import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,               // max number of clients
  idleTimeoutMillis: 30000
});

export const query = (text, params) => pool.query(text, params);

export default pool;
