import db from "../config/db.js";
import * as paymentsService from "./payments.service.js";

/**
 * =====================================
 * CREATE CHECKOUT SESSION (Stripe)
 * =====================================
 * POST /api/payments/create-checkout/:service_id
 */
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { service_id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!service_id) {
      return res.status(400).json({ error: "service_id is required" });
    }

    const serviceResult = await db.query(
      `SELECT * FROM influencer_services WHERE service_id = $1`,
      [service_id]
    );

    const service = serviceResult.rows[0];

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    if (service.status !== "available") {
      return res.status(400).json({ error: "Service not available" });
    }

    if (service.user_id === user_id) {
      return res.status(400).json({ error: "You cannot buy your own service" });
    }

    const orderResult = await db.query(
      `INSERT INTO service_orders (user_id, service_id, amount, currency, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [user_id, service_id, service.price, "usd"]
    );

    const order = orderResult.rows[0];

    const session = await paymentsService.createCheckoutSession({
      userId:    user_id,
      orderId:   order.id,
      serviceId: service_id,
      items: [
        {
          name:        service.title,
          description: service.description || "Influencer marketing service",
          amount:      Math.round(service.price * 100),
          quantity:    1,
          currency:    "usd",
        },
      ],
      successUrl: `${process.env.FRONTEND_URL}/payment/success`,
      cancelUrl:  `${process.env.FRONTEND_URL}/payment/cancel`,
    });

    await db.query(
      `UPDATE service_orders SET stripe_session_id = $1 WHERE id = $2`,
      [session.id, order.id]
    );

    return res.status(200).json({
      message:   "Checkout session created successfully",
      url:       session.url,
      sessionId: session.id,
      orderId:   order.id,
    });

  } catch (error) {
    next(error);
  }
};
/**
 * =====================================
 * GET MY PAYMENT HISTORY
 * =====================================
 * GET /api/payments/my-orders
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: "Unauthorized" });

    const result = await db.query(
      `SELECT
         so.id,
         so.amount,
         so.currency,
         so.status,
         so.notes,
         so.created_at,
         so.paid_at,
         -- Servicio directo
         is2.title          AS service_title,
         -- Influencer (via servicio directo)
         ip.full_name       AS influencer_name,
         u_inf.email        AS influencer_email,
         -- Tipo de pago
         CASE
           WHEN so.service_id IS NULL THEN 'offer'
           ELSE 'service'
         END AS order_type,
         -- Duración (solo ofertas)
         oo.duration_weeks
       FROM service_orders so
       LEFT JOIN influencer_services is2
              ON is2.service_id = so.service_id
       LEFT JOIN influencer_profiles ip
              ON ip.user_id = is2.user_id
       LEFT JOIN users u_inf
              ON u_inf.id = ip.user_id
       LEFT JOIN offer_orders oo
              ON oo.order_id = so.id
       LEFT JOIN conversations conv
              ON conv.id = oo.conversation_id
       LEFT JOIN creator_profiles cp
              ON cp.id = conv.creator_id
       LEFT JOIN influencer_profiles ip2
              ON ip2.user_id = cp.user_id
       WHERE so.user_id = $1
       ORDER BY so.created_at DESC`,
      [user_id]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * =====================================
 * CREATE OFFER CHECKOUT (chat negociado)
 * =====================================
 * POST /api/payments/checkout-offer
 * Body: { conversation_id, amount_cop, description, duration_weeks, offer_message_id }
 */
export const createOfferCheckout = async (req, res, next) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: "Unauthorized" });

    const { conversation_id, amount_cop, description, duration_weeks, offer_message_id } = req.body;

    // ── Validaciones ──────────────────────────────────────────────────────
    if (!conversation_id)
      return res.status(400).json({ error: "conversation_id requerido" });
    if (!amount_cop || Number(amount_cop) <= 0)
      return res.status(400).json({ error: "amount_cop inválido" });
    if (!description?.trim())
      return res.status(400).json({ error: "description requerida" });
    if (!duration_weeks || Number(duration_weeks) <= 0)
      return res.status(400).json({ error: "duration_weeks inválido" });

    // ── Verificar que el usuario pertenece a la conversación ──────────────
    const convResult = await db.query(
      `SELECT c.id, c.client_id, c.creator_id, cp.user_id AS creator_user_id
       FROM conversations c
       JOIN creator_profiles cp ON cp.id = c.creator_id
       WHERE c.id = $1`,
      [conversation_id]
    );

    if (!convResult.rows.length) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    const conv = convResult.rows[0];
    const isParticipant = conv.client_id === user_id || conv.creator_user_id === user_id;
    if (!isParticipant) {
      return res.status(403).json({ error: "No tienes acceso a esta conversación" });
    }

    // ── Crear orden ───────────────────────────────────────────────────────
    const orderResult = await db.query(
      `INSERT INTO service_orders (user_id, service_id, amount, currency, status, notes)
       VALUES ($1, NULL, $2, 'cop', 'pending', $3)
       RETURNING *`,
      [user_id, Number(amount_cop), description.trim()]
    );

    const order = orderResult.rows[0];

    // ── Guardar relación con la conversación (si la tabla existe) ─────────
    try {
      await db.query(
        `INSERT INTO offer_orders (order_id, conversation_id, offer_message_id, duration_weeks)
         VALUES ($1, $2, $3, $4)`,
        [order.id, conversation_id, offer_message_id ?? null, Number(duration_weeks)]
      );
    } catch (_) {
      // Tabla opcional — no bloquea el flujo si no existe
    }

    // ── Label de duración para Stripe ─────────────────────────────────────
    const weeks = Number(duration_weeks);
    const durationLabel =
      weeks === 1 ? "1 semana" :
      weeks < 4   ? `${weeks} semanas` :
      weeks === 4 ? "1 mes" :
      weeks === 8 ? "2 meses" :
                    `${weeks} semanas`;

    // ── Crear sesión Stripe ───────────────────────────────────────────────
    // Stripe COP usa centavos (x100)
    const amountCents = Math.round(Number(amount_cop) * 100);

    const session = await paymentsService.createCheckoutSession({
      userId:    user_id,
      orderId:   order.id,
      serviceId: `offer_conv_${conversation_id}`,
      items: [
        {
          name:        "Colaboración negociada",
          description: `${description.trim()} · Duración: ${durationLabel}`,
          amount:      amountCents,
          quantity:    1,
          currency:    "cop",
        },
      ],
      successUrl: `${process.env.FRONTEND_URL}/payment/success?order=${order.id}`,
      cancelUrl:  `${process.env.FRONTEND_URL}/payment/cancel?order=${order.id}`,
    });

    return res.status(200).json({
      message:   "Checkout de oferta creado",
      url:       session.url,
      sessionId: session.id,
      orderId:   order.id,
    });

  } catch (error) {
    next(error);
  }
};

/**
 * =====================================
 * STRIPE WEBHOOK
 * =====================================
 * POST /api/payments/webhook
 */
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];

    const result = await paymentsService.handleWebhook({
      rawBody:   req.body,
      signature: sig,
    });

    return res.status(200).json({ received: true, result });

  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).json({ error: "Webhook Error" });
  }
};

/**
 * =====================================
 * GET PAYMENT STATUS
 * =====================================
 * GET /api/payments/status/:paymentId
 */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentsService.getPaymentStatus(paymentId);
    return res.status(200).json({ payment });
  } catch (error) {
    next(error);
  }
};