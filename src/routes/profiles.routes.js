import express from "express";
import multer from "multer";

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

router.post("/influencer",          createInfluencerProfile);
router.post("/creator",             upload.single("profile_image"), createCreatorProfile);
router.post("/client",              createClientProfile);
router.get("/user/:user_id",        getProfileByUser);
router.put("/influencer/:user_id",  updateInfluencerProfile);
router.get("/creator/:id",          getCreatorById);
router.get("/influencers/map",      getInfluencersForMap);
router.get("/clients/map",     getClientsForMap); 

export default router;