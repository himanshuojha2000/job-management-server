import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }, // Railway needs this for SSL
});

pool.connect((err) => {
  if (err) console.error("❌ Database connection failed:", err.message);
  else console.log("✅ Connected to PostgreSQL Database");
});

export default pool;
