import express from "express";
import cors from "cors";

// ==========================
// ROUTES
// ==========================
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import profileRoutes from "./routes/profiles.routes.js";
import marketplaceRoutes from "./routes/marketplace.routes.js";

// ==========================
// MIDDLEWARES
// ==========================
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

// ==========================
// GLOBAL MIDDLEWARES
// ==========================
app.use(cors());
app.use(express.json());

// ==========================
// HEALTH CHECK
// ==========================
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Brand Connect API is running"
  });
});

// ==========================
// 🧪 TEST DB ENDPOINT (IMPORTANTE PARA TI AHORA)
// ==========================
import db from "./config/db.js";

app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({
      status: "OK",
      time: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: error.message
    });
  }
});

// ==========================
// ROUTES
// ==========================
app.use("/api/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/profiles", profileRoutes);
app.use("/marketplace", marketplaceRoutes);

// ==========================
// ERROR HANDLER (SIEMPRE AL FINAL)
// ==========================
app.use(errorMiddleware);

export default app;