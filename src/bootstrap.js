import dotenv from "dotenv";
dotenv.config();

// 🔥 IMPORT DINÁMICO (ok mantenerlo)
const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 3000;

/* =========================================================
   GLOBAL ERROR HANDLERS (EVITA SILENCIO DE ERRORES)
========================================================= */
process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 UNHANDLED REJECTION:", err);
});

/* =========================================================
   ENV CHECK
========================================================= */
console.log("ENV CHECK:", {
  db_host: process.env.DB_HOST,
  db_user: process.env.DB_USER,
  db_name: process.env.DB_NAME,
  db_password: process.env.DB_PASSWORD ? "OK" : "MISSING"
});

/* =========================================================
   START SERVER (SAFE LOGGING)
========================================================= */
try {
  app.listen(PORT, () => {
    console.log(`🚀 Server activo en puerto ${PORT}`);
  });
} catch (err) {
  console.error("🔥 SERVER START ERROR:", err);
}