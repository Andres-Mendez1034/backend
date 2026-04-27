import db from "../config/db.js";

// ==========================
// CREATE SERVICE
// ==========================
export const createService = async (serviceData) => {
  const {
    user_id,
    influencer_name,
    category,
    price,
    is_trending,
    status
  } = serviceData;

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

  return result.rows[0];
};

// ==========================
// GET ALL SERVICES (MARKETPLACE)
// ==========================
export const getAllServices = async () => {
  const result = await db.query(
    `SELECT * FROM influencer_services
     ORDER BY service_id DESC`
  );

  return result.rows;
};

// ==========================
// GET SERVICES BY USER
// ==========================
export const getServicesByUser = async (user_id) => {
  const result = await db.query(
    `SELECT * FROM influencer_services
     WHERE user_id = $1`,
    [user_id]
  );

  return result.rows;
};

// ==========================
// UPDATE SERVICE STATUS
// ==========================
export const updateServiceStatus = async (service_id, status) => {
  const result = await db.query(
    `UPDATE influencer_services
     SET status = $1
     WHERE service_id = $2
     RETURNING *`,
    [status, service_id]
  );

  return result.rows[0];
};