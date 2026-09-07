const { Pool } = require("pg");

const useSsl = String(process.env.DB_SSL).toLowerCase() === "true";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("PostgreSQL connected");
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection };
