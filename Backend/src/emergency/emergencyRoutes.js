import express from "express";

import {
    createEmergency,
    getEmergency,
    getAllEmergencies
} from "./emergencyController.js";


const router =
    express.Router();


// ==================================================
// CREATE EMERGENCY
// ==================================================

router.post(
    "/",
    createEmergency
);


// ==================================================
// GET ALL
// ==================================================

router.get(
    "/",
    getAllEmergencies
);


// ==================================================
// GET ONE
// ==================================================

router.get(
    "/:emergencyId",
    getEmergency
);


export default router;