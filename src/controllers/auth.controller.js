import { registerUser, loginUser } from "../services/auth.service.js";
import { sendVerificationEmail } from "../email/email.service.js";
import speakeasy from "speakeasy";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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
    stack:   err.stack,
  });
};

/* =========================================================
   REGISTER
   Flujo: crea usuario → envía email de verificación
   NO devuelve JWT ni MFA aún
========================================================= */
export const register = async (req, res) => {
  const TYPE = "REGISTER";

  try {
    log(TYPE, "START", "Request received", req.body);

    const { email, password, name, role = "client" } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ── Verificar duplicado ──
    const existing = await db.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    // ── Crear usuario (email_verified = false por defecto) ──
    const user = await registerUser({ email, password, name, role });

    // ── Generar token de verificación ──
    const emailToken   = crypto.randomBytes(32).toString("hex");
const emailExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutos

    await db.query(
      `UPDATE users
       SET email_verification_token   = $1,
           email_verification_expires = $2
       WHERE id = $3`,
      [emailToken, emailExpires, user.id]
    );

    // ── Enviar email ──
    await sendVerificationEmail({ name, email, token: emailToken });

    log(TYPE, "DONE", `Verification email sent to ${email}`);

    return res.status(201).json({
      message: "Account created. Please check your email to verify your account.",
    });

  } catch (err) {
    logError(TYPE, "FATAL", err);
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   VERIFY EMAIL
   GET /api/auth/verify-email?token=xxx
   - Valida token
   - Marca email_verified = true
   - Genera MFA secret
   - Devuelve { verified, email, otpauth_url } para continuar con MFA setup
========================================================= */
export const verifyEmail = async (req, res) => {
  const TYPE = "VERIFY_EMAIL";

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // ── Buscar usuario con token válido y no expirado ──
    const { rows } = await db.query(
      `SELECT id, email, name
       FROM users
       WHERE email_verification_token   = $1
         AND email_verification_expires > NOW()`,
      [token]
    );

    if (!rows.length) {
      return res.status(400).json({
        error:   "TOKEN_INVALID",
        message: "El enlace es inválido o ya expiró.",
      });
    }

    const user = rows[0];

    // ── Generar MFA secret ──
    const secret = speakeasy.generateSecret({
      name: `BrandConnect (${user.email})`,
    });

    // ── Marcar email verificado + limpiar token + guardar MFA secret ──
    await db.query(
      `UPDATE users
       SET email_verified              = true,
           email_verification_token    = NULL,
           email_verification_expires  = NULL,
           mfa_secret                  = $1,
           mfa_enabled                 = true
       WHERE id = $2`,
      [secret.base32, user.id]
    );

    log(TYPE, "DONE", `Email verified for ${user.email}`);

    return res.json({
      verified:    true,
      email:       user.email,
      name:        user.name,
      otpauth_url: secret.otpauth_url,
    });

  } catch (err) {
    logError(TYPE, "FATAL", err);
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   LOGIN
   Bloquea si email no está verificado
========================================================= */
export const login = async (req, res) => {
  const TYPE = "LOGIN";

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await loginUser({ email, password });

    // ── Bloquear si no verificó email ──
    if (!user.email_verified) {
      return res.status(403).json({
        error:   "EMAIL_NOT_VERIFIED",
        message: "Debes verificar tu correo antes de iniciar sesión.",
      });
    }

    // ── Sin MFA: JWT directo ──
    if (!user.mfa_enabled) {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, mfa: false },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message:     "Login successful",
        token,
        user,
        mfaRequired: false,
      });
    }

    // ── Con MFA: pedir código ──
    return res.json({
      message:     "MFA required",
      user:        { id: user.id, email: user.email },
      mfaRequired: true,
    });

  } catch (err) {
    logError(TYPE, "FATAL", err);
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   VERIFY MFA — genera JWT final
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

    // ── Seguridad extra: no dejar pasar si email no verificado ──
    if (!user.email_verified) {
      return res.status(403).json({
        error:   "EMAIL_NOT_VERIFIED",
        message: "Debes verificar tu correo antes de continuar.",
      });
    }

    const cleanToken = token?.toString().trim();

    const verified = speakeasy.totp.verify({
      secret:   user.mfa_secret,
      encoding: "base32",
      token:    cleanToken,
      window:   1,
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid MFA code" });
    }

    // ── MFA OK: generar JWT real ──
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, mfa: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    delete user.password_hash;
    delete user.mfa_secret;

    return res.json({
      success: true,
      token:   jwtToken,
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