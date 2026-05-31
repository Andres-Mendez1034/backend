import db from "../config/db.js";

// ─────────────────────────────────────────
// STATS GENERALES
// ─────────────────────────────────────────
export const getStats = async (req, res) => {
  try {
    const [users, payments, newUsersToday, revenueToday] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM users`),
      db.query(`SELECT COUNT(*), COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'`),
      db.query(`SELECT COUNT(*) FROM users WHERE created_at::date = CURRENT_DATE`),
      db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed' AND created_at::date = CURRENT_DATE`),
    ]);

    res.json({
      totalUsers:    parseInt(users.rows[0].count),
      totalRevenue:  parseFloat(payments.rows[0].total),
      totalPayments: parseInt(payments.rows[0].count),
      newUsersToday: parseInt(newUsersToday.rows[0].count),
      revenueToday:  parseFloat(revenueToday.rows[0].total),
    });
  } catch (err) {
    console.error("ADMIN getStats:", err);
    res.status(500).json({ error: "Error fetching stats" });
  }
};

// ─────────────────────────────────────────
// PAGOS
// ─────────────────────────────────────────
export const getPayments = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        p.id, p.amount, p.currency, p.status,
        p.stripe_session_id, p.created_at,
        u.email, u.name
      FROM payments p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    console.error("ADMIN getPayments:", err);
    res.status(500).json({ error: "Error fetching payments" });
  }
};

export const getPaymentsByDay = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        created_at::date AS day,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'failed')    AS failed,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS total
      FROM payments
      GROUP BY day
      ORDER BY day DESC
      LIMIT 30
    `);
    res.json(rows);
  } catch (err) {
    console.error("ADMIN getPaymentsByDay:", err);
    res.status(500).json({ error: "Error fetching payments by day" });
  }
};

export const getPaymentsByMonth = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'failed')    AS failed,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS total
      FROM payments
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);
    res.json(rows);
  } catch (err) {
    console.error("ADMIN getPaymentsByMonth:", err);
    res.status(500).json({ error: "Error fetching payments by month" });
  }
};

// ─────────────────────────────────────────
// PLANES MÁS VENDIDOS
// ─────────────────────────────────────────
export const getTopPlans = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        sp.id, sp.name, sp.price,
        COUNT(us.id) AS total_subscriptions
      FROM subscription_plans sp
      LEFT JOIN user_subscriptions us ON us.plan_id = sp.id
      GROUP BY sp.id, sp.name, sp.price
      ORDER BY total_subscriptions DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("ADMIN getTopPlans:", err);
    res.status(500).json({ error: "Error fetching top plans" });
  }
};

// ─────────────────────────────────────────
// INFLUENCERS MÁS CONTRATADOS
// FIX: LEFT JOIN en influencer_profiles para no crashear si no existe perfil
// ─────────────────────────────────────────
export const getTopInfluencers = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        u.id, u.name, u.email,
        ip.category,
        COUNT(so.id)  AS total_orders,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total_revenue
      FROM users u
      LEFT JOIN influencer_profiles ip  ON ip.user_id  = u.id
      LEFT JOIN influencer_services ise ON ise.user_id = u.id
      LEFT JOIN service_orders so       ON so.service_id = ise.service_id
      LEFT JOIN payments p              ON p.user_id = u.id
      WHERE u.role = 'influencer'
      GROUP BY u.id, u.name, u.email, ip.category
      ORDER BY total_orders DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (err) {
    console.error("ADMIN getTopInfluencers:", err);
    res.status(500).json({ error: "Error fetching top influencers" });
  }
};

// ─────────────────────────────────────────
// USUARIOS — con paginación y búsqueda
// GET /admin/users?page=1&limit=50&search=texto
// ─────────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 50);
    const search = req.query.search?.trim() || "";
    const offset = (page - 1) * limit;

    const whereClause = search
      ? `WHERE email ILIKE $3 OR name ILIKE $3`
      : "";

    const params = search
      ? [limit, offset, `%${search}%`]
      : [limit, offset];

    const countParams = search ? [`%${search}%`] : [];
    const countWhere  = search ? `WHERE email ILIKE $1 OR name ILIKE $1` : "";

    const [data, total] = await Promise.all([
      db.query(
        `SELECT id, email, name, role, email_verified, created_at, last_login
         FROM users
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        params
      ),
      db.query(
        `SELECT COUNT(*) FROM users ${countWhere}`,
        countParams
      ),
    ]);

    res.json({
      users:      data.rows,
      total:      parseInt(total.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(total.rows[0].count) / limit),
    });
  } catch (err) {
    console.error("ADMIN getUsers:", err);
    res.status(500).json({ error: "Error fetching users" });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const allowed = ["influencer", "client", "superadmin"];
  if (!allowed.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const { rows } = await db.query(
      `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, role`,
      [role, id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("ADMIN updateUserRole:", err);
    res.status(500).json({ error: "Error updating role" });
  }
};

export const banUser = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      `UPDATE users SET role = 'banned', updated_at = NOW() WHERE id = $1 RETURNING id, email, role`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("ADMIN banUser:", err);
    res.status(500).json({ error: "Error banning user" });
  }
};