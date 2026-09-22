// Backend/src/emergency/emergencyRoutes.js

import express from "express";

import {
  createEmergency,
  getEmergency,
  cancelEmergency,
} from "./emergencyController.js";


const router =
  express.Router();


// ==================================================
// CREATE + START EMERGENCY
// ==================================================

router.post(
  "/",
  createEmergency
);


// ==================================================
// GET CURRENT EMERGENCY STATE
// ==================================================

router.get(
  "/:emergencyId",
  getEmergency
);


// ==================================================
// CANCEL EMERGENCY
// ==================================================

router.post(
  "/:emergencyId/cancel",
  cancelEmergency
);


export default router;