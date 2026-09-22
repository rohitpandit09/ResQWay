// Backend/src/emergency/emergencyService.js

import {
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
// ACTIVE EMERGENCY SESSIONS
// ==================================================

const emergencySessions = new Map();


// ==================================================
// ID GENERATOR
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

    caller: {
      id: callerId,

      location: {
        node: callerNode,
      },
    },

    ambulance: {
      id: "AMB-01",

      driverId,

      startNode: "A1",
    },

    destination: {
      clientNode: callerNode,

      hospitalNode: HOSPITAL_NODE,
    },

    status:
      EMERGENCY_STATUS.CALLING,

    aiAnalysis: {
      completed: false,

      isGenuine: null,

      confidence: null,

      category: null,

      reason: null,
    },

    simulation: {
      started: false,

      completed: false,
    },

    createdAt: Date.now(),

    startedAt: null,

    completedAt: null,
  };


  emergencySessions.set(
    emergencyId,
    session
  );


  console.log(
    `[EMERGENCY] Created: ${emergencyId}`
  );


  return session;
}


// ==================================================
// START EMERGENCY SESSION
// ==================================================

export function startEmergencySession(
  emergencyId
) {
  const session =
    emergencySessions.get(
      emergencyId
    );

  if (!session) {
    throw new Error(
      `Emergency not found: ${emergencyId}`
    );
  }


  // -----------------------------------------------
  // Prevent duplicate start
  // -----------------------------------------------

  if (session.simulation.started) {
    throw new Error(
      `Emergency already started: ${emergencyId}`
    );
  }


  // -----------------------------------------------
  // Mark AI analysis
  // -----------------------------------------------

  session.status =
    EMERGENCY_STATUS.AI_ANALYSIS;


  session.aiAnalysis = {
    completed: true,

    // TEMPORARY
    // Groq will replace this later
    isGenuine: true,

    confidence: 1,

    category: "MEDICAL_EMERGENCY",

    reason:
      "Temporary simulation approval",
  };


  // -----------------------------------------------
  // Genuine emergency
  // -----------------------------------------------

  if (!session.aiAnalysis.isGenuine) {
    session.status =
      EMERGENCY_STATUS.REJECTED;

    return session;
  }


  // -----------------------------------------------
  // Dispatch
  // -----------------------------------------------

  session.status =
    EMERGENCY_STATUS.DISPATCHED;


  // -----------------------------------------------
  // START SIMULATION
  // -----------------------------------------------

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


  return session;
}


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


  const simulation =
    getSimulation(
      emergencyId
    );


  return {
    ...session,

    simulationState:
      simulation
        ? simulation
        : null,
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


  if (
    hasSimulation(
      emergencyId
    )
  ) {
    stopSimulation(
      emergencyId
    );
  }


  session.status =
    EMERGENCY_STATUS.CANCELLED;


  session.simulation.started =
    false;


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