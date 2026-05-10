import express from "express";

import {
  createInfluencerProfile,
  createClientProfile,
  getProfileByUser,
  updateInfluencerProfile
} from "../controllers/profiles.controller.js";

const router = express.Router();

/* =========================================================
   CREATE INFLUENCER PROFILE
========================================================= */
/**
 * @openapi
 * /profiles/influencer:
 *   post:
 *     summary: Create influencer profile
 *     tags:
 *       - Profiles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - niche
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "1"
 *               niche:
 *                 type: string
 *                 example: "fitness"
 *               bio:
 *                 type: string
 *                 example: "Fitness influencer and coach"
 *     responses:
 *       201:
 *         description: Influencer profile created
 *       500:
 *         description: Server error
 */
router.post("/influencer", createInfluencerProfile);

/* =========================================================
   CREATE CLIENT PROFILE
========================================================= */
/**
 * @openapi
 * /profiles/client:
 *   post:
 *     summary: Create client profile
 *     tags:
 *       - Profiles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "2"
 *               company_name:
 *                 type: string
 *                 example: "My Startup"
 *               industry:
 *                 type: string
 *                 example: "tech"
 *     responses:
 *       201:
 *         description: Client profile created
 *       500:
 *         description: Server error
 */
router.post("/client", createClientProfile);

/* =========================================================
   GET PROFILE BY USER ID
========================================================= */
/**
 * @openapi
 * /profiles/user/{user_id}:
 *   get:
 *     summary: Get profile by user ID
 *     tags:
 *       - Profiles
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.get("/user/:user_id", getProfileByUser);

/* =========================================================
   UPDATE INFLUENCER PROFILE
========================================================= */
/**
 * @openapi
 * /profiles/influencer/{user_id}:
 *   put:
 *     summary: Update influencer profile
 *     tags:
 *       - Profiles
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               niche:
 *                 type: string
 *                 example: "lifestyle"
 *               bio:
 *                 type: string
 *                 example: "Updated bio here"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.put("/influencer/:user_id", updateInfluencerProfile);

export default router;