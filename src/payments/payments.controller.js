import db from "../config/db.js";
import * as paymentsService from "./payments.service.js";

/**
 * =====================================
 * CREATE CHECKOUT SESSION (Stripe)
 * =====================================
 * POST /payments/checkout/:service_id
 */
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { service_id } = req.params;
    const user_id = req.user?.id;

    // =========================
    // AUTH VALIDATION
    // =========================
    if (!user_id) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // =========================
    // GET SERVICE
    // =========================
    const serviceResult = await db.query(
      `SELECT * FROM influencer_services
       WHERE service_id = $1`,
      [service_id]
    );

    const service = serviceResult.rows[0];

    if (!service) {
      return res.status(404).json({
        error: "Service not found",
      });
    }

    // =========================
    // SERVICE STATUS VALIDATION
    // =========================
    if (service.status !== "available") {
      return res.status(400).json({
        error: "Service not available",
      });
    }

    // =========================
    // PREVENT SELF PURCHASE
    // =========================
    if (service.user_id === user_id) {
      return res.status(400).json({
        error: "You cannot buy your own service",
      });
    }

    // =========================
    // CREATE ORDER
    // =========================
    const orderResult = await db.query(
      `INSERT INTO service_orders
        (
          user_id,
          service_id,
          amount,
          currency,
          status
        )
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [
        user_id,
        service_id,
        service.price,
        "usd",
      ]
    );

    const order = orderResult.rows[0];

    // =========================
    // CREATE STRIPE SESSION
    // =========================
    const session = await paymentsService.createCheckoutSession({
      userId: user_id,
      orderId: order.id,
      serviceId: service_id,

      items: [
        {
          name: service.title,
          description:
            service.description ||
            "Influencer marketing service",

          amount: Math.round(service.price * 100),
          quantity: 1,
          currency: "usd",
        },
      ],

      successUrl: `${process.env.FRONTEND_URL}/payment/success`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
    });

    // =========================
    // SAVE STRIPE SESSION ID
    // =========================
    await db.query(
      `UPDATE service_orders
       SET stripe_session_id = $1
       WHERE id = $2`,
      [session.id, order.id]
    );

    // =========================
    // RESPONSE
    // =========================
    return res.status(200).json({
      message: "Checkout session created successfully",
      url: session.url,
      sessionId: session.id,
      orderId: order.id,
    });

  } catch (error) {
    next(error);
  }
};

/**
 * =====================================
 * STRIPE WEBHOOK
 * =====================================
 * POST /payments/webhook
 */
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];

    const result = await paymentsService.handleWebhook({
      rawBody: req.body,
      signature: sig,
    });

    return res.status(200).json({
      received: true,
      result,
    });

  } catch (error) {
    console.error("Webhook error:", error.message);

    return res.status(400).send(
      `Webhook Error: ${error.message}`
    );
  }
};

/**
 * =====================================
 * GET PAYMENT STATUS
 * =====================================
 * GET /payments/status/:paymentId
 */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment =
      await paymentsService.getPaymentStatus(paymentId);

    return res.status(200).json({
      payment,
    });

  } catch (error) {
    next(error);
  }
};