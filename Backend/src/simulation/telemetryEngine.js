// Backend/src/simulation/telemetryEngine.js

import {
  ROAD_NODES,
  getDistanceBetweenNodes,
  getNodePosition,
  CLIENT_NODE,
  HOSPITAL_NODE,
} from "./roadNetwork.js";

import {
  getControlledSignalSnapshot,
  getMovementSignalState,
} from "./signalEngine.js";


// ==================================================
// CONFIGURATION
// ==================================================

const DEFAULT_ETA_SPEED = 8;


// ==================================================
// HELPERS
// ==================================================

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}


function round(value, decimals = 2) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor =
    10 ** decimals;

  return (
    Math.round(
      value * factor
    ) / factor
  );
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
// DISTANCE TO DESTINATION
// ==================================================

export function getDistanceToDestination(
  ambulance,
  destinationNode
) {
  if (
    !ambulance ||
    !destinationNode
  ) {
    return 0;
  }

  const route =
    ambulance.route;

  const routeIndex =
    ambulance.routeIndex;

  if (
    !Array.isArray(route) ||
    route.length === 0
  ) {
    return 0;
  }

  // -----------------------------------------------
  // Already at destination
  // -----------------------------------------------

  if (
    ambulance.currentNode ===
    destinationNode
  ) {
    return 0;
  }

  // -----------------------------------------------
  // Find destination in current route
  // -----------------------------------------------

  const destinationIndex =
    route.indexOf(
      destinationNode
    );

  if (
    destinationIndex === -1
  ) {
    return 0;
  }

  // -----------------------------------------------
  // Destination already behind ambulance
  // -----------------------------------------------

  if (
    destinationIndex <
    routeIndex
  ) {
    return 0;
  }

  let totalDistance = 0;

  // -----------------------------------------------
  // Remaining current road segment
  // -----------------------------------------------

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

    const remainingCurrentSegment =
      currentSegmentDistance *
      remainingProgress;

    totalDistance +=
      remainingCurrentSegment;

    // ---------------------------------------------
    // IMPORTANT:
    // If nextNode IS the destination, stop here.
    // Do not add any future route segments.
    // ---------------------------------------------

    if (
      ambulance.nextNode ===
      destinationNode
    ) {
      return Math.max(
        0,
        totalDistance
      );
    }
  }

  // -----------------------------------------------
  // Remaining route segments after nextNode
  // -----------------------------------------------

  const firstRemainingSegmentIndex =
    routeIndex + 1;

  for (
    let i =
      firstRemainingSegmentIndex;

    i < destinationIndex;

    i++
  ) {
    const fromNode =
      route[i];

    const toNode =
      route[i + 1];

    if (
      !fromNode ||
      !toNode
    ) {
      continue;
    }

    totalDistance +=
      getDistanceBetweenNodes(
        fromNode,
        toNode
      );
  }

  return Math.max(
    0,
    totalDistance
  );
}


// ==================================================
// ETA
// ==================================================

export function getETA(
  distance,
  speed
) {
  if (
    !Number.isFinite(distance) ||
    distance <= 0
  ) {
    return 0;
  }

  const safeSpeed =
    getSafeSpeed(speed);

  return (
    distance /
    safeSpeed
  );
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
    getNodePosition(
      currentNode
    );

  const to =
    getNodePosition(
      nextNode
    );

  if (
    !from ||
    !to
  ) {
    return 0;
  }

  const dx =
    to.x -
    from.x;

  const dz =
    to.z -
    from.z;

  let degrees =
    Math.atan2(
      dz,
      dx
    ) *
    (180 / Math.PI);

  if (
    degrees < 0
  ) {
    degrees += 360;
  }

  return degrees;
}


// ==================================================
// CURRENT CONTROLLED SIGNAL
// ==================================================

export function getCurrentSignalTelemetry(
  ambulance,
  simulationTime,
  corridorState,
  signalControllers = null
) {
  if (
    !ambulance ||
    !ambulance.nextNode
  ) {
    return null;
  }

  const signal =
    getControlledSignalSnapshot(
      ambulance.nextNode,
      simulationTime,
      corridorState,
      signalControllers
    );

  if (!signal) {
    return null;
  }

  const movementState =
    getMovementSignalState(
      ambulance.nextNode,
      ambulance.currentNode,
      ambulance.nextNode,
      simulationTime,
      corridorState,
      signalControllers
    );

  return {
    id:
      signal.signalId,

    nodeId:
      signal.nodeId,

    controller:
      signal.controller,

    state:
      movementState,

    phase:
      signal.phase,

    horizontal:
      signal.horizontal,

    vertical:
      signal.vertical,

    remainingSeconds:
      round(
        signal.remainingSeconds,
        1
      ),

    cycleSeconds:
      signal.cycleSeconds ??
      42,

    mode:
      signal.mode,

    priority:
      signal.priority,

    priorityDirection:
      signal.priorityDirection,

    priorityRemainingSeconds:
      round(
        signal.priorityRemainingSeconds || 0,
        1
      ),

    clearingRemainingSeconds:
      round(
        signal.clearingRemainingSeconds || 0,
        1
      ),

    lastAction:
      signal.lastAction ||
      null,
  };
}


// ==================================================
// UPCOMING SIGNALS
// ==================================================

export function getUpcomingSignals(
  ambulance,
  simulationTime,
  corridorState,
  signalControllers = null,
  count = 4
) {
  if (
    !ambulance ||
    !Array.isArray(
      ambulance.route
    )
  ) {
    return [];
  }

  const results = [];

  let accumulatedDistance = 0;

  // -----------------------------------------------
  // Remaining current road segment
  // -----------------------------------------------

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

  // -----------------------------------------------
  // Upcoming route signals
  // -----------------------------------------------

  for (
    let i =
      ambulance.routeIndex + 1;

    i <
      ambulance.route.length &&
    results.length <
      count;

    i++
  ) {
    const nodeId =
      ambulance.route[i];

    const node =
      ROAD_NODES[nodeId];

    if (!node) {
      continue;
    }

    const fromNode =
      ambulance.route[
        i - 1
      ];

    const toNode =
      nodeId;

    // ---------------------------------------------
    // Get ACTUAL controlled signal
    // ---------------------------------------------

    const signal =
      getControlledSignalSnapshot(
        nodeId,
        simulationTime,
        corridorState,
        signalControllers
      );

    if (!signal) {
      continue;
    }

    // ---------------------------------------------
    // Get actual movement state
    // ---------------------------------------------

    const movementState =
      getMovementSignalState(
        nodeId,
        fromNode,
        toNode,
        simulationTime,
        corridorState,
        signalControllers
      );

    // ---------------------------------------------
    // ETA to signal
    // ---------------------------------------------

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

      horizontal:
        signal.horizontal,

      vertical:
        signal.vertical,

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

      cycleSeconds:
        signal.cycleSeconds ??
        42,

      mode:
        signal.mode,

      priority:
        signal.priority,

      priorityDirection:
        signal.priorityDirection,

      priorityRemainingSeconds:
        round(
          signal.priorityRemainingSeconds || 0,
          1
        ),

      clearingRemainingSeconds:
        round(
          signal.clearingRemainingSeconds || 0,
          1
        ),

      lastAction:
        signal.lastAction ||
        null,
    });

    // ---------------------------------------------
    // Add distance to next segment
    // ---------------------------------------------

    if (
      i <
      ambulance.route.length - 1
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
    Number.isFinite(
      ambulance.speed
    )
      ? ambulance.speed
      : 0;


  // =================================================
  // DISTANCES
  // =================================================

  let distanceToClient = 0;

  let distanceToHospital = 0;


  // -----------------------------------------------
  // Going to user
  // -----------------------------------------------

  if (
    ambulance.status ===
    "EN_ROUTE_TO_USER"
  ) {
    distanceToClient =
      getDistanceToDestination(
        ambulance,
        CLIENT_NODE
      );

    distanceToHospital =
      getDistanceToDestination(
        ambulance,
        HOSPITAL_NODE
      );
  }


  // -----------------------------------------------
  // At user / pickup
  // -----------------------------------------------

  else if (
    ambulance.status ===
      "ARRIVED_AT_USER" ||

    ambulance.status ===
      "PATIENT_PICKUP"
  ) {
    distanceToClient = 0;

    distanceToHospital =
      getDistanceToDestination(
        ambulance,
        HOSPITAL_NODE
      );
  }


  // -----------------------------------------------
  // Going to hospital
  // -----------------------------------------------

  else if (
    ambulance.status ===
    "EN_ROUTE_TO_HOSPITAL"
  ) {
    distanceToClient = 0;

    distanceToHospital =
      getDistanceToDestination(
        ambulance,
        HOSPITAL_NODE
      );
  }


  // -----------------------------------------------
  // Hospital arrival / complete
  // -----------------------------------------------

  else if (
    ambulance.status ===
      "ARRIVED_AT_HOSPITAL" ||

    ambulance.status ===
      "COMPLETED"
  ) {
    distanceToClient = 0;

    distanceToHospital = 0;
  }


  // =================================================
  // ETA
  // =================================================

  const etaToClient =
    ambulance.status ===
      "EN_ROUTE_TO_USER"

      ? getETA(
          distanceToClient,
          speed
        )

      : 0;


  const etaToHospital =
    getETA(
      distanceToHospital,
      speed
    );


  // =================================================
  // HEADING
  // =================================================

  const heading =
    getHeading(
      ambulance.currentNode,
      ambulance.nextNode
    );


  // =================================================
  // CURRENT SIGNAL
  // =================================================

  const currentSignal =
    getCurrentSignalTelemetry(
      ambulance,
      simulation.simulationTime,
      simulation.greenCorridor,
      simulation.signalControllers
    );


  // =================================================
  // UPCOMING SIGNALS
  // =================================================

  const upcomingSignals =
    getUpcomingSignals(
      ambulance,
      simulation.simulationTime,
      simulation.greenCorridor,
      simulation.signalControllers
    );


  // =================================================
  // DESTINATION
  // =================================================

  let destination =
    CLIENT_NODE;

  if (
    ambulance.status ===
      "EN_ROUTE_TO_HOSPITAL" ||

    ambulance.status ===
      "ARRIVED_AT_HOSPITAL" ||

    ambulance.status ===
      "COMPLETED"
  ) {
    destination =
      HOSPITAL_NODE;
  }


  // =================================================
  // ROUTE PROGRESS
  // =================================================

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


  // =================================================
  // JOURNEY STATUS
  // =================================================

  let journeyStatus =
    ambulance.status;

  if (
    ambulance.waitingForSignal
  ) {
    journeyStatus =
      "WAITING_AT_SIGNAL";
  }


  // =================================================
  // FINAL TELEMETRY
  // =================================================

  return {

    // ==============================================
    // TIME
    // ==============================================

    timestamp:
      Date.now(),

    simulationTime:
      round(
        simulation.simulationTime,
        2
      ),


    // ==============================================
    // SIMULATION
    // ==============================================

    running:
      simulation.running,

    completed:
      simulation.completed,

    lastEvent:
      simulation.lastEvent,


    // ==============================================
    // AMBULANCE
    // ==============================================

    ambulance: {
      id:
        ambulance.id,

      driverId:
        ambulance.driverId,

      status:
        ambulance.status,

      journeyStatus:
        journeyStatus,

      currentNode:
        ambulance.currentNode,

      nextNode:
        ambulance.nextNode,

      destination:
        destination,

      speed:
        round(
          speed,
          2
        ),

      targetSpeed:
        round(
          ambulance.targetSpeed || 0,
          2
        ),

      heading:
        round(
          heading,
          2
        ),

      progress:
        round(
          clamp(
            routeProgress,
            0,
            1
          ),
          4
        ),


      // -------------------------------------------
      // POSITION
      // -------------------------------------------

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

        // Reserved for future geographic GPS
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


    // ==============================================
    // JOURNEY
    // ==============================================

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


    // ==============================================
    // SIGNALS
    // ==============================================

    signals: {
      current:
        currentSignal,

      upcoming:
        upcomingSignals,
    },


    // ==============================================
    // GREEN CORRIDOR
    // ==============================================

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
  };
}