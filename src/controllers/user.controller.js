import db from "../config/db.js";

// ==========================
// OBTENER TODOS LOS USUARIOS
// ==========================
export const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM users ORDER BY created_at DESC`
    );

    return res.json(result.rows);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================
// OBTENER USUARIO POR ID
// ==========================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(result.rows[0]);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================
// ACTUALIZAR USUARIO
// ==========================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.email;

    const keys = Object.keys(updates);
    const values = Object.values(updates);

    const setQuery = keys
      .map((key, i) => `${key} = $${i + 2}`)
      .join(", ");

    const result = await db.query(
      `UPDATE users
       SET ${setQuery}
       WHERE id = $1
       RETURNING *`,
      [id, ...values]
    );

    return res.json({
      message: "User updated",
      user: result.rows[0]
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================
// ELIMINAR USUARIO
// ==========================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `DELETE FROM users WHERE id = $1`,
      [id]
    );

    return res.json({
      message: "User deleted successfully"
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};