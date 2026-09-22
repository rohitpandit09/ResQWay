// Backend/src/emergency/emergencyController.js

import {
  createEmergencySession,
  startEmergencySession,
  getEmergencySession,
  cancelEmergencySession,
} from "./emergencyService.js";

import {
  buildTelemetry,
} from "../simulation/telemetryEngine.js";


// ==================================================
// CREATE + START EMERGENCY
// ==================================================

export function createEmergency(req, res) {
  try {
    const {
      callerId,
      driverId,
      callerNode,
    } = req.body;


    // -----------------------------------------------
    // Basic validation
    // -----------------------------------------------

    if (!callerId) {
      return res.status(400).json({
        success: false,
        message: "callerId is required",
      });
    }

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "driverId is required",
      });
    }

    if (!callerNode) {
      return res.status(400).json({
        success: false,
        message: "callerNode is required",
      });
    }


    // -----------------------------------------------
    // Create emergency
    // -----------------------------------------------

    const session =
      createEmergencySession({
        callerId,
        driverId,
        callerNode,
      });


    // -----------------------------------------------
    // TEMPORARY:
    // AI approval will be replaced by Groq later
    // -----------------------------------------------

    const startedSession =
      startEmergencySession(
        session.emergencyId
      );


    // -----------------------------------------------
    // Get initial simulation
    // -----------------------------------------------

    const latestSession =
      getEmergencySession(
        session.emergencyId
      );


    const telemetry =
      latestSession?.simulationState
        ? buildTelemetry(
            latestSession.simulationState
          )
        : null;


    return res.status(201).json({
      success: true,

      message:
        "Emergency created and simulation started",

      emergency: latestSession,

      telemetry,
    });

  } catch (error) {
    console.error(
      "[EMERGENCY CONTROLLER] Create error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create emergency",

      error:
        error.message,
    });
  }
}


// ==================================================
// GET EMERGENCY
// ==================================================

export function getEmergency(req, res) {
  try {
    const {
      emergencyId,
    } = req.params;


    const session =
      getEmergencySession(
        emergencyId
      );


    if (!session) {
      return res.status(404).json({
        success: false,

        message:
          "Emergency session not found",
      });
    }


    const telemetry =
      session.simulationState
        ? buildTelemetry(
            session.simulationState
          )
        : null;


    return res.status(200).json({
      success: true,

      emergency: session,

      telemetry,
    });

  } catch (error) {
    console.error(
      "[EMERGENCY CONTROLLER] Get error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to get emergency",

      error:
        error.message,
    });
  }
}


// ==================================================
// CANCEL EMERGENCY
// ==================================================

export function cancelEmergency(req, res) {
  try {
    const {
      emergencyId,
    } = req.params;


    const cancelled =
      cancelEmergencySession(
        emergencyId
      );


    if (!cancelled) {
      return res.status(404).json({
        success: false,

        message:
          "Emergency session not found",
      });
    }


    return res.status(200).json({
      success: true,

      message:
        "Emergency cancelled",

      emergencyId,
    });

  } catch (error) {
    console.error(
      "[EMERGENCY CONTROLLER] Cancel error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to cancel emergency",

      error:
        error.message,
    });
  }
}