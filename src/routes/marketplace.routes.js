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
   GET ALL SERVICES (ruta raíz — la usa el frontend)
========================================================= */
router.get("/", getAllServices);

/* =========================================================
   CREATE SERVICE
========================================================= */
router.post("/service", createService);

/* =========================================================
   GET ALL SERVICES
========================================================= */
router.get("/services", getAllServices);

/* =========================================================
   GET SERVICES BY USER
========================================================= */
router.get("/services/user/:user_id", getServicesByUser);

/* =========================================================
   UPDATE SERVICE STATUS
========================================================= */
router.put("/service/status", updateServiceStatus);

/* =========================================================
   FULFILLMENT FLOW
========================================================= */
router.get("/fulfillment/:order_id", getFulfillmentByOrder);
router.post("/fulfillment/accept", acceptOrder);
router.post("/fulfillment/deliver", deliverService);
router.post("/fulfillment/complete", completeOrder);

export default router;