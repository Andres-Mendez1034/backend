import express from "express";
import {
  getFulfillmentByOrder,
  acceptOrder,
  deliverService,
  completeOrder
} from "../controllers/fulfillment.controller.js";

const router = express.Router();

/* =========================================================
   GET FULFILLMENT BY ORDER
========================================================= */
/**
 * @openapi
 * /fulfillment/{order_id}:
 *   get:
 *     summary: Get fulfillment by order ID
 *     tags:
 *       - Fulfillment
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: Fulfillment found
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.get("/:order_id", getFulfillmentByOrder);

/* =========================================================
   ACCEPT ORDER (INFLUENCER)
========================================================= */
/**
 * @openapi
 * /fulfillment/accept:
 *   post:
 *     summary: Influencer accepts an order
 *     tags:
 *       - Fulfillment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Order accepted
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Order not found
 */
router.post("/accept", acceptOrder);

/* =========================================================
   DELIVER SERVICE (INFLUENCER)
========================================================= */
/**
 * @openapi
 * /fulfillment/deliver:
 *   post:
 *     summary: Deliver service result
 *     tags:
 *       - Fulfillment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - delivery_data
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: "1"
 *               delivery_data:
 *                 type: object
 *                 example:
 *                   link: "https://result.com/file"
 *               notes:
 *                 type: string
 *                 example: "Delivery completed successfully"
 *     responses:
 *       200:
 *         description: Service delivered
 *       500:
 *         description: Server error
 */
router.post("/deliver", deliverService);

/* =========================================================
   COMPLETE ORDER (CLIENT CONFIRMATION)
========================================================= */
/**
 * @openapi
 * /fulfillment/complete:
 *   post:
 *     summary: Client marks order as completed
 *     tags:
 *       - Fulfillment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Order completed
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Order not found
 */
router.post("/complete", completeOrder);

export default router;