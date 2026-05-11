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

// =========================================================
// CORS CONFIG (más seguro que cors() abierto)
// =========================================================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// =========================================================
// STRIPE WEBHOOK (RAW BODY - OBLIGATORIO)
// =========================================================
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

// =========================================================
// JSON PARSER
// =========================================================
app.use(express.json());

// =========================================================
// SWAGGER (SAFE LOAD)
// =========================================================
let swaggerDocument;

try {
  const swaggerFile = fs.readFileSync(
    "./src/docs/swagger.yaml",
    "utf8"
  );

  swaggerDocument = yaml.parse(swaggerFile);

} catch (err) {
  console.error("Swagger load error:", err.message);
}

// =========================================================
// SWAGGER ROUTE
// =========================================================
if (swaggerDocument) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
  );
}

// =========================================================
// HEALTH CHECK
// =========================================================
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Brand Connect API is running",
    status: "OK",
  });
});

// =========================================================
// DB TEST (SAFE)
// =========================================================
app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");

    return res.json({
      status: "OK",
      time: result.rows[0].now,
    });

  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
});

// =========================================================
// API ROUTES
// =========================================================

// AUTH
app.use("/api/auth", authRoutes);

// USERS
app.use("/api/users", userRoutes);

// PROFILES
app.use("/api/profiles", profileRoutes);

// MARKETPLACE
app.use("/api/marketplace", marketplaceRoutes);

// PAYMENTS (Stripe)
app.use("/api/payments", paymentsRoutes);

// FULFILLMENT
app.use("/api/fulfillment", fulfillmentRoutes);

// CHATBOT
app.use("/api/chatbot", chatbotRoutes);

// =========================================================
// 404 HANDLER (IMPORTANTE Y TE FALTABA)
// =========================================================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================
app.use(errorMiddleware);

export default app;