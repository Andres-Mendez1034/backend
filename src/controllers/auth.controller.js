import { registerUser, loginUser } from "../services/auth.service.js";
import speakeasy from "speakeasy";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

/* =========================================================
   LOGGER HELPERS
========================================================= */
const log = (type, step, message, data = null) => {
  const prefix = `[AUTH][${type}][${step}]`;
  data ? console.log(prefix, message, data) : console.log(prefix, message);
};

const logError = (type, step, err) => {
  console.error(`[AUTH][${type}][${step}][ERROR]`, {
    message: err.message,
    stack: err.stack,
  });
};

/* =========================================================
   REGISTER
========================================================= */
export const register = async (req, res) => {
  const TYPE = "REGISTER";

  try {
    log(TYPE, "START", "Request received", req.body);

    const { email, password, name, role = "client" } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await db.query(
      `SELECT id, email FROM users WHERE email = $1`,
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "User already exists",
      });
    }

    const user = await registerUser({ email, password, name, role });

    const secret = speakeasy.generateSecret({
      name: `BrandConnect (${email})`,
    });

    await db.query(
      `UPDATE users 
       SET mfa_secret = $1, mfa_enabled = true
       WHERE id = $2`,
      [secret.base32, user.id]
    );

    return res.status(201).json({
      message: "User created",
      user,
      mfaRequired: true,
      otpauth_url: secret.otpauth_url,
    });

  } catch (err) {
    logError(TYPE, "FATAL", err);
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   LOGIN
========================================================= */
export const login = async (req, res) => {
  const TYPE = "LOGIN";

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await loginUser({ email, password });

    if (!user.mfa_enabled) {
      // ✅ Sin MFA: generar JWT directo
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, mfa: false },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login successful",
        token,
        user,
        mfaRequired: false,
      });
    }

    return res.json({
      message: "MFA required",
      user: { id: user.id, email: user.email },
      mfaRequired: true,
    });

  } catch (err) {
    logError(TYPE, "FATAL", err);
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   VERIFY MFA — ✅ GENERA JWT AQUÍ
========================================================= */
export const verifyMFA = async (req, res) => {
  const TYPE = "MFA";

  try {
    const { email, token } = req.body;

    const result = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user || !user.mfa_secret) {
      return res.status(400).json({ error: "MFA not configured" });
    }

    const cleanToken = token?.toString().trim();

    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token: cleanToken,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid MFA code" });
    }

    // ✅ MFA OK: generar JWT real
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, mfa: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    delete user.password_hash;
    delete user.mfa_secret;

    return res.json({
      success: true,
      token: jwtToken,
      user,
    });

  } catch (err) {
    logError(TYPE, "FATAL", err);
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   GET MFA QR
========================================================= */
export const getMFAQR = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await db.query(
      `SELECT mfa_secret FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user?.mfa_secret) {
      return res.status(400).json({ error: "MFA not configured" });
    }

    const otpauth_url = `otpauth://totp/BrandConnect:${email}?secret=${user.mfa_secret}&issuer=BrandConnect`;

    return res.json({ otpauth_url });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};