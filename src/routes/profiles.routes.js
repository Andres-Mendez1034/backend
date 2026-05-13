import express from "express";
import multer from "multer";

import {
  createInfluencerProfile,
  createClientProfile,
  createCreatorProfile,
  getProfileByUser,
  updateInfluencerProfile
} from "../controllers/profiles.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/influencer", createInfluencerProfile);
router.post("/creator", upload.single("profile_image"), createCreatorProfile); // ← multer aquí
router.post("/client", createClientProfile);
router.get("/user/:user_id", getProfileByUser);
router.put("/influencer/:user_id", updateInfluencerProfile);

export default router;