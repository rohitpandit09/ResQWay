// Backend/src/simulation/simulationSnapshot.js

import {
  getAllControlledSignalSnapshots,
} from "./signalEngine.js";

import {
  getHeading,
} from "./telemetryEngine.js";

import {
  buildTelemetry,
} from "./telemetryEngine.js";


// ==================================================
// ROUND HELPER
// ==================================================

function round(value, decimals = 2) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}


// ==================================================
// BUILD TRAFFIC SNAPSHOT
// ==================================================

function buildTrafficSnapshot(traffic = []) {
  return traffic.map((vehicle) => {
    const heading = getHeading(
      vehicle.currentNode,
      vehicle.nextNode
    );

    return {
      id: vehicle.id,

      currentNode:
        vehicle.currentNode,

      nextNode:
        vehicle.nextNode,

      progress:
        round(
          vehicle.progress || 0,
          4
        ),

      speed:
        round(
          vehicle.speed || 0,
          2
        ),

      heading:
        round(
          heading,
          2
        ),

      position: {
        x:
          round(
            vehicle.position?.x || 0,
            2
          ),

        z:
          round(
            vehicle.position?.z || 0,
            2
          ),
      },

      waitingForSignal:
        vehicle.waitingForSignal,

      active:
        vehicle.active,
    };
  });
}


// ==================================================
// BUILD SIGNAL SNAPSHOT
// ==================================================

function buildSignalSnapshot(
  simulation
) {
  return getAllControlledSignalSnapshots(
  simulation.simulationTime,
  simulation.greenCorridor,
  simulation.signalControllers
);
}


// ==================================================
// BUILD COMPLETE SIMULATION SNAPSHOT
// ==================================================

export function buildSimulationSnapshot(
  emergencyId,
  simulation
) {
  if (!simulation) {
    return null;
  }


  // -----------------------------------------------
  // TELEMETRY
  // -----------------------------------------------

  const telemetry =
    buildTelemetry(
      simulation
    );


  // -----------------------------------------------
  // SIGNALS
  // -----------------------------------------------

  const signals =
    buildSignalSnapshot(
      simulation
    );


  // -----------------------------------------------
  // TRAFFIC
  // -----------------------------------------------

  const traffic =
    buildTrafficSnapshot(
      simulation.traffic
    );


  // -----------------------------------------------
  // AMBULANCE
  // -----------------------------------------------

  const ambulance =
    simulation.ambulance;


  return {
    // ============================================
    // META
    // ============================================

    emergencyId,

    timestamp:
      Date.now(),

    simulationTime:
      round(
        simulation.simulationTime,
        2
      ),

    running:
      simulation.running,

    completed:
      simulation.completed,

    lastEvent:
      simulation.lastEvent,


    // ============================================
    // AMBULANCE
    // ============================================

    ambulance: {
      id:
        ambulance.id,

      driverId:
        ambulance.driverId,

      status:
        ambulance.status,

      currentNode:
        ambulance.currentNode,

      nextNode:
        ambulance.nextNode,

      routeIndex:
        ambulance.routeIndex,

      progress:
        round(
          ambulance.progress || 0,
          4
        ),

      speed:
        round(
          ambulance.speed || 0,
          2
        ),

      targetSpeed:
        round(
          ambulance.targetSpeed || 0,
          2
        ),

      heading:
        round(
          getHeading(
            ambulance.currentNode,
            ambulance.nextNode
          ),
          2
        ),

      position: {
        x:
          round(
            ambulance.position?.x || 0,
            2
          ),

        z:
          round(
            ambulance.position?.z || 0,
            2
          ),

        latitude:
          null,

        longitude:
          null,
      },

      waitingForSignal:
        ambulance.waitingForSignal,

      signalWaitSeconds:
        round(
          ambulance.signalWaitSeconds || 0,
          2
        ),

      passengerOnboard:
        ambulance.passengerOnboard,
    },


    // ============================================
    // TRAFFIC
    // ============================================

    traffic,


    // ============================================
    // SIGNALS
    // ============================================

    signals,


    // ============================================
    // GREEN CORRIDOR
    // ============================================

    greenCorridor: {
      active:
        simulation.greenCorridor?.active ||
        false,

      mode:
        simulation.greenCorridor?.mode ||
        "NORMAL",

      activeSignalId:
        simulation.greenCorridor?.activeSignalId ||
        null,

      updatedAt:
        round(
          simulation.greenCorridor?.updatedAt || 0,
          2
        ),

      signals:
        simulation.greenCorridor?.signals ||
        [],
    },


    // ============================================
    // TELEMETRY
    // ============================================
    //
    // Keep the existing telemetry too.
    // This makes the snapshot backward compatible
    // with our current Socket.IO test.
    // ============================================

    telemetry,
  };
}