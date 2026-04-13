import { supabase } from "../config/supabaseClient.js"

// ==========================
// OBTENER TODOS LOS USUARIOS
// ==========================
export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json(data)

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}


// ==========================
// OBTENER USUARIO POR ID
// ==========================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.json(data)

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}


// ==========================
// ACTUALIZAR USUARIO
// ==========================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // evitar cambios peligrosos
    delete updates.id
    delete updates.email // opcional: proteger email

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json({
      message: "User updated",
      user: data[0]
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}


// ==========================
// ELIMINAR USUARIO (opcional)
// ==========================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json({
      message: "User deleted successfully"
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}