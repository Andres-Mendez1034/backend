import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const isTest = process.env.NODE_ENV === "test";

/* =========================================================
   POOL CONFIG (POSTGRES / AZURE COMPATIBLE)
========================================================= */

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Azure + Postgres compatible
  ssl: process.env.DB_SSL === "true"
    ? { rejectUnauthorized: false }
    : false,

  // importante para tests
  max: isTest ? 2 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

/* =========================================================
   QUERY LOGGER (SOLO DESARROLLO)
========================================================= */

if (!isTest && process.env.NODE_ENV !== "production") {
  const originalQuery = pool.query.bind(pool);

  pool.query = async (...args) => {
    const query = args[0];
    const params = args[1];

    console.log("\n==============================");
    console.log("SQL QUERY:");
    console.log(query);
    console.log("PARAMS:", params);

    const start = Date.now();

    try {
      const result = await originalQuery(...args);

      const duration = Date.now() - start;

      console.log("QUERY OK");
      console.log("TIME:", `${duration}ms`);
      console.log("ROWS:", result.rowCount);
      console.log("==============================\n");

      return result;
    } catch (err) {
      console.log("QUERY ERROR");
      console.log(err);
      console.log("==============================\n");
      throw err;
    }
  };
}

/* =========================================================
   TEST SAFE BEHAVIOR
========================================================= */

if (!isTest && process.env.NODE_ENV !== "production") {
  pool.query("SELECT NOW()")
    .then((res) => {
      console.log("DB CONNECTED:", res.rows[0]);
    })
    .catch((err) => {
      console.error("DB CONNECTION ERROR:", err);
    });
}

/* =========================================================
   SAFE EXPORT
========================================================= */

/**
 * Cierre seguro para tests
 * (evita hanging handles en Jest)
 */
export const closePool = async () => {
  try {
    await pool.end();
  } catch (err) {
    console.error("ERROR CLOSING POOL:", err);
  }
};

export default pool;