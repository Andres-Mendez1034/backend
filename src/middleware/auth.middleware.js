import db from "../config/db.js";

// ==========================
// AUTH MIDDLEWARE (SAFE + ROLES READY)
// ==========================
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ no header
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // ❌ token inválido
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ error: "Invalid token" });
    }

    // ⚠️ EN TU SISTEMA ACTUAL: token = user_id
    const userId = Number(token);

    if (isNaN(userId)) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const result = await db.query(
      `SELECT id, email, role, created_at FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    const user = result.rows[0];

    // ==========================
    // 🔥 NORMALIZACIÓN DE USER
    // ==========================
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || "client"
    };

    next();

  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(500).json({ error: "Internal auth error" });
  }
};

export default authMiddleware;