import db from "../config/db.js";

// ==========================
// AUTH MIDDLEWARE
// ==========================
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    // ==========================
    // TEMPORAL: token = user_id
    // ==========================
    const result = await db.query(
      `SELECT * FROM users WHERE id = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    req.user = result.rows[0];

    next();

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ IMPORTANTE: default export (lo que tu routes espera)
export default authMiddleware;