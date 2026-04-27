import dotenv from "dotenv";
dotenv.config();

// 🔥 IMPORT DINÁMICO (mantienes tu arquitectura)
const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 3000;

// 🧠 CHECK DE ENV (ahora Azure PostgreSQL)
console.log("ENV CHECK:", {
  db_host: process.env.DB_HOST,
  db_user: process.env.DB_USER,
  db_name: process.env.DB_NAME,
  db_password: process.env.DB_PASSWORD ? "OK" : "MISSING"
});

app.listen(PORT, () => {
  console.log("🚀 Server activo en puerto", PORT);
});