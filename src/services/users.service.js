import db from "../config/db.js";

// ==========================
// GET ALL USERS
// ==========================
export const getAllUsers = async () => {
  const result = await db.query(
    "SELECT * FROM users ORDER BY created_at DESC"
  );

  return result.rows;
};

// ==========================
// GET USER BY ID
// ==========================
export const getUserById = async (id) => {
  const result = await db.query(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );

  return result.rows[0];
};

// ==========================
// UPDATE USER
// ==========================
export const updateUser = async (id, updates) => {
  delete updates.id;
  delete updates.email;

  const keys = Object.keys(updates);
  const values = Object.values(updates);

  const setQuery = keys
    .map((key, i) => `${key} = $${i + 2}`)
    .join(", ");

  const result = await db.query(
    `UPDATE users SET ${setQuery} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  return result.rows[0];
};

// ==========================
// DELETE USER
// ==========================
export const deleteUser = async (id) => {
  await db.query("DELETE FROM users WHERE id = $1", [id]);

  return { message: "User deleted successfully" };
};

// ==========================
// GET USER BY EMAIL
// ==========================
export const getUserByEmail = async (email) => {
  const result = await db.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  return result.rows[0];
};