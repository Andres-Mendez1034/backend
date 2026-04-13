import dotenv from "dotenv"
dotenv.config()

// 🔥 IMPORT DINÁMICO (SOLUCIÓN REAL)
const { default: app } = await import("./app.js")

const PORT = process.env.PORT || 3000

console.log("ENV CHECK:", {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_SERVICE_KEY ? "OK" : "MISSING"
})

app.listen(PORT, () => {
  console.log(" Server Activo En Puerto", PORT)
})