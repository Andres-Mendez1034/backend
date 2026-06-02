import db from "../config/db.js";

/* =========================================================
   GET ALL SERVICES (MARKETPLACE)
   — hace JOIN con creator_profiles para traer location e image
========================================================= */
export const getAllServices = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        s.service_id,
        s.user_id,
        s.influencer_name  AS title,
        s.category         AS tag,
        s.price,
        s.status,
        s.is_trending      AS trending,
        cp.location,
        cp.profile_image   AS image,
        cp.bio
      FROM influencer_services s
      LEFT JOIN creator_profiles cp ON cp.user_id = s.user_id
      ORDER BY s.service_id DESC
    `);

    return res.json(result.rows);

  } catch (err) {
    console.error("GET SERVICES ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   CREATE SERVICE
========================================================= */
export const createService = async (req, res) => {
  try {
    const {
      user_id,
      influencer_name,
      category,
      price,
      status,
      is_trending,
    } = req.body;

    if (!user_id || !influencer_name) {
      return res.status(400).json({
        error: "Missing required fields: user_id, influencer_name"
      });
    }

    const result = await db.query(
      `INSERT INTO influencer_services
        (user_id, influencer_name, category, price, status, is_trending)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        user_id,
        influencer_name,
        category  || null,
        price     || 0,
        status    || "available",
        is_trending || false,
      ]
    );

    return res.status(201).json({
      message: "Service created",
      service: result.rows[0]
    });

  } catch (err) {
    console.error("CREATE SERVICE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   GET SERVICES BY USER
========================================================= */
export const getServicesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await db.query(
      `SELECT
        s.service_id,
        s.user_id,
        s.influencer_name  AS title,
        s.category         AS tag,
        s.price,
        s.status,
        s.is_trending      AS trending,
        cp.location,
        cp.profile_image   AS image,
        cp.bio
       FROM influencer_services s
       LEFT JOIN creator_profiles cp ON cp.user_id = s.user_id
       WHERE s.user_id = $1
       ORDER BY s.service_id DESC`,
      [user_id]
    );

    return res.json(result.rows);

  } catch (err) {
    console.error("GET USER SERVICES ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   UPDATE SERVICE STATUS
========================================================= */
export const updateServiceStatus = async (req, res) => {
  try {
    const { service_id, status } = req.body;

    if (!service_id || !status) {
      return res.status(400).json({
        error: "Missing required fields: service_id, status"
      });
    }

    const result = await db.query(
      `UPDATE influencer_services
       SET status = $1
       WHERE service_id = $2
       RETURNING *`,
      [status, service_id]
    );

    return res.json({
      message: "Service updated",
      service: result.rows[0]
    });

  } catch (err) {
    console.error("UPDATE SERVICE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};