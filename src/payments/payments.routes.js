import express from "express";

import {
  createCheckoutSession,
  handleStripeWebhook,
  getPaymentStatus
} from "./payments.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

/* =========================================================
   CREATE STRIPE CHECKOUT SESSION
========================================================= */
router.post(
  "/checkout/:service_id",
  authMiddleware,
  createCheckoutSession
);

/* =========================================================
   STRIPE WEBHOOK
========================================================= */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* =========================================================
   GET PAYMENT STATUS
========================================================= */
router.get(
  "/status/:order_id",
  authMiddleware,
  getPaymentStatus
);

export default router;