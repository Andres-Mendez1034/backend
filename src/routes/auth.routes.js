import express from "express";
import {
  register,
  login,
  verifyMFA,
  getMFAQR,
  verifyEmail,
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
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:    { type: string, example: test@email.com }
 *               password: { type: string, example: 123456 }
 *               name:     { type: string, example: Andrés }
 *     responses:
 *       201: { description: Account created, check email }
 *       400: { description: Validation error }
 *       409: { description: User already exists }
 */
router.post("/register", register);

/* =========================================================
   VERIFY EMAIL
========================================================= */
/**
 * @openapi
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify email with token from link
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Email verified, returns otpauth_url for MFA setup }
 *       400: { description: Invalid or expired token }
 */
router.get("/verify-email", verifyEmail);

/* =========================================================
   LOGIN
========================================================= */
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: test@email.com }
 *               password: { type: string, example: 123456 }
 *     responses:
 *       200: { description: Login successful or MFA required }
 *       401: { description: Invalid credentials }
 *       403: { description: Email not verified }
 */
router.post("/login", login);

/* =========================================================
   VERIFY MFA
========================================================= */
/**
 * @openapi
 * /api/auth/verify-mfa:
 *   post:
 *     summary: Verify MFA code and get JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, token]
 *             properties:
 *               email: { type: string, example: test@email.com }
 *               token: { type: string, example: "123456" }
 *     responses:
 *       200: { description: MFA verified, returns JWT }
 *       400: { description: Invalid MFA code }
 *       403: { description: Email not verified }
 */
router.post("/verify-mfa", verifyMFA);

/* =========================================================
   GET MFA QR
========================================================= */
/**
 * @openapi
 * /api/auth/mfa/qr:
 *   post:
 *     summary: Get MFA QR code URL
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: test@email.com }
 *     responses:
 *       200: { description: Returns otpauth_url }
 *       400: { description: MFA not configured }
 */
router.post("/mfa/qr", getMFAQR);

export default router;