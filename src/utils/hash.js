import bcrypt from "bcrypt"

// ==========================
// GENERAR HASH
// ==========================
export const hashPassword = async (password) => {
  const saltRounds = 10
  const hash = await bcrypt.hash(password, saltRounds)
  return hash
}


// ==========================
// COMPARAR PASSWORD
// ==========================
export const comparePassword = async (password, hash) => {
  const match = await bcrypt.compare(password, hash)
  return match
}