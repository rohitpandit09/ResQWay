// Backend/src/simulation/telemetryEngine.js

import {
  ROAD_NODES,
  getDistanceBetweenNodes,
  getNodePosition,
  CLIENT_NODE,
  HOSPITAL_NODE,
} from "./roadNetwork.js";

import {
  getSignalSnapshot,
  getMovementSignalState,
} from "./signalEngine.js";


// ==================================================
// CONFIGURATION
// ==================================================

const DEFAULT_ETA_SPEED = 8;


// ==================================================
// BASIC HELPERS
// ==================================================

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


function round(value, decimals = 2) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}


function getSafeSpeed(speed) {
  if (
    Number.isFinite(speed) &&
    speed > 0
  ) {
    return speed;
  }

  return DEFAULT_ETA_SPEED;
}


// ==================================================
// DISTANCE FROM CURRENT AMBULANCE POSITION
// TO DESTINATION NODE
// ==================================================

export function getDistanceToDestination(
  ambulance,
  destinationNode
) {
  if (!ambulance || !destinationNode) {
    return 0;
  }

  const route = ambulance.route;

  const routeIndex =
    ambulance.routeIndex;

  if (
    !Array.isArray(route) ||
    route.length === 0
  ) {
    return 0;
  }


  let totalDistance = 0;


  // ------------------------------------------------
  // Distance remaining on current road segment
  // ------------------------------------------------

  if (
    ambulance.currentNode &&
    ambulance.nextNode
  ) {
    const currentSegmentDistance =
      getDistanceBetweenNodes(
        ambulance.currentNode,
        ambulance.nextNode
      );

    const remainingProgress =
      1 -
      clamp(
        ambulance.progress || 0,
        0,
        1
      );

    totalDistance +=
      currentSegmentDistance *
      remainingProgress;
  }


  // ------------------------------------------------
  // Remaining route segments
  // ------------------------------------------------

  for (
    let i = routeIndex + 1;
    i < route.length - 1;
    i++
  ) {
    totalDistance +=
      getDistanceBetweenNodes(
        route[i],
        route[i + 1]
      );

    if (
      route[i + 1] === destinationNode
    ) {
      break;
    }
  }


  return totalDistance;
}


// ==================================================
// GET ETA TO DESTINATION
// ==================================================

export function getETA(
  distance,
  speed
) {
  const safeSpeed =
    getSafeSpeed(speed);

  if (distance <= 0) {
    return 0;
  }

  return distance / safeSpeed;
}


// ==================================================
// HEADING
// ==================================================

export function getHeading(
  currentNode,
  nextNode
) {
  if (
    !currentNode ||
    !nextNode
  ) {
    return 0;
  }

  const from =
    getNodePosition(currentNode);

  const to =
    getNodePosition(nextNode);

  if (!from || !to) {
    return 0;
  }

  const dx =
    to.x - from.x;

  const dz =
    to.z - from.z;

  const radians =
    Math.atan2(dz, dx);

  let degrees =
    radians * (180 / Math.PI);

  if (degrees < 0) {
    degrees += 360;
  }

  return degrees;
}


// ==================================================
// GET CURRENT SIGNAL
// ==================================================

export function getCurrentSignalTelemetry(
  ambulance,
  simulationTime
) {
  if (
    !ambulance ||
    !ambulance.nextNode
  ) {
    return null;
  }


  const signal =
    getSignalSnapshot(
      ambulance.nextNode,
      simulationTime
    );

  if (!signal) {
    return null;
  }


  const movementState =
    getMovementSignalState(
      ambulance.nextNode,
      ambulance.currentNode,
      ambulance.nextNode,
      simulationTime
    );


  return {
    id: signal.signalId,

    nodeId: signal.nodeId,

    controller:
      signal.controller,

    state:
      movementState,

    phase:
      signal.phase,

    remainingSeconds:
      round(
        signal.remainingSeconds,
        1
      ),

    cycleSeconds:
      signal.cycleSeconds,

    mode:
      signal.mode,
  };
}


// ==================================================
// UPCOMING SIGNALS
// ==================================================

export function getUpcomingSignals(
  ambulance,
  simulationTime,
  count = 4
) {
  if (
    !ambulance ||
    !Array.isArray(ambulance.route)
  ) {
    return [];
  }


  const results = [];

  let accumulatedDistance = 0;


  // ------------------------------------------------
  // Current segment remaining distance
  // ------------------------------------------------

  if (
    ambulance.currentNode &&
    ambulance.nextNode
  ) {
    const segmentDistance =
      getDistanceBetweenNodes(
        ambulance.currentNode,
        ambulance.nextNode
      );

    const remainingProgress =
      1 -
      clamp(
        ambulance.progress || 0,
        0,
        1
      );

    accumulatedDistance +=
      segmentDistance *
      remainingProgress;
  }


  const safeSpeed =
    getSafeSpeed(
      ambulance.speed
    );


  // ------------------------------------------------
  // Starting from next intersection
  // ------------------------------------------------

  for (
    let i = ambulance.routeIndex + 1;

    i < ambulance.route.length &&
    results.length < count;

    i++
  ) {
    const nodeId =
      ambulance.route[i];

    const node =
      ROAD_NODES[nodeId];

    if (!node) {
      continue;
    }


    const signal =
      getSignalSnapshot(
        nodeId,
        simulationTime
      );


    const fromNode =
      ambulance.route[i - 1];

    const toNode =
      nodeId;


    const movementState =
      getMovementSignalState(
        nodeId,
        fromNode,
        toNode,
        simulationTime
      );


    const etaSeconds =
      accumulatedDistance /
      safeSpeed;


    results.push({
      id:
        signal.signalId,

      nodeId,

      controller:
        signal.controller,

      state:
        movementState,

      phase:
        signal.phase,

      remainingSeconds:
        round(
          signal.remainingSeconds,
          1
        ),

      etaSeconds:
        round(
          etaSeconds,
          1
        ),

      mode:
        signal.mode,
    });


    if (
      i < ambulance.route.length - 1
    ) {
      accumulatedDistance +=
        getDistanceBetweenNodes(
          ambulance.route[i],
          ambulance.route[i + 1]
        );
    }
  }


  return results;
}


// ==================================================
// BUILD COMPLETE TELEMETRY
// ==================================================

export function buildTelemetry(
  simulation
) {
  if (
    !simulation ||
    !simulation.ambulance
  ) {
    return null;
  }


  const ambulance =
    simulation.ambulance;


  const speed =
    Number.isFinite(ambulance.speed)
      ? ambulance.speed
      : 0;


  const distanceToClient =
    ambulance.status === "EN_ROUTE_TO_HOSPITAL" ||
    ambulance.status === "ARRIVED_AT_USER" ||
    ambulance.status === "COMPLETED"
        ? 0
        : getDistanceToDestination(
            ambulance,
            CLIENT_NODE
        );


  const distanceToHospital =
    getDistanceToDestination(
      ambulance,
      HOSPITAL_NODE
    );


  const etaToClient =
    ambulance.passengerOnboard
      ? 0
      : getETA(
          distanceToClient,
          speed
        );


  const etaToHospital =
    getETA(
      distanceToHospital,
      speed
    );


  const heading =
    getHeading(
      ambulance.currentNode,
      ambulance.nextNode
    );


  const currentSignal =
    getCurrentSignalTelemetry(
      ambulance,
      simulation.simulationTime
    );


  const upcomingSignals =
    getUpcomingSignals(
      ambulance,
      simulation.simulationTime
    );


  // ------------------------------------------------
  // Determine destination
  // ------------------------------------------------

  const destination =
    ambulance.status ===
    "EN_ROUTE_TO_HOSPITAL"

      ? HOSPITAL_NODE

      : CLIENT_NODE;


  // ------------------------------------------------
  // Determine route completion percentage
  // ------------------------------------------------

  const totalSegments =
    Math.max(
      1,
      ambulance.route.length - 1
    );


  const routeProgress =
    (
      ambulance.routeIndex +
      clamp(
        ambulance.progress || 0,
        0,
        1
      )
    ) /
    totalSegments;


  return {
    // ---------------------------------------------
    // TIME
    // ---------------------------------------------

    timestamp:
      Date.now(),

    simulationTime:
      round(
        simulation.simulationTime,
        2
      ),


    // ---------------------------------------------
    // SIMULATION
    // ---------------------------------------------

    running:
      simulation.running,

    completed:
      simulation.completed,

    lastEvent:
      simulation.lastEvent,


    // ---------------------------------------------
    // AMBULANCE
    // ---------------------------------------------

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

      destination,

      speed:
        round(speed, 2),

      targetSpeed:
        round(
          ambulance.targetSpeed || 0,
          2
        ),

      heading:
        round(heading, 2),

      progress:
        round(
          clamp(
            routeProgress,
            0,
            1
          ),
          4
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


    // ---------------------------------------------
    // DISTANCE + ETA
    // ---------------------------------------------

    journey: {
      distanceToClient:
        round(
          distanceToClient,
          2
        ),

      etaToClient:
        round(
          etaToClient,
          2
        ),

      distanceToHospital:
        round(
          distanceToHospital,
          2
        ),

      etaToHospital:
        round(
          etaToHospital,
          2
        ),

      routeProgress:
        round(
          clamp(
            routeProgress,
            0,
            1
          ),
          4
        ),
    },


    // ---------------------------------------------
    // SIGNALS
    // ---------------------------------------------

    signals: {
      current:
        currentSignal,

      upcoming:
        upcomingSignals,
    },
  };
}