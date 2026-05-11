import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

/* =========================================================
   POOL CONFIG (AZURE POSTGRES)
========================================================= */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },

  /**
   * IMPORTANTE PARA TESTS:
   * evita que pg mantenga conexiones abiertas infinitas
   */
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

/* =========================================================
   GLOBAL QUERY LOGGER (DEBUG CONTROLADO)
========================================================= */
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
    console.log("RESULT:", result.rows?.[0] || result.rows);
    console.log("==============================\n");

    return result;

  } catch (err) {

    console.log("QUERY ERROR");
    console.log(err);
    console.log("==============================\n");

    throw err;
  }
};

/* =========================================================
   TEST DE CONEXIÓN (SAFE)
========================================================= */
if (process.env.NODE_ENV !== "test") {

  pool.query("SELECT NOW()")
    .then((res) => {
      console.log("DB CONNECTED:", res.rows[0]);
    })
    .catch((err) => {
      console.error("DB CONNECTION ERROR:", err);
    });

}

/* =========================================================
   CLEAN SHUTDOWN (CLAVE PARA JEST)
========================================================= */
process.on("beforeExit", async () => {
  try {
    await pool.end();
  } catch (err) {
    console.error("ERROR CLOSING POOL:", err);
  }
});

export default pool;