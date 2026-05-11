import express from "express";

import {
  upsertCreatorProfile,
  getCreatorProfile,
  patchCreatorProfile
} from "../controllers/creator.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/roles.middleware.js";

const router = express.Router();

// =========================================================
// CREATE / UPDATE CREATOR PROFILE (ONLY INFLUENCERS)
// =========================================================
router.post(
  "/",
  authMiddleware,
  checkRole(["influencer"]),
  upsertCreatorProfile
);

// =========================================================
// GET CREATOR PROFILE (ONLY OWNER INFLUENCER)
// =========================================================
router.get(
  "/:user_id",
  authMiddleware,
  checkRole(["influencer"]),
  getCreatorProfile
);

// =========================================================
// UPDATE CREATOR PROFILE (ONLY INFLUENCERS)
// =========================================================
router.patch(
  "/:user_id",
  authMiddleware,
  checkRole(["influencer"]),
  patchCreatorProfile
);

export default router;