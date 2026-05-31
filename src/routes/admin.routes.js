import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import {
  getStats,
  getPayments,
  getPaymentsByDay,
  getPaymentsByMonth,
  getTopPlans,
  getTopInfluencers,
  getUsers,
  updateUserRole,
  banUser,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(authMiddleware, isAdmin);

// Dashboard
router.get("/stats",               getStats);

// Pagos
router.get("/payments",            getPayments);
router.get("/payments/by-day",     getPaymentsByDay);
router.get("/payments/by-month",   getPaymentsByMonth);

// Planes e influencers
router.get("/plans/top",           getTopPlans);
router.get("/influencers/top",     getTopInfluencers);

// Usuarios
router.get("/users",               getUsers);
router.patch("/users/:id/role",    updateUserRole);
router.patch("/users/:id/ban",     banUser);

export default router;