import express from "express";
import {
  register,
  login,
  verifyMFA,
  getMFAQR
} from "../controllers/auth.controller.js";

const router = express.Router();

/* =========================================================
   REGISTER
========================================================= */
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@email.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post("/register", register);

/* =========================================================
   LOGIN
========================================================= */
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@email.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/* =========================================================
   VERIFY MFA
========================================================= */
/**
 * @openapi
 * /api/auth/verify-mfa:
 *   post:
 *     summary: Verify MFA code
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - code
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "123"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: MFA verified successfully
 *       401:
 *         description: Invalid MFA code
 */
router.post("/verify-mfa", verifyMFA);

/* =========================================================
   GET MFA QR
========================================================= */
/**
 * @openapi
 * /api/auth/mfa/qr:
 *   post:
 *     summary: Get MFA QR code
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "123"
 *     responses:
 *       200:
 *         description: QR generated successfully
 */
router.post("/mfa/qr", getMFAQR);

export default router;