import express from "express";
import {
  createCheckoutSession,
  createOfferCheckout,
  handleStripeWebhook,
  getPaymentStatus,
} from "./payments.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/payments/create-checkout/:service_id
router.post("/create-checkout/:service_id", authMiddleware, createCheckoutSession);

// POST /api/payments/checkout-offer  ← nuevo (oferta negociada en chat)
router.post("/checkout-offer", authMiddleware, createOfferCheckout);

// POST /api/payments/webhook
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// GET /api/payments/status/:paymentId
router.get("/status/:paymentId", authMiddleware, getPaymentStatus);

export default router;