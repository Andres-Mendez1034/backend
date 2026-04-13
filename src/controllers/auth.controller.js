import { registerUser, loginUser } from "../services/auth.service.js"

// ==========================
// REGISTER
// ==========================
export const register = async (req, res) => {
  try {
    console.log("🚀 CONTROLLER REGISTER EJECUTANDO")

    const user = await registerUser(req.body)

    // 🔒 ocultar hash
    delete user.password_hash

    return res.status(201).json({
      message: "User created successfully",
      user
    })

  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}


// ==========================
// LOGIN
// ==========================
export const login = async (req, res) => {
  try {
    const user = await loginUser(req.body)

    delete user.password_hash

    return res.json({
      message: "Login successful",
      user
    })

  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}