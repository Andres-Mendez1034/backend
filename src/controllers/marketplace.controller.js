import db from "../config/db.js";

/* =========================================================
   GET ALL SERVICES (MARKETPLACE)
========================================================= */
export const getAllServices = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM influencer_services
      ORDER BY service_id DESC
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
      title,
      description,
      price,
      category,
      image,
      tiktok,
      profile_name
    } = req.body;

    if (!user_id || !title) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    const result = await db.query(
      `INSERT INTO influencer_services
      (user_id, title, description, price, category, image, tiktok, profile_name)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        user_id,
        title,
        description,
        price,
        category,
        image,
        tiktok,
        profile_name
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
      `SELECT *
       FROM influencer_services
       WHERE user_id = $1
       ORDER BY id DESC`,
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
    const {
      service_id,
      status
    } = req.body;

    const result = await db.query(
      `UPDATE influencer_services
       SET status = $1
       WHERE id = $2
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