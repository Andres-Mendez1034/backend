import express from "express";
import {
  createService,
  getAllServices,
  getServicesByUser,
  updateServiceStatus
} from "../controllers/marketplace.controller.js";

const router = express.Router();

/* =========================================================
   CREATE SERVICE
========================================================= */
/**
 * @openapi
 * /marketplace/service:
 *   post:
 *     summary: Create a new service (influencer offering)
 *     tags:
 *       - Marketplace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - title
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "1"
 *               title:
 *                 type: string
 *                 example: "Instagram Reel Promotion"
 *               description:
 *                 type: string
 *                 example: "I will promote your brand on Instagram reels"
 *               price:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: Service created successfully
 *       500:
 *         description: Server error
 */
router.post("/service", createService);

/* =========================================================
   GET ALL SERVICES
========================================================= */
/**
 * @openapi
 * /marketplace/services:
 *   get:
 *     summary: Get all marketplace services
 *     tags:
 *       - Marketplace
 *     responses:
 *       200:
 *         description: List of services retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/services", getAllServices);

/* =========================================================
   GET SERVICES BY USER
========================================================= */
/**
 * @openapi
 * /marketplace/services/user/{user_id}:
 *   get:
 *     summary: Get services by user ID
 *     tags:
 *       - Marketplace
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *     responses:
 *       200:
 *         description: User services retrieved successfully
 *       404:
 *         description: No services found
 *       500:
 *         description: Server error
 */
router.get("/services/user/:user_id", getServicesByUser);

/* =========================================================
   UPDATE SERVICE STATUS
========================================================= */
/**
 * @openapi
 * /marketplace/service/status:
 *   put:
 *     summary: Update service status
 *     tags:
 *       - Marketplace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_id
 *               - status
 *             properties:
 *               service_id:
 *                 type: string
 *                 example: "10"
 *               status:
 *                 type: string
 *                 example: "active"
 *                 description: "active | paused | deleted"
 *     responses:
 *       200:
 *         description: Service status updated
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.put("/service/status", updateServiceStatus);

export default router;