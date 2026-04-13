import { supabase } from "../config/supabaseClient.js"

// ==========================
// GET ALL USERS
// ==========================
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error

  return data
}


// ==========================
// GET USER BY ID
// ==========================
export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error

  return data
}


// ==========================
// UPDATE USER
// ==========================
export const updateUser = async (id, updates) => {
  delete updates.id
  delete updates.email // opcional: proteger email

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()

  if (error) throw error

  return data[0]
}


// ==========================
// DELETE USER
// ==========================
export const deleteUser = async (id) => {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)

  if (error) throw error

  return { message: "User deleted successfully" }
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

  if (error) throw error

  return data
}