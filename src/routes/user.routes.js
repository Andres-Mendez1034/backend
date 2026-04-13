import express from "express"

import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../controllers/user.controller.js"

const router = express.Router()

// ==========================
// GET ALL USERS
// ==========================
router.get("/", getAllUsers)

// ==========================
// GET USER BY ID
// ==========================
router.get("/:id", getUserById)

// ==========================
// UPDATE USER
// ==========================
router.put("/:id", updateUser)

// ==========================
// DELETE USER
// ==========================
router.delete("/:id", deleteUser)

export default router