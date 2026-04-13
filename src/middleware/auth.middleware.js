import { supabase } from "../config/supabaseClient.js"

// ==========================
// AUTH MIDDLEWARE
// ==========================
export const authMiddleware = async (req, res, next) => {
  try {
    // token puede venir en headers
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ error: "Invalid token format" })
    }

    // ==========================
    // OPCIÓN 1 (FUTURO JWT)
    // ==========================
    // aquí luego validaremos JWT real

    // ==========================
    // OPCIÓN 2 (SUPABASE SIMPLE)
    // ==========================
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", token) // temporal: usamos user_id como token fake
      .single()

    if (error || !data) {
      return res.status(401).json({ error: "Unauthorized user" })
    }

    // guardar usuario en request
    req.user = data

    next()

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}