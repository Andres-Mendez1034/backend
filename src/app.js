import express from "express";
import cors from "cors";
import fs from "fs";
import yaml from "yaml";

// ==========================
// SWAGGER
// ==========================
import swaggerUi from "swagger-ui-express";

// ==========================
// ROUTES
// ==========================
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import profileRoutes from "./routes/profiles.routes.js";
import marketplaceRoutes from "./routes/marketplace.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import fulfillmentRoutes from "./routes/fulfillment.routes.js";
import paymentsRoutes from "./payments/payments.routes.js";

// ==========================
// MIDDLEWARES
// ==========================
import { errorMiddleware } from "./middleware/error.middleware.js";

// ==========================
// DB
// ==========================
import db from "./config/db.js";

const app = express();

// ==========================
// CORS
// ==========================
app.use(cors());

// ==========================
// STRIPE WEBHOOK RAW BODY
// ==========================
// IMPORTANTE: debe ir antes de express.json
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

// ==========================
// JSON PARSER
// ==========================
app.use(express.json());

// ==========================
// SWAGGER YAML
// ==========================
const swaggerFile = fs.readFileSync(
  "./src/docs/swagger.yaml",
  "utf8"
);

const swaggerDocument = yaml.parse(swaggerFile);

// ==========================
// SWAGGER DOCS
// ==========================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// ==========================
// HEALTH CHECK
// ==========================
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Brand Connect API is running",
  });
});

// ==========================
// DB TEST
// ==========================
app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");

    res.json({
      status: "OK",
      time: result.rows[0],
    });

  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
});

// ==========================
// API ROUTES
// ==========================

// AUTH
app.use("/api/auth", authRoutes);

// USERS
app.use("/api/users", userRoutes);

// PROFILES
app.use("/api/profiles", profileRoutes);

// MARKETPLACE
app.use("/api/marketplace", marketplaceRoutes);

// PAYMENTS (Stripe) ✅ FIX CLAVE
app.use("/api/payments", paymentsRoutes);

// FULFILLMENT
app.use("/api/fulfillment", fulfillmentRoutes);

// CHATBOT
app.use("/api/chatbot", chatbotRoutes);

// ==========================
// GLOBAL ERROR HANDLER
// ==========================
app.use(errorMiddleware);

export default app;