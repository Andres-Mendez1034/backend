import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

/* =========================================================
   POOL CONFIG (AZURE POSTGRES)
========================================================= */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

/* =========================================================
   🔥 GLOBAL QUERY LOGGER (CLAVE PARA DEBUG)
========================================================= */
const originalQuery = pool.query.bind(pool);

pool.query = async (...args) => {
  const query = args[0];
  const params = args[1];

  console.log("\n📡 ================================");
  console.log("📡 SQL QUERY:");
  console.log(query);
  console.log("📦 PARAMS:", params);

  const start = Date.now();

  try {
    const result = await originalQuery(...args);

    const duration = Date.now() - start;

    console.log("✅ QUERY OK");
    console.log("⏱️ TIME:", duration + "ms");
    console.log("📄 ROWS:", result.rowCount);
    console.log("📄 RESULT:", result.rows?.[0] || result.rows);
    console.log("📡 ================================\n");

    return result;
  } catch (err) {
    console.log("❌ QUERY ERROR");
    console.log(err);
    console.log("📡 ================================\n");
    throw err;
  }
};

/* =========================================================
   🔥 TEST DE CONEXIÓN (AL ARRANCAR SERVER)
========================================================= */
pool
  .query("SELECT NOW()")
  .then((res) => {
    console.log("🟢 DB CONNECTED:", res.rows[0]);
  })
  .catch((err) => {
    console.error("🔴 DB CONNECTION ERROR:", err);
  });

export default pool;