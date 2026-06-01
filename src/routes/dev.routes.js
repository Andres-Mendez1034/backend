import express from "express";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const router = express.Router();

// Dev-only: emitir JWT para pruebas
router.post("/token", async (req, res) => {
  try {
    const { email, userId } = req.body || {};

    let user;

    if (email) {
      const { rows } = await db.query("SELECT id, email, name, role FROM users WHERE email = $1", [email]);
      user = rows[0];
    } else if (userId) {
      const { rows } = await db.query("SELECT id, email, name, role FROM users WHERE id = $1", [userId]);
      user = rows[0];
    } else {
      return res.status(400).json({ error: "Provide email or userId in body" });
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT_SECRET not configured on server" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, dev: true }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({ token, user });
  } catch (err) {
    console.error("[DEV][TOKEN][ERROR]", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
