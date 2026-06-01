import express from "express";
import * as instagramController from "../controllers/instagram.controller.js";

const router = express.Router();

router.get("/login", instagramController.login);
router.get("/callback", instagramController.callback);
router.get("/profile", instagramController.profile);
router.get("/media", instagramController.media);
router.get("/insights", instagramController.insights);
router.get("/search", instagramController.searchByUsername);

export default router;