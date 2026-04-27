import { registerUser, loginUser } from "../services/auth.service.js";
import speakeasy from "speakeasy";
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

    /* =========================================
       CHECK EXISTING USER
    ========================================= */
    const existing = await db.query(
      `SELECT id, email FROM users WHERE email = $1`,
      [email]
    );

    if (existing.rows.length > 0) {
      log(TYPE, "EXISTS", "User already exists", existing.rows[0]);

      return res.status(409).json({
        error: "User already exists",
      });
    }

    log(TYPE, "CREATE", "Creating user");

    const user = await registerUser({
      email,
      password,
      name,
      role,
    });

    log(TYPE, "CREATED", "User created", user);

    /* =========================================
       MFA SETUP
    ========================================= */
    const secret = speakeasy.generateSecret({
      name: `BrandConnect (${email})`,
    });

    await db.query(
      `UPDATE users 
       SET mfa_secret = $1, mfa_enabled = true
       WHERE id = $2`,
      [secret.base32, user.id]
    );

    log(TYPE, "MFA", "MFA enabled");

    return res.status(201).json({
      message: "User created",
      user,
      mfaRequired: true,
      otpauth_url: secret.otpauth_url,
    });

  } catch (err) {
    logError(TYPE, "FATAL", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

/* =========================================================
   LOGIN
========================================================= */
export const login = async (req, res) => {
  const TYPE = "LOGIN";

  try {
    log(TYPE, "START", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await loginUser({ email, password });

    if (!user.mfa_enabled) {
      return res.json({
        message: "Login successful",
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

    return res.status(500).json({
      error: err.message,
    });
  }
};

export const verifyMFA = async (req, res) => {
  const TYPE = "MFA";

  try {
    log(TYPE, "VERIFY_START", req.body);

    const { email, token } = req.body;

    console.log("📩 RAW BODY:", req.body);
    console.log("📧 EMAIL:", email);
    console.log("🔢 TOKEN RAW:", token);
    console.log("🔢 TOKEN TYPE:", typeof token);
    console.log("🔢 TOKEN LENGTH:", token?.length);

    const result = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    console.log("👤 USER FOUND:", user?.email);
    console.log("🔐 MFA ENABLED:", user?.mfa_enabled);
    console.log("🔑 SECRET DB:", user?.mfa_secret);
    console.log("🔑 SECRET TYPE:", typeof user?.mfa_secret);
    console.log("🔑 SECRET LENGTH:", user?.mfa_secret?.length);

    if (!user || !user.mfa_secret) {
      console.log("❌ NO MFA CONFIGURED");
      return res.status(400).json({
        error: "MFA not configured",
      });
    }

    // 🔥 PRUEBA con trim (MUY IMPORTANTE)
    const cleanToken = token?.toString().trim();

    console.log("🧹 TOKEN CLEAN:", cleanToken);
    console.log("🧹 TOKEN CLEAN LENGTH:", cleanToken?.length);

    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token: cleanToken,
      window: 1,
    });

    console.log("🧪 VERIFY RESULT:", verified);

    if (!verified) {
      console.log("❌ MFA INVALID");
      return res.status(400).json({
        error: "Invalid MFA code",
      });
    }

    console.log("✅ MFA SUCCESS");

    return res.json({
      success: true,
      user,
    });

  } catch (err) {
    logError(TYPE, "FATAL", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

/* =========================================================
   🔥 NEW: MFA QR ENDPOINT (ESTO TE FALTABA)
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
      return res.status(400).json({
        error: "MFA not configured",
      });
    }

    const otpauth_url = `otpauth://totp/BrandConnect:${email}?secret=${user.mfa_secret}&issuer=BrandConnect`;

    return res.json({
      otpauth_url,
    });

  } catch (err) {
    console.error("MFA QR ERROR:", err.message);

    return res.status(500).json({
      error: err.message,
    });
  }
};