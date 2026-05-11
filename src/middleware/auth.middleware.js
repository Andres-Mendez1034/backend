import db from "../config/db.js";

// ==========================
// AUTH MIDDLEWARE (SAFE)
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

    // ❌ evita crash PostgreSQL bigint
    const userId = Number(token);

    if (isNaN(userId)) {
      return res.status(401).json({ error: "Invalid user id format" });
    }

    const result = await db.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    req.user = result.rows[0];

    next();

  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(500).json({ error: "Internal auth error" });
  }
};

export default authMiddleware;