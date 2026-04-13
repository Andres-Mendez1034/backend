import express from "express"
import {
  createService,
  getAllServices,
  getServicesByUser,
  updateServiceStatus
} from "../controllers/marketplace.controller.js"

const router = express.Router()

// ==========================
// CREATE SERVICE
// ==========================
router.post("/service", createService)

// ==========================
// GET ALL SERVICES (marketplace)
// ==========================
router.get("/services", getAllServices)

// ==========================
// GET SERVICES BY USER
// ==========================
router.get("/services/user/:user_id", getServicesByUser)

// ==========================
// UPDATE SERVICE STATUS
// ==========================
router.put("/service/status", updateServiceStatus)

export default router