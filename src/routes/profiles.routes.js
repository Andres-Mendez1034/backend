import express from "express"

import {
  createInfluencerProfile,
  createClientProfile,
  getProfileByUser,
  updateInfluencerProfile
} from "../controllers/profiles.controller.js"

const router = express.Router()

// ==========================
// CREATE INFLUENCER PROFILE
// ==========================
router.post("/influencer", createInfluencerProfile)

// ==========================
// CREATE CLIENT PROFILE
// ==========================
router.post("/client", createClientProfile)

// ==========================
// GET PROFILE BY USER ID
// ==========================
router.get("/user/:user_id", getProfileByUser)

// ==========================
// UPDATE INFLUENCER PROFILE
// ==========================
router.put("/influencer/:user_id", updateInfluencerProfile)

export default router