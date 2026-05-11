import dotenv from "dotenv";

/**
 * =========================================================
 * TEST ENVIRONMENT
 * =========================================================
 * Carga variables de entorno para testing.
 */

dotenv.config({
  path: ".env.test"
});

process.env.NODE_ENV = "test";

console.log("🧪 TEST ENV LOADED");
console.log({
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD
    ? "OK"
    : "MISSING"
});