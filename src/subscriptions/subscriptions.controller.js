import db from "../config/db.js";
import stripe from "../payments/stripe.client.js";

/* =========================================================
   GET ALL PLANS
   GET /subscriptions/plans
========================================================= */
export const getPlans = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, name, label, price, currency, description
       FROM subscription_plans
       WHERE active = true
       ORDER BY price ASC`
    );

    return res.status(200).json({ plans: result.rows });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   CREATE SUBSCRIPTION CHECKOUT
   POST /subscriptions/checkout
   Body: { planName: "pro" | "business" | "enterprise" }
========================================================= */
export const createSubscriptionCheckout = async (req, res, next) => {
  try {
    const user_id = req.user?.id;
    const { planName } = req.body;

    // =========================
    // AUTH
    // =========================
    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // =========================
    // GET PLAN
    // =========================
    const planResult = await db.query(
      `SELECT * FROM subscription_plans WHERE name = $1 AND active = true`,
      [planName]
    );

    const plan = planResult.rows[0];

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // Enterprise: redirigir a ventas
    if (plan.price === 0) {
      return res.status(200).json({
        redirect: "sales",
        message: "Contact sales for Enterprise plan",
      });
    }

    // =========================
    // CREATE ORDER
    // =========================
    const orderResult = await db.query(
      `INSERT INTO user_subscriptions (user_id, plan_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [user_id, plan.id]
    );

    const order = orderResult.rows[0];

    // =========================
    // CREATE STRIPE SESSION
    // =========================
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: `BrandConnect ${plan.label}`,
              description: plan.description,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId:       String(user_id),
        planId:       String(plan.id),
        subscriptionId: String(order.id),
      },
      success_url: `${process.env.FRONTEND_URL}/payment/success?plan=${plan.name}`,
      cancel_url:  `${process.env.FRONTEND_URL}/pricing`,
    });

    // =========================
    // SAVE SESSION ID
    // =========================
    await db.query(
      `UPDATE user_subscriptions SET stripe_session_id = $1 WHERE id = $2`,
      [session.id, order.id]
    );

    return res.status(200).json({
      url:       session.url,
      sessionId: session.id,
      orderId:   order.id,
    });

  } catch (error) {
    next(error);
  }
};

/* =========================================================
   STRIPE WEBHOOK — SUBSCRIPTION PAID
   POST /subscriptions/webhook
========================================================= */
export const handleSubscriptionWebhook = async (req, res) => {
  try {
    const sig           = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session        = event.data.object;
      const subscriptionId = session.metadata?.subscriptionId;

      if (subscriptionId) {
        await db.query(
          `UPDATE user_subscriptions
           SET status = 'paid',
               stripe_payment_intent = $1,
               paid_at = NOW()
           WHERE id = $2`,
          [session.payment_intent, subscriptionId]
        );
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("🔥 SUBSCRIPTION WEBHOOK ERROR:", error.message);
    return res.status(500).json({ error: error.message });
  }
};