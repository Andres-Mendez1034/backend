import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 3000;

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 UNHANDLED REJECTION:", err);
  process.exit(1);
});

console.log("ENV CHECK:", {
  db_host: process.env.DB_HOST,
  db_user: process.env.DB_USER,
  db_name: process.env.DB_NAME,
  db_password: process.env.DB_PASSWORD ? "OK" : "MISSING"
});

try {
  app.listen(PORT, () => {
    console.log(`🚀 Server activo en puerto ${PORT}`);
  });
} catch (err) {
  console.error("🔥 SERVER START ERROR:", err);
  process.exit(1);
}