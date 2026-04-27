import db from "../config/db.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/* =========================================================
   REGISTER USER
========================================================= */
export const registerUser = async ({ email, password, name, role }) => {
  console.log("\n================ REGISTER SERVICE ================");
  console.log("📩 Email:", email);
  console.log("👤 Name:", name);
  console.log("🎭 Role:", role);

  if (!email || !password || !name || !role) {
    console.log("❌ VALIDATION ERROR: Missing fields");
    throw new Error("Missing fields");
  }

  console.log("🔎 Checking existing user...");

  const existing = await db.query(
    `SELECT id, email FROM users WHERE email = $1`,
    [email]
  );

  if (existing.rows.length > 0) {
    console.log("⚠️ USER ALREADY EXISTS:", existing.rows[0]);
    throw new Error("User already exists");
  }

  console.log("✅ User not found");

  console.log("🔐 Hashing password...");
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  console.log("💾 Inserting user...");

  const result = await db.query(
    `INSERT INTO users (email, password_hash, name, role, mfa_enabled)
     VALUES ($1, $2, $3, $4, false)
     RETURNING id, email, name, role, mfa_enabled, created_at`,
    [email, hashedPassword, name, role]
  );

  const user = result.rows[0];

  console.log("🎉 USER CREATED:");
  console.log(user);
  console.log("================================================\n");

  return user;
};

/* =========================================================
   LOGIN USER
========================================================= */
export const loginUser = async ({ email, password }) => {
  console.log("\n================ LOGIN SERVICE ================");
  console.log("📩 Email:", email);

  if (!email || !password) {
    throw new Error("Missing fields");
  }

  console.log("🔎 Searching user...");

  const result = await db.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    console.log("❌ User not found");
    throw new Error("User not found");
  }

  console.log("👤 User found");

  console.log("🔐 Checking password...");
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    console.log("❌ Invalid password");
    throw new Error("Invalid credentials");
  }

  console.log("✅ Password OK");
  console.log("================================================\n");

  delete user.password_hash;

  return user;
};