// Backend/src/emergency/emergencyRoutes.js

import express from "express";

import {
  createEmergency,
  processEmergencyCall,
  getEmergency,
  cancelEmergency,
} from "./emergencyController.js";


const router = express.Router();


// ==================================================
// CREATE + START EMERGENCY
// ==================================================

router.post(
  "/",
  createEmergency
);


// ==================================================
// PROCESS EMERGENCY CALL WITH GROQ AI
// ==================================================
//
// multipart/form-data
//
// audio       -> File
// callerId    -> Text
// driverId    -> Text
// callerNode  -> Text
//
// Flow:
//
// Audio
//   ↓
// Groq Whisper
//   ↓
// Transcript
//   ↓
// Groq Emergency Analysis
//   ↓
// Genuine / Non-Genuine
//   ↓
// Emergency Session
//
// ==================================================

router.post(
  "/process-call",
  ...processEmergencyCall
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