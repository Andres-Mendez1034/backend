import express from "express";
import { sendMessage, getHistory } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/message", sendMessage);
router.get("/history/:userId", getHistory);

export default router;