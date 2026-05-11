import express from "express";

import {
  createService,
  getAllServices,
  getServicesByUser,
  updateServiceStatus
} from "../controllers/marketplace.controller.js";

import {
  getFulfillmentByOrder,
  acceptOrder,
  deliverService,
  completeOrder
} from "../controllers/fulfillment.controller.js";

const router = express.Router();

/* =========================================================
   CREATE SERVICE
========================================================= */
router.post(
  "/service",
  createService
);

/* =========================================================
   GET ALL SERVICES
========================================================= */
router.get(
  "/services",
  getAllServices
);

/* =========================================================
   GET SERVICES BY USER
========================================================= */
router.get(
  "/services/user/:user_id",
  getServicesByUser
);

/* =========================================================
   UPDATE SERVICE STATUS
========================================================= */
router.put(
  "/service/status",
  updateServiceStatus
);

/* =========================================================
   FULFILLMENT FLOW
========================================================= */

/* GET FULFILLMENT */
router.get(
  "/fulfillment/:order_id",
  getFulfillmentByOrder
);

/* ACCEPT ORDER */
router.post(
  "/fulfillment/accept",
  acceptOrder
);

/* DELIVER SERVICE */
router.post(
  "/fulfillment/deliver",
  deliverService
);

/* COMPLETE ORDER */
router.post(
  "/fulfillment/complete",
  completeOrder
);

export default router;