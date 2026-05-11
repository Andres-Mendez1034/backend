import stripe from "./stripe.client.js";
import db from "../config/db.js";

/* =========================================================
   CREATE CHECKOUT SESSION
========================================================= */
export const createCheckoutSession = async ({
  userId,
  orderId,
  serviceId,
  items,
  successUrl,
  cancelUrl,
}) => {
  try {
    /* =========================
       VALIDATIONS
    ========================= */
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Invalid items payload");
    }

    if (!userId || !orderId || !serviceId) {
      throw new Error("Missing required metadata");
    }

    /* =========================
       NORMALIZE ITEMS (SAFE STRIPE FORMAT)
    ========================= */
    const line_items = items.map((item) => {
      const amount = Math.round(Number(item.amount));

      if (!amount || isNaN(amount)) {
        throw new Error("Invalid item amount");
      }

      return {
        price_data: {
          currency: item.currency || "usd",
          product_data: {
            name: item.name || "Service",
            description: item.description || "Influencer marketing service",
          },
          unit_amount: amount,
        },
        quantity: item.quantity || 1,
      };
    });

    /* =========================
       CREATE STRIPE SESSION
    ========================= */
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,

      metadata: {
        userId: String(userId),
        serviceId: String(serviceId),
        orderId: String(orderId),
      },

      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    /* =========================
       SAVE SESSION ID
    ========================= */
    await db.query(
      `UPDATE service_orders
       SET stripe_session_id = $1
       WHERE id = $2`,
      [session.id, orderId]
    );

    return session;
  } catch (err) {
    console.error("🔥 CREATE CHECKOUT ERROR:", err.message);
    throw err;
  }
};

/* =========================================================
   HANDLE STRIPE WEBHOOK
========================================================= */
export const handleWebhook = async ({ rawBody, signature }) => {
  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        endpointSecret
      );
    } catch (err) {
      throw new Error(`Invalid webhook signature: ${err.message}`);
    }

    /* =========================
       PAYMENT SUCCESS
    ========================= */
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata.orderId;

      const existingOrder = await db.query(
        `SELECT * FROM service_orders WHERE id = $1`,
        [orderId]
      );

      if (!existingOrder.rows.length) {
        return { received: true };
      }

      const order = existingOrder.rows[0];

      if (order.status === "paid") {
        return { received: true };
      }

      await db.query(
        `UPDATE service_orders
         SET status = 'paid',
             stripe_payment_intent_id = $1,
             paid_at = NOW()
         WHERE id = $2`,
        [session.payment_intent, orderId]
      );

      const existingFulfillment = await db.query(
        `SELECT * FROM service_fulfillment WHERE order_id = $1`,
        [orderId]
      );

      if (!existingFulfillment.rows.length) {
        await db.query(
          `INSERT INTO service_fulfillment (order_id, status)
           VALUES ($1, 'pending')`,
          [orderId]
        );
      }
    }

    /* =========================
       PAYMENT FAILED
    ========================= */
    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;

      await db.query(
        `UPDATE service_orders
         SET status = 'failed'
         WHERE stripe_payment_intent_id = $1`,
        [intent.id]
      );
    }

    return { received: true };
  } catch (err) {
    console.error("🔥 WEBHOOK ERROR:", err.message);
    throw err;
  }
};

/* =========================================================
   GET PAYMENT STATUS
========================================================= */
export const getPaymentStatus = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error("orderId is required");
    }

    const result = await db.query(
      `SELECT * FROM service_orders WHERE id = $1`,
      [orderId]
    );

    if (!result.rows.length) {
      throw new Error("Order not found");
    }

    return result.rows[0];
  } catch (err) {
    console.error("🔥 GET PAYMENT STATUS ERROR:", err.message);
    throw err;
  }
};