import { supabase } from "../config/supabaseClient.js"
import bcrypt from "bcrypt"

// ==========================
// CONFIG
// ==========================
const SALT_ROUNDS = 10

// ==========================
// REGISTER USER
// ==========================
export const registerUser = async ({ email, password, role }) => {
    console.log("HASHING PASSWORD...");
  if (!email || !password || !role) {
    throw new Error("Missing fields")
  }

  // 🔍 Verificar si ya existe
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single()

  if (existingUser) {
    throw new Error("User already exists")
  }

  // 🔐 Hash de contraseña
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  // 💾 Insertar en DB
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email,
        password_hash: hashedPassword,
        role,
        mfa_enabled: false
      }
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)

  return data
}


// ==========================
// LOGIN USER
// ==========================
export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Missing fields")
  }

  // 🔍 Buscar usuario
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single()

  if (error || !user) {
    throw new Error("User not found")
  }

  // 🔐 Comparar password con hash
  const isValid = await bcrypt.compare(password, user.password_hash)

  if (!isValid) {
    throw new Error("Invalid credentials")
  }

  return user
}


// ==========================
// GET USER BY EMAIL (helper)
// ==========================
export const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single()

  if (error) throw new Error(error.message)

  return data
}
