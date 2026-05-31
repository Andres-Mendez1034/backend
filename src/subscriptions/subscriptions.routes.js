import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getPlans,
  createSubscriptionCheckout,
  handleSubscriptionWebhook,
} from "./subscriptions.controller.js";

const router = express.Router();

/* =========================================================
   GET PLANS (público)
========================================================= */
router.get("/plans", getPlans);

/* =========================================================
   CREATE CHECKOUT (requiere auth)
========================================================= */
router.post("/checkout", authMiddleware, createSubscriptionCheckout);

/* =========================================================
   WEBHOOK (sin auth — Stripe firma con secret)
========================================================= */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleSubscriptionWebhook
);

export default router;