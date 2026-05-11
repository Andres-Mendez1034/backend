import Stripe from "stripe";

/**
 * Cliente central de Stripe
 * Evita múltiples instancias en el proyecto
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

/**
 * Export default para ES Modules
 */
export default stripe;