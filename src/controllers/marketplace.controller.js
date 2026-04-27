import db from "../config/db.js";

// ==========================
// CREAR SERVICIO (INFLUENCER)
// ==========================
export const createService = async (req, res) => {
  try {
    const {
      user_id,
      influencer_name,
      category,
      price,
      is_trending,
      status
    } = req.body;

    if (!user_id || !influencer_name || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await db.query(
      `INSERT INTO influencer_services 
      (user_id, influencer_name, category, price, is_trending, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        user_id,
        influencer_name,
        category,
        price,
        is_trending || false,
        status || "available"
      ]
    );

    return res.status(201).json({
      message: "Service created",
      service: result.rows[0]
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================
// OBTENER TODOS LOS SERVICIOS
// ==========================
export const getAllServices = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM influencer_services
       ORDER BY service_id DESC`
    );

    return res.json(result.rows);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================
// SERVICIOS POR USUARIO
// ==========================
export const getServicesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await db.query(
      `SELECT * FROM influencer_services
       WHERE user_id = $1`,
      [user_id]
    );

    return res.json(result.rows);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================
// UPDATE STATUS
// ==========================
export const updateServiceStatus = async (req, res) => {
  try {
    const { service_id, status } = req.body;

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
    return res.status(500).json({ error: err.message });
  }
};