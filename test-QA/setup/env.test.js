import dotenv from "dotenv";

/**
 * =========================================================
 * TEST ENVIRONMENT
 * =========================================================
 * Carga variables de entorno para testing.
 */

// carga .env.test
dotenv.config({
  path: ".env.test"
});

// asegurar modo test
process.env.NODE_ENV = "test";

/**
 * IMPORTANTE:
 * Evita logs excesivos en CI o cuando Jest captura stdout
 */
if (process.env.JEST_WORKER_ID) {
  console.log("TEST ENV LOADED");
} else {
  console.log("TEST ENV LOADED (local)");
}

/**
 * Debug controlado (no rompe tests ni CI)
 */
console.log({
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? "OK" : "MISSING"
});