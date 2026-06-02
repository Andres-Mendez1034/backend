import express from "express";
import cors from "cors";
import fs from "fs";
import yaml from "yaml";
import instagramRoutes from "./routes/instagram.routes.js";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import profileRoutes from "./routes/profiles.routes.js";
import marketplaceRoutes from "./routes/marketplace.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import fulfillmentRoutes from "./routes/fulfillment.routes.js";
import paymentsRoutes from "./payments/payments.routes.js";
import subscriptionsRoutes from "./subscriptions/subscriptions.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import devRoutes from "./routes/dev.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import db from "./config/db.js";

const app = express();

// =========================================================
// CORS
// =========================================================
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// =========================================================
// BODY PARSER — webhooks necesitan raw body, el resto JSON
// =========================================================
const WEBHOOK_PATHS = [
  "/api/payments/webhook",       // ← descomentado
  "/api/subscriptions/webhook",
];

app.use((req, res, next) => {
  if (WEBHOOK_PATHS.includes(req.originalUrl)) {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

// =========================================================
// SWAGGER
// =========================================================
let swaggerDocument;
try {
  const swaggerFile = fs.readFileSync("./src/docs/swagger.yaml", "utf8");
  swaggerDocument = yaml.parse(swaggerFile);
  const swaggerServerUrl = process.env.API_URL || process.env.SWAGGER_SERVER_URL;
  if (swaggerDocument && swaggerServerUrl) {
    swaggerDocument.servers = [{ url: swaggerServerUrl }];
  }
} catch (err) {
  console.error("Swagger load error:", err.message);
}
if (swaggerDocument) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// =========================================================
// HEALTH CHECK
// =========================================================
app.get("/", (req, res) => {
  res.json({ message: "🚀 Brand Connect API is running", status: "OK" });
});

// =========================================================
// DB TEST
// =========================================================
app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    return res.json({ status: "OK", time: result.rows[0].now });
  } catch (error) {
    return res.status(500).json({ status: "ERROR", message: error.message });
  }
});

// =========================================================
// ROUTES
// =========================================================
app.use("/api/auth",          authRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/profiles",      profileRoutes);
app.use("/profiles",          profileRoutes);
app.use("/api/marketplace",   marketplaceRoutes);
app.use("/api/payments",      paymentsRoutes);
app.use("/api/fulfillment",   fulfillmentRoutes);
app.use("/api/chatbot",       chatbotRoutes);
app.use("/api/instagram",     instagramRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/chat",          chatRoutes);

// =========================================================
// DEV ROUTES
// =========================================================
if (process.env.NODE_ENV !== "production") {
  app.use("/api/dev", devRoutes);
}

// =========================================================
// 404
// =========================================================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// =========================================================
// ERROR HANDLER
// =========================================================
app.use(errorMiddleware);

export default app;