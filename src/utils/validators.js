import validator from "validator"

// ==========================
// VALIDAR EMAIL
// ==========================
export const isValidEmail = (email) => {
  return validator.isEmail(email)
}


// ==========================
// VALIDAR PASSWORD (básico)
// mínimo 6 caracteres
// ==========================
export const isValidPassword = (password) => {
  if (!password) return false
  return password.length >= 6
}


// ==========================
// VALIDAR ROLE
// ==========================
export const isValidRole = (role) => {
  const allowedRoles = ["influencer", "client"]
  return allowedRoles.includes(role)
}


// ==========================
// VALIDAR NÚMERO (ID / CÉDULA)
// ==========================
export const isValidNumber = (value) => {
  return /^[0-9]+$/.test(value)
}


// ==========================
// VALIDAR TEXTO NO VACÍO
// ==========================
export const isNotEmpty = (value) => {
  return value && value.trim().length > 0
}