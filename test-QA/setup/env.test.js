const dotenv = require("dotenv");

/**
 * =========================================================
 * TEST ENVIRONMENT
 * =========================================================
 * Carga variables de entorno para testing.
 */

// Cargar .env.test de forma segura (fallback si no existe)
dotenv.config({
  path: ".env.test"
});

// Forzar modo test SIEMPRE
process.env.NODE_ENV = "test";

/**
 * =========================================================
 * DETECCIÓN DE ENTORNO
 * =========================================================
 */

const isCI = process.env.CI === "true";
const isJest = process.env.JEST_WORKER_ID != null;
const isLocal = !isCI && !isJest;

/**
 * =========================================================
 * LOG CONTROLADO
 * =========================================================
 * Evita ruido en CI y pipelines
 */

if (isLocal) {
  console.log("TEST ENV LOADED (local)");
} else {
  console.log("TEST ENV LOADED");
}

/**
 * =========================================================
 * VALIDACIÓN BÁSICA DE VARIABLES CRÍTICAS
 * =========================================================
 */

const requiredVars = ["DB_HOST", "DB_NAME", "DB_USER"];

if (isLocal) {
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.warn("⚠️ Missing env vars:", missing.join(", "));
  }

  console.log("TEST ENV CONFIG:", {
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST || "MISSING",
    DB_NAME: process.env.DB_NAME || "MISSING",
    DB_USER: process.env.DB_USER || "MISSING",
    DB_PASSWORD: process.env.DB_PASSWORD ? "SET" : "MISSING"
  });
}

/**
 * =========================================================
 * SEGURIDAD EXTRA
 * =========================================================
 * Evita crashes silenciosos en tests
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "test-stripe";