import express from "express";

import {
  upsertCreatorProfile,
  getCreatorProfile,
  patchCreatorProfile
} from "../controllers/creator.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/roles.middleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // ← manejo de imagen

// =========================================================
// CREATE / UPDATE CREATOR PROFILE
// =========================================================
router.post(
  "/",
  authMiddleware,
  checkRole(["influencer", "creator"]), // ← FIX: acepta ambos roles
  upload.single("profile_image"),        // ← FIX: procesa la imagen
  upsertCreatorProfile
);

// =========================================================
// GET CREATOR PROFILE
// =========================================================
router.get(
  "/:user_id",
  authMiddleware,
  checkRole(["influencer", "creator"]), // ← FIX
  getCreatorProfile
);

// =========================================================
// UPDATE CREATOR PROFILE
// =========================================================
router.patch(
  "/:user_id",
  authMiddleware,
  checkRole(["influencer", "creator"]), // ← FIX
  upload.single("profile_image"),        // ← FIX
  patchCreatorProfile
);

export default router;