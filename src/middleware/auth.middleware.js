import jwt from "jsonwebtoken";
import db from "../config/db.js";

/* =========================================================
   AUTH MIDDLEWARE (JWT + email_verified check)
========================================================= */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ error: "Invalid token" });
    }

    // ── Verificar JWT ──
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Verificar que el usuario existe y tiene email verificado ──
    const { rows } = await db.query(
      `SELECT id, email, role, email_verified FROM users WHERE id = $1`,
      [decoded.id]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        error:   "EMAIL_NOT_VERIFIED",
        message: "Debes verificar tu correo antes de continuar.",
      });
    }

    req.user = {
      id:    user.id,
      email: user.email,
      role:  user.role,
    };

    next();

  } catch (err) {
    console.error("AUTH ERROR:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.status(500).json({ error: "Internal auth error" });
  }
};

export default authMiddleware;