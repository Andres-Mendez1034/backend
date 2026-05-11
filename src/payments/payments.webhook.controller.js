const paymentsService = require("./payments.service");

/**
 * Webhook principal de Stripe
 * Recibe eventos reales de pago (NO del frontend)
 */
const handleStripeWebhook = async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];

    // req.body aquí es RAW (NO JSON parseado)
    const result = await paymentsService.handleWebhook({
      rawBody: req.body,
      signature,
    });

    return res.status(200).json({
      received: true,
      result,
    });
  } catch (error) {
    console.error("❌ Stripe webhook error:", error.message);

    // Stripe recomienda 400 en errores para reintentos automáticos
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

module.exports = {
  handleStripeWebhook,
};