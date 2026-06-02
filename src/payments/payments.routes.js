import express from "express";
import {
  createCheckoutSession,
  createOfferCheckout,
  handleStripeWebhook,
  getPaymentStatus,
  getMyOrders,
} from "./payments.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/payments/create-checkout/:service_id (optional)
router.post("/create-checkout/:service_id?", authMiddleware, createCheckoutSession);

// POST /api/payments/checkout-offer
router.post("/checkout-offer", authMiddleware, createOfferCheckout);

// POST /api/payments/webhook — raw body lo maneja app.js
router.post("/webhook", handleStripeWebhook);

// GET /api/payments/status/:paymentId
router.get("/status/:paymentId", authMiddleware, getPaymentStatus);
router.get("/my-orders", authMiddleware, getMyOrders);

export default router;