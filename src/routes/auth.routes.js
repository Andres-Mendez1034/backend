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
router.post("/register", register);

/* =========================================================
   LOGIN
========================================================= */
router.post("/login", login);

/* =========================================================
   VERIFY MFA
========================================================= */
router.post("/verify-mfa", verifyMFA);

/* =========================================================
   🔥 GET MFA QR (ESTO TE FALTABA)
========================================================= */
router.post("/mfa/qr", getMFAQR);

export default router;