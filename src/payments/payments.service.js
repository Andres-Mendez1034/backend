import stripe from "./stripe.client.js";
import db from "../config/db.js";

/**
 * =====================================
 * CREATE CHECKOUT SESSION
 * =====================================
 */
export const createCheckoutSession = async ({
  userId,
  orderId,
  serviceId,
  items,
  successUrl,
  cancelUrl,
}) => {

  // =========================
  // VALIDATIONS
  // =========================
  if (!items || !items.length) {
    throw new Error("No items provided");
  }

  // =========================
  // CREATE STRIPE SESSION
  // =========================
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],

    mode: "payment",

    line_items: items.map((item) => ({
      price_data: {
        currency: item.currency || "usd",

        product_data: {
          name: item.name,
          description:
            item.description ||
            "Influencer marketing service",
        },

        unit_amount: item.amount,
      },

      quantity: item.quantity || 1,
    })),

    metadata: {
      userId: String(userId),
      serviceId: String(serviceId),
      orderId: String(orderId),
    },

    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  // =========================
  // SAVE STRIPE SESSION
  // =========================
  await db.query(
    `UPDATE service_orders
     SET stripe_session_id = $1
     WHERE id = $2`,
    [session.id, orderId]
  );

  return session;
};

/**
 * =====================================
 * HANDLE STRIPE WEBHOOK
 * =====================================
 */
export const handleWebhook = async ({
  rawBody,
  signature,
}) => {

  const endpointSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  // =========================
  // VERIFY STRIPE SIGNATURE
  // =========================
  try {

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      endpointSecret
    );

  } catch (err) {

    throw new Error(
      `Invalid webhook signature: ${err.message}`
    );
  }

  /**
   * =====================================
   * CHECKOUT COMPLETED
   * =====================================
   */
  if (event.type === "checkout.session.completed") {

    const session = event.data.object;

    const orderId = session.metadata.orderId;

    // =========================
    // CHECK ORDER EXISTS
    // =========================
    const existingOrder = await db.query(
      `SELECT * FROM service_orders
       WHERE id = $1`,
      [orderId]
    );

    if (!existingOrder.rows.length) {
      return { received: true };
    }

    const order = existingOrder.rows[0];

    // =========================
    // IDEMPOTENCY CHECK
    // =========================
    if (order.status === "paid") {
      return { received: true };
    }

    // =========================
    // UPDATE ORDER
    // =========================
    await db.query(
      `UPDATE service_orders
       SET
         status = 'paid',
         stripe_payment_intent_id = $1,
         paid_at = NOW()
       WHERE id = $2`,
      [
        session.payment_intent,
        orderId,
      ]
    );

    // =========================
    // CREATE FULFILLMENT
    // =========================
    const existingFulfillment = await db.query(
      `SELECT * FROM service_fulfillment
       WHERE order_id = $1`,
      [orderId]
    );

    if (!existingFulfillment.rows.length) {

      await db.query(
        `INSERT INTO service_fulfillment
          (
            order_id,
            status
          )
         VALUES ($1, 'pending')`,
        [orderId]
      );
    }

    // =========================
    // OPTIONAL FUTURE FEATURES
    // =========================
    // - Send email
    // - Notify influencer
    // - Enable internal chat
    // - Generate invoice
  }

  /**
   * =====================================
   * PAYMENT FAILED
   * =====================================
   */
  if (
    event.type ===
    "payment_intent.payment_failed"
  ) {

    const intent = event.data.object;

    await db.query(
      `UPDATE service_orders
       SET status = 'failed'
       WHERE stripe_payment_intent_id = $1`,
      [intent.id]
    );
  }

  return {
    received: true,
  };
};

/**
 * =====================================
 * GET PAYMENT STATUS
 * =====================================
 */
export const getPaymentStatus = async (
  orderId
) => {

  const result = await db.query(
    `SELECT * FROM service_orders
     WHERE id = $1`,
    [orderId]
  );

  if (!result.rows.length) {
    throw new Error("Order not found");
  }

  return result.rows[0];
};