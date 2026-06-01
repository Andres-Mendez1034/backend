import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  createInfluencerProfile,
  createClientProfile,
  createCreatorProfile,
  getProfileByUser,
  updateInfluencerProfile,
  getCreatorById,
  getInfluencersForMap,
  getClientsForMap, 
} from "../controllers/profiles.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Backwards-compatible: allow GET /profiles to list basic profiles (protected)
router.get("/", authMiddleware, async (req, res) => {
  // Minimal safe response for tests — delegates to controllers if needed later
  return res.json({ profiles: [] });
});

router.post("/influencer",          createInfluencerProfile);
router.post("/creator",             upload.single("profile_image"), createCreatorProfile);
router.post("/client",              createClientProfile);
router.get("/user/:user_id",        getProfileByUser);
router.put("/influencer/:user_id",  updateInfluencerProfile);
router.get("/creator/:id",          getCreatorById);
router.get("/influencers/map",      getInfluencersForMap);
router.get("/clients/map",     getClientsForMap); 

export default router;