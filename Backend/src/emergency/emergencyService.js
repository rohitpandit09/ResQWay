// Backend/src/emergency/emergencyService.js

import { EventEmitter } from "events";

import {
  simulationEvents,
  startSimulation,
  getSimulation,
  hasSimulation,
  stopSimulation,
} from "../simulation/simulationManager.js";

import {
  EMERGENCY_STATUS,
} from "./emergencyState.js";

import {
  CLIENT_NODE,
  HOSPITAL_NODE,
} from "../simulation/roadNetwork.js";


// ==================================================
// EMERGENCY EVENTS
// ==================================================

export const emergencyEvents =
  new EventEmitter();


// ==================================================
// ACTIVE EMERGENCY SESSIONS
// ==================================================

const emergencySessions =
  new Map();


// ==================================================
// GENERATE EMERGENCY ID
// ==================================================

function generateEmergencyId() {
  return `EMG-${Date.now()}`;
}


// ==================================================
// CREATE EMERGENCY SESSION
// ==================================================

export function createEmergencySession({
  callerId = "USER-001",
  driverId = "DRIVER-001",
  callerNode = CLIENT_NODE,
}) {

  const emergencyId =
    generateEmergencyId();


  const session = {

    emergencyId,


    // ---------------------------------------------
    // CALLER
    // ---------------------------------------------

    caller: {
      id: callerId,

      location: {
        node: callerNode,
      },
    },


    // ---------------------------------------------
    // AMBULANCE
    // ---------------------------------------------

    ambulance: {
      id: "AMB-01",

      driverId,

      startNode: "A1",
    },


    // ---------------------------------------------
    // DESTINATION
    // ---------------------------------------------

    destination: {

      clientNode:
        callerNode,

      hospitalNode:
        HOSPITAL_NODE,
    },


    // ---------------------------------------------
    // EMERGENCY STATUS
    // ---------------------------------------------

    status:
      EMERGENCY_STATUS.CALLING,


    // ---------------------------------------------
    // CALL / AI DATA
    // ---------------------------------------------

    transcript: null,

    aiAnalysis: {

      completed:
        false,

      isGenuine:
        null,

      confidence:
        null,

      category:
        null,

      severity:
        null,

      reason:
        null,

      summary:
        null,
    },


    // ---------------------------------------------
    // SIMULATION
    // ---------------------------------------------

    simulation: {

      started:
        false,

      completed:
        false,
    },


    // ---------------------------------------------
    // LATEST SIMULATION DATA
    // ---------------------------------------------

    latestSimulationState:
      null,

    latestTelemetry:
      null,

    latestSnapshot:
      null,


    // ---------------------------------------------
    // TIMESTAMPS
    // ---------------------------------------------

    createdAt:
      Date.now(),

    startedAt:
      null,

    completedAt:
      null,
  };


  emergencySessions.set(
    emergencyId,
    session
  );


  console.log(
    `[EMERGENCY] Created: ${emergencyId}`
  );


  // ---------------------------------------------
  // Tell other backend modules
  // ---------------------------------------------

  emergencyEvents.emit(
    "emergency:created",
    session
  );


  return session;
}


// ==================================================
// START EMERGENCY SESSION
// ==================================================

export function startEmergencySession(
  emergencyId,
  {
    transcript = null,
    aiAnalysis = null,
  } = {}
) {

  const session =
    emergencySessions.get(
      emergencyId
    );


  // ---------------------------------------------
  // Validate session
  // ---------------------------------------------

  if (!session) {
    throw new Error(
      `Emergency not found: ${emergencyId}`
    );
  }


  // ---------------------------------------------
  // Prevent duplicate start
  // ---------------------------------------------

  if (
    session.simulation.started
  ) {

    throw new Error(
      `Emergency already started: ${emergencyId}`
    );
  }


  // ---------------------------------------------
  // AI ANALYSIS
  // ---------------------------------------------

  session.status =
    EMERGENCY_STATUS.AI_ANALYSIS;


  // ---------------------------------------------
  // STORE TRANSCRIPT
  // ---------------------------------------------

  if (transcript) {

    session.transcript =
      transcript;
  }


  // ---------------------------------------------
  // STORE GROQ RESULT
  // ---------------------------------------------

  if (aiAnalysis) {

    session.aiAnalysis = {

      completed:
        true,

      isGenuine:
        aiAnalysis.isGenuine ?? null,

      confidence:
        aiAnalysis.confidence ?? null,

      category:
        aiAnalysis.category ??
        aiAnalysis.emergencyType ??
        null,

      severity:
        aiAnalysis.severity ??
        null,

      reason:
        aiAnalysis.reason ??
        aiAnalysis.summary ??
        null,

      summary:
        aiAnalysis.summary ??
        null,
    };
  }


  // ==================================================
  // VALIDATE AI RESULT
  // ==================================================

  if (!aiAnalysis) {

    console.warn(
      `[EMERGENCY] No AI analysis provided for ${emergencyId}`
    );


    session.aiAnalysis = {

      ...session.aiAnalysis,

      completed:
        false,

      isGenuine:
        null,

      reason:
        "AI analysis was not provided.",
    };


    session.status =
      EMERGENCY_STATUS.AI_FAILED;


    emergencyEvents.emit(
      "emergency:ai-failed",
      session
    );


    return session;
  }


  // ==================================================
  // AI REJECTED EMERGENCY
  // ==================================================

  if (
    !session.aiAnalysis.isGenuine
  ) {

    session.status =
      EMERGENCY_STATUS.REJECTED;


    console.log(
      `[EMERGENCY] Rejected by AI: ${emergencyId}`
    );


    emergencyEvents.emit(
      "emergency:rejected",
      session
    );


    return session;
  }


  // ==================================================
  // AI APPROVED EMERGENCY
  // ==================================================

  console.log(
    `[EMERGENCY] AI approved emergency: ${emergencyId}`
  );


  // ---------------------------------------------
  // DISPATCHED
  // ---------------------------------------------

  session.status =
    EMERGENCY_STATUS.DISPATCHED;


  emergencyEvents.emit(
    "emergency:dispatched",
    session
  );


  // ---------------------------------------------
  // START SIMULATION
  // ---------------------------------------------

  startSimulation(
    emergencyId
  );


  session.simulation.started =
    true;


  session.startedAt =
    Date.now();


  session.status =
    EMERGENCY_STATUS.EN_ROUTE_TO_USER;


  console.log(
    `[EMERGENCY] Started: ${emergencyId}`
  );


  emergencyEvents.emit(
    "emergency:started",
    session
  );


  return session;
}


// ==================================================
// SYNC EMERGENCY FROM SIMULATION
// ==================================================
//
// Simulation:
//     EN_ROUTE_TO_USER
//     ARRIVED_AT_USER
//     PATIENT_PICKUP
//     EN_ROUTE_TO_HOSPITAL
//     ARRIVED_AT_HOSPITAL
//     COMPLETED
//
// becomes emergency session status too.
// ==================================================

simulationEvents.on(
  "simulation:state",

  ({
    emergencyId,
    telemetry,
    snapshot,
  }) => {

    const session =
      emergencySessions.get(
        emergencyId
      );


    // ---------------------------------------------
    // Emergency may not exist
    // ---------------------------------------------

    if (!session) {
      return;
    }


    // ---------------------------------------------
    // Store latest live simulation state
    // ---------------------------------------------

    session.latestSimulationState =
      snapshot || null;

    session.latestTelemetry =
      telemetry || null;

    session.latestSnapshot =
      snapshot || null;


    // ---------------------------------------------
    // Read simulation ambulance status
    // ---------------------------------------------

    const simulationStatus =
      telemetry?.ambulance?.status;


    if (!simulationStatus) {
      return;
    }


    // ---------------------------------------------
    // Detect status change
    // ---------------------------------------------

    const previousStatus =
      session.status;


    // ---------------------------------------------
    // EN ROUTE TO USER
    // ---------------------------------------------

    if (
      simulationStatus ===
      "EN_ROUTE_TO_USER"
    ) {

      session.status =
        EMERGENCY_STATUS.EN_ROUTE_TO_USER;
    }


    // ---------------------------------------------
    // ARRIVED AT USER
    // ---------------------------------------------

    else if (
      simulationStatus ===
      "ARRIVED_AT_USER"
    ) {

      session.status =
        EMERGENCY_STATUS.ARRIVED_AT_USER;
    }


    // ---------------------------------------------
    // PATIENT PICKUP
    // ---------------------------------------------

    else if (
      simulationStatus ===
      "PATIENT_PICKUP"
    ) {

      session.status =
        EMERGENCY_STATUS.PATIENT_PICKUP;
    }


    // ---------------------------------------------
    // EN ROUTE TO HOSPITAL
    // ---------------------------------------------

    else if (
      simulationStatus ===
      "EN_ROUTE_TO_HOSPITAL"
    ) {

      session.status =
        EMERGENCY_STATUS.EN_ROUTE_TO_HOSPITAL;
    }


    // ---------------------------------------------
    // ARRIVED AT HOSPITAL
    // ---------------------------------------------

    else if (
      simulationStatus ===
      "ARRIVED_AT_HOSPITAL"
    ) {

      session.status =
        EMERGENCY_STATUS.ARRIVED_AT_HOSPITAL;
    }


    // ---------------------------------------------
    // COMPLETED
    // ---------------------------------------------

    else if (
      simulationStatus ===
      "COMPLETED"
    ) {

      session.status =
        EMERGENCY_STATUS.COMPLETED;


      session.simulation.completed =
        true;


      session.completedAt =
        Date.now();
    }


    // ---------------------------------------------
    // Log status transition
    // ---------------------------------------------

    if (
      previousStatus !==
      session.status
    ) {

      console.log(
        `[EMERGENCY] ${emergencyId}: ${previousStatus} → ${session.status}`
      );


      emergencyEvents.emit(
        "emergency:status-changed",
        {
          emergencyId,

          previousStatus,

          status:
            session.status,

          telemetry,

          snapshot,
        }
      );
    }


    // ---------------------------------------------
    // Always emit live update
    // ---------------------------------------------

    emergencyEvents.emit(
      "emergency:updated",
      {
        emergencyId,

        session,

        telemetry,

        snapshot,
      }
    );
  }
);


// ==================================================
// GET EMERGENCY SESSION
// ==================================================

export function getEmergencySession(
  emergencyId
) {

  const session =
    emergencySessions.get(
      emergencyId
    );


  if (!session) {
    return null;
  }


  // ---------------------------------------------
  // Get active simulation if available
  // ---------------------------------------------

  const simulation =
    getSimulation(
      emergencyId
    );


  return {

    ...session,

    simulationState:
      simulation ||
      session.latestSimulationState ||
      null,

    telemetry:
      session.latestTelemetry ||
      null,

    snapshot:
      session.latestSnapshot ||
      null,
  };
}


// ==================================================
// CANCEL EMERGENCY
// ==================================================

export function cancelEmergencySession(
  emergencyId
) {

  const session =
    emergencySessions.get(
      emergencyId
    );


  if (!session) {
    return false;
  }


  // ---------------------------------------------
  // Stop active simulation
  // ---------------------------------------------

  if (
    hasSimulation(
      emergencyId
    )
  ) {

    stopSimulation(
      emergencyId
    );
  }


  // ---------------------------------------------
  // Update state
  // ---------------------------------------------

  session.status =
    EMERGENCY_STATUS.CANCELLED;


  session.simulation.started =
    false;


  emergencyEvents.emit(
    "emergency:cancelled",
    session
  );


  console.log(
    `[EMERGENCY] Cancelled: ${emergencyId}`
  );


  return true;
}


// ==================================================
// GET ALL EMERGENCIES
// ==================================================

export function getAllEmergencySessions() {

  return Array.from(
    emergencySessions.values()
  );
}


// ==================================================
// CHECK SESSION
// ==================================================

export function hasEmergencySession(
  emergencyId
) {

  return emergencySessions.has(
    emergencyId
  );
}