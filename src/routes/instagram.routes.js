import express from "express";
import * as instagramController from "../controllers/instagram.controller.js";

const router = express.Router();

router.get(
  "/login",
  instagramController.login
);

router.get(
  "/callback",
  instagramController.callback
);

export default router;