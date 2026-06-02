import db from "../config/db.js";
import stripe from "../payments/stripe.client.js";
import { sendPaymentConfirmationEmail } from "../email/email.service.js";

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
    const user_id      = req.user?.id;
    const { planName } = req.body;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const planResult = await db.query(
      `SELECT * FROM subscription_plans WHERE name = $1 AND active = true`,
      [planName]
    );

    const plan = planResult.rows[0];

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    if (plan.price === 0) {
      return res.status(200).json({
        redirect: "sales",
        message:  "Contact sales for Enterprise plan",
      });
    }

    const orderResult = await db.query(
      `INSERT INTO user_subscriptions (user_id, plan_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [user_id, plan.id]
    );

    const order = orderResult.rows[0];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name:        `BrandConnect ${plan.label}`,
              description: plan.description,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId:         String(user_id),
        planId:         String(plan.id),
        subscriptionId: String(order.id),
      },
      success_url: `${process.env.FRONTEND_URL}/payment/success?plan=${plan.name}`,
      cancel_url:  `${process.env.FRONTEND_URL}/pricing`,
    });

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
   STRIPE WEBHOOK — marca como pagado, guarda en payments y envía email
   POST /subscriptions/webhook
========================================================= */
export const handleSubscriptionWebhook = async (req, res) => {
  try {
    const sig            = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_SUBSCRIPTIONS_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session        = event.data.object;
      const subscriptionId = session.metadata?.subscriptionId;
      const userId         = session.metadata?.userId;
      const planId         = session.metadata?.planId;

      if (!subscriptionId) return res.status(200).json({ received: true });

      // 1. Marcar suscripción como pagada
      await db.query(
        `UPDATE user_subscriptions
         SET status = 'paid',
             stripe_payment_intent = $1,
             paid_at = NOW()
         WHERE id = $2`,
        [session.payment_intent, subscriptionId]
      );

      // 2. ✅ Insertar en payments para que aparezca en el admin
      const amountTotal = session.amount_total ?? 0;  // en centavos
      const currency    = session.currency ?? "usd";

      await db.query(
        `INSERT INTO payments (user_id, amount, currency, status, stripe_session_id, created_at)
         VALUES ($1, $2, $3, 'completed', $4, NOW())
         ON CONFLICT (stripe_session_id) DO NOTHING`,
        [userId, amountTotal / 100, currency, session.id]
      );

      // 3. Email de confirmación
      const userResult = await db.query(
        `SELECT name, email FROM users WHERE id = $1`,
        [userId]
      );

      const planResult = await db.query(
        `SELECT label, price FROM subscription_plans WHERE id = $1`,
        [planId]
      );

      const user = userResult.rows[0];
      const plan = planResult.rows[0];

      if (user && plan) {
        const planPrice = `$${(plan.price / 100).toFixed(2)} USD`;

        await sendPaymentConfirmationEmail({
          userName:  user.name,
          userEmail: user.email,
          planLabel: plan.label,
          planPrice,
          orderId:   subscriptionId,
          paidAt:    new Date(),
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("🔥 SUBSCRIPTION WEBHOOK ERROR:", error.message);
    return res.status(500).json({ error: error.message });
  }
};