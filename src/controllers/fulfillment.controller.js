import db from "../config/db.js";

/**
 * =========================
 * GET FULFILLMENT BY ORDER
 * =========================
 */
export const getFulfillmentByOrder = async (req, res) => {
  try {
    const { order_id } = req.params;

    const result = await db.query(
      `SELECT * FROM service_fulfillment
       WHERE order_id = $1`,
      [order_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Fulfillment not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * =========================
 * INFLUENCER ACCEPT ORDER
 * =========================
 */
export const acceptOrder = async (req, res) => {
  try {
    const { order_id } = req.body;
    const user_id = req.user.id;

    // validar que el influencer sea dueño del servicio
    const order = await db.query(
      `SELECT so.*, s.user_id as owner_id
       FROM service_orders so
       JOIN influencer_services s ON s.service_id = so.service_id
       WHERE so.id = $1`,
      [order_id]
    );

    if (!order.rows.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.rows[0].owner_id !== user_id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await db.query(
      `UPDATE service_fulfillment
       SET status = 'in_progress'
       WHERE order_id = $1`,
      [order_id]
    );

    return res.json({ message: "Order accepted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * =========================
 * UPLOAD DELIVERY (INFLUENCER)
 * =========================
 */
export const deliverService = async (req, res) => {
  try {
    const { order_id, delivery_data, notes } = req.body;

    const result = await db.query(
      `UPDATE service_fulfillment
       SET status = 'delivered',
           delivery_data = $1,
           notes = $2,
           delivered_at = NOW()
       WHERE order_id = $3
       RETURNING *`,
      [delivery_data, notes, order_id]
    );

    return res.json({
      message: "Service delivered",
      fulfillment: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * =========================
 * MARK AS COMPLETED (CLIENT CONFIRMATION)
 * =========================
 */
export const completeOrder = async (req, res) => {
  try {
    const { order_id } = req.body;
    const user_id = req.user.id;

    const order = await db.query(
      `SELECT * FROM service_orders WHERE id = $1`,
      [order_id]
    );

    if (!order.rows.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.rows[0].user_id !== user_id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await db.query(
      `UPDATE service_fulfillment
       SET status = 'completed'
       WHERE order_id = $1`,
      [order_id]
    );

    return res.json({ message: "Order completed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};