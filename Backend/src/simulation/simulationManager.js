// Backend/src/simulation/simulationManager.js

import { EventEmitter } from "events";

import {
  createSimulation,
  updateSimulation,
} from "./simulationEngine.js";

import {
  buildTelemetry,
} from "./telemetryEngine.js";


// ==================================================
// CONFIGURATION
// ==================================================

const TICK_INTERVAL_MS = 100;

// Send telemetry every 250ms
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


  const simulation =
    createSimulation();


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


  activeSimulations.set(
    emergencyId,
    simulationData
  );


  simulationData.timer =
    setInterval(() => {
      updateSimulationTick(
        emergencyId
      );
    }, TICK_INTERVAL_MS);


  console.log(
    `[SIMULATION] Started: ${emergencyId}`
  );


  // Send initial state immediately
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


  const now =
    Date.now();


  const deltaSeconds =
    (now -
      simulationData.lastTickAt) /
    1000;


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
  // TELEMETRY BROADCAST TIMER
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
    // Make sure final state is sent
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

function emitSimulationState(
  emergencyId,
  simulation
) {
  const telemetry =
    buildTelemetry(
      simulation
    );


  simulationEvents.emit(
    "simulation:state",
    {
      emergencyId,

      telemetry,
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


  if (
    simulationData.timer
  ) {
    clearInterval(
      simulationData.timer
    );
  }


  activeSimulations.delete(
    emergencyId
  );


  console.log(
    `[SIMULATION] Stopped: ${emergencyId}`
  );


  return true;
}


// ==================================================
// ACTIVE SIMULATIONS
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