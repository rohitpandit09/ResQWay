// Backend/src/simulation/simulationManager.js

import { EventEmitter } from "events";

import {
  createSimulation,
  updateSimulation,
} from "./simulationEngine.js";

import {
  buildTelemetry,
} from "./telemetryEngine.js";

import {
  buildSimulationSnapshot,
} from "./simulationSnapshot.js";


// ==================================================
// CONFIGURATION
// ==================================================

const TICK_INTERVAL_MS = 100;

// Send telemetry/snapshot every 250ms
const TELEMETRY_INTERVAL_MS = 250;


// ==================================================
// EVENTS
// ==================================================

export const simulationEvents =
  new EventEmitter();


// ==================================================
// ACTIVE SIMULATIONS
// ==================================================

const activeSimulations =
  new Map();


// ==================================================
// START SIMULATION
// ==================================================

export function startSimulation(
  emergencyId
) {
  if (
    activeSimulations.has(
      emergencyId
    )
  ) {
    throw new Error(
      `Simulation already exists for ${emergencyId}`
    );
  }


  // -----------------------------------------------
  // Create simulation
  // -----------------------------------------------

  const simulation =
    createSimulation();


  // -----------------------------------------------
  // Simulation metadata
  // -----------------------------------------------

  const simulationData = {
    simulation,

    timer: null,

    startedAt:
      Date.now(),

    lastTickAt:
      Date.now(),

    lastTelemetryAt:
      0,
  };


  // -----------------------------------------------
  // Store simulation
  // -----------------------------------------------

  activeSimulations.set(
    emergencyId,
    simulationData
  );


  // -----------------------------------------------
  // Start simulation loop
  // -----------------------------------------------

  simulationData.timer =
    setInterval(() => {
      updateSimulationTick(
        emergencyId
      );
    }, TICK_INTERVAL_MS);


  console.log(
    `[SIMULATION] Started: ${emergencyId}`
  );


  // -----------------------------------------------
  // Send initial state immediately
  // -----------------------------------------------

  emitSimulationState(
    emergencyId,
    simulation
  );


  return simulation;
}


// ==================================================
// SIMULATION TICK
// ==================================================

function updateSimulationTick(
  emergencyId
) {
  const simulationData =
    activeSimulations.get(
      emergencyId
    );


  if (!simulationData) {
    return;
  }


  // -----------------------------------------------
  // Calculate real elapsed time
  // -----------------------------------------------

  const now =
    Date.now();


  const deltaSeconds =
    (
      now -
      simulationData.lastTickAt
    ) / 1000;


  simulationData.lastTickAt =
    now;


  // -----------------------------------------------
  // UPDATE SIMULATION
  // -----------------------------------------------

  simulationData.simulation =
    updateSimulation(
      simulationData.simulation,
      deltaSeconds
    );


  // -----------------------------------------------
  // TELEMETRY / SNAPSHOT BROADCAST
  // -----------------------------------------------

  if (
    now -
      simulationData.lastTelemetryAt >=
    TELEMETRY_INTERVAL_MS
  ) {
    simulationData.lastTelemetryAt =
      now;


    emitSimulationState(
      emergencyId,
      simulationData.simulation
    );
  }


  // -----------------------------------------------
  // COMPLETION
  // -----------------------------------------------

  if (
    simulationData.simulation.completed
  ) {

    // Send final state
    emitSimulationState(
      emergencyId,
      simulationData.simulation
    );


    console.log(
      `[SIMULATION] Completed: ${emergencyId}`
    );


    stopSimulation(
      emergencyId
    );
  }
}


// ==================================================
// EMIT SIMULATION STATE
// ==================================================
//
// This creates BOTH:
//
// 1. telemetry
// 2. complete simulation snapshot
//
// and sends them through simulationEvents.
//
// Socket.IO listens to this event and broadcasts
// it to the emergency room.
// ==================================================

function emitSimulationState(
  emergencyId,
  simulation
) {
  // -----------------------------------------------
  // Build telemetry
  // -----------------------------------------------

  const telemetry =
    buildTelemetry(
      simulation
    );


  // -----------------------------------------------
  // Build complete simulation snapshot
  // -----------------------------------------------

  const snapshot =
    buildSimulationSnapshot(
      emergencyId,
      simulation
    );


  // -----------------------------------------------
  // Emit event
  // -----------------------------------------------

  simulationEvents.emit(
    "simulation:state",
    {
      emergencyId,

      telemetry,

      snapshot,
    }
  );
}


// ==================================================
// GET SIMULATION
// ==================================================

export function getSimulation(
  emergencyId
) {
  const simulationData =
    activeSimulations.get(
      emergencyId
    );


  if (!simulationData) {
    return null;
  }


  return simulationData.simulation;
}


// ==================================================
// GET FULL SIMULATION DATA
// ==================================================

export function getSimulationData(
  emergencyId
) {
  const simulationData =
    activeSimulations.get(
      emergencyId
    );


  if (!simulationData) {
    return null;
  }


  return {
    simulation:
      simulationData.simulation,

    startedAt:
      simulationData.startedAt,

    running:
      simulationData.simulation.running,

    completed:
      simulationData.simulation.completed,
  };
}


// ==================================================
// STOP SIMULATION
// ==================================================

export function stopSimulation(
  emergencyId
) {
  const simulationData =
    activeSimulations.get(
      emergencyId
    );


  if (!simulationData) {
    return false;
  }


  // -----------------------------------------------
  // Stop interval
  // -----------------------------------------------

  if (
    simulationData.timer
  ) {
    clearInterval(
      simulationData.timer
    );
  }


  // -----------------------------------------------
  // Remove simulation
  // -----------------------------------------------

  activeSimulations.delete(
    emergencyId
  );


  console.log(
    `[SIMULATION] Stopped: ${emergencyId}`
  );


  return true;
}


// ==================================================
// GET ACTIVE SIMULATIONS
// ==================================================

export function getActiveSimulations() {
  return Array.from(
    activeSimulations.keys()
  );
}


// ==================================================
// CHECK SIMULATION
// ==================================================

export function hasSimulation(
  emergencyId
) {
  return activeSimulations.has(
    emergencyId
  );
}