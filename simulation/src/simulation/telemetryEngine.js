import {
  ROAD_NODES,
  CLIENT_NODE,
  HOSPITAL_NODE,
} from "./roadNetwork";

/* =========================================
   DISTANCE
========================================= */

function distance2D(a, b) {
  const dx =
    b[0] - a[0];

  const dz =
    b[2] - a[2];

  return Math.sqrt(
    dx * dx +
      dz * dz
  );
}

/* =========================================
   ROUTE DISTANCE
========================================= */

function getDistanceAlongRouteToNode(
  simulation,
  targetNodeId
) {
  const ambulance =
    simulation.ambulance;

  const route =
    ambulance.route;

  const routeIndex =
    ambulance.routeIndex;

  if (
    !route ||
    route.length === 0
  ) {
    return null;
  }

  const targetIndex =
    route.indexOf(
      targetNodeId
    );

  if (
    targetIndex === -1 ||
    targetIndex < routeIndex
  ) {
    return null;
  }

  if (
    targetIndex === routeIndex
  ) {
    return 0;
  }

  let distance = 0;

  const currentNode =
    ROAD_NODES[
      route[routeIndex]
    ];

  if (!currentNode) {
    return null;
  }

  /* ---------------------------------------
     Remaining current segment
  --------------------------------------- */

  if (
    routeIndex <
    targetIndex
  ) {
    const nextNode =
      ROAD_NODES[
        route[
          routeIndex + 1
        ]
      ];

    if (nextNode) {
      const segmentDistance =
        distance2D(
          currentNode.position,
          nextNode.position
        );

      distance +=
        segmentDistance *
        (1 - ambulance.progress);
    }
  }

  /* ---------------------------------------
     Remaining full segments
  --------------------------------------- */

  for (
    let i = routeIndex + 1;
    i < targetIndex;
    i++
  ) {
    const from =
      ROAD_NODES[
        route[i]
      ];

    const to =
      ROAD_NODES[
        route[i + 1]
      ];

    if (from && to) {
      distance += distance2D(
        from.position,
        to.position
      );
    }
  }

  return distance;
}

/* =========================================
   ETA
========================================= */

function calculateETA(
  distance,
  speed,
  fallbackSpeed,
  additionalDelay = 0
) {
  if (
    distance === null ||
    distance === undefined
  ) {
    return null;
  }

  if (distance <= 0) {
    return 0;
  }

  const usableSpeed =
    speed > 0
      ? speed
      : fallbackSpeed;

  if (
    !usableSpeed ||
    usableSpeed <= 0
  ) {
    return null;
  }

  const travelTime =
    distance / usableSpeed;

  return (
    travelTime +
    Math.max(
      0,
      additionalDelay
    )
  );
}

/* =========================================
   JOURNEY STATUS
========================================= */

function getJourneyStatus(
  ambulance
) {
  switch (
    ambulance.state
  ) {
    case "EN_ROUTE_TO_CLIENT":
      return "EN_ROUTE_TO_CLIENT";

    case "PICKUP":
      return "PATIENT_PICKUP";

    case "EN_ROUTE_TO_HOSPITAL":
      return "EN_ROUTE_TO_HOSPITAL";

    case "COMPLETED":
      return "COMPLETED";

    default:
      return ambulance.state;
  }
}

/* =========================================
   TELEMETRY
========================================= */

export function buildTelemetry(
  simulation
) {
  const ambulance =
    simulation.ambulance;

  const client =
    ROAD_NODES[CLIENT_NODE];

  const hospital =
    ROAD_NODES[HOSPITAL_NODE];

  /* ---------------------------------------
     SPEED
  --------------------------------------- */

  const speed =
    ambulance.speed || 0;

  const fallbackSpeed =
    ambulance.lastMovingSpeed ||
    DEFAULT_ETA_SPEED_SAFE();

  /* ---------------------------------------
     SIGNAL WAITING DELAY
  --------------------------------------- */

  const signalDelay =
    ambulance.signalWaitSeconds ||
    0;

  /* ---------------------------------------
     CLIENT
  --------------------------------------- */

  const distanceToClient =
    getDistanceAlongRouteToNode(
      simulation,
      CLIENT_NODE
    );

  const etaToClient =
    calculateETA(
      distanceToClient,
      speed,
      fallbackSpeed,
      signalDelay
    );

  /* ---------------------------------------
     HOSPITAL
  --------------------------------------- */

  const distanceToHospital =
    getDistanceAlongRouteToNode(
      simulation,
      HOSPITAL_NODE
    );

  const etaToHospital =
    calculateETA(
      distanceToHospital,
      speed,
      fallbackSpeed,
      signalDelay
    );

  /* ---------------------------------------
     UPCOMING SIGNALS
  --------------------------------------- */

  const upcomingSignals = [];

  const route =
    ambulance.route;

  const routeIndex =
    ambulance.routeIndex;

  for (
    let i = routeIndex;
    i < route.length;
    i++
  ) {
    const nodeId =
      route[i];

    const node =
      ROAD_NODES[nodeId];

    if (!node) {
      continue;
    }

    const distance =
      getDistanceAlongRouteToNode(
        simulation,
        nodeId
      );

    if (
      distance === null ||
      distance <= 0
    ) {
      continue;
    }

    const etaSeconds =
      calculateETA(
        distance,
        speed,
        fallbackSpeed,
        signalDelay
      );

    upcomingSignals.push({
      signalId:
        node.signal.id,

      nodeId,

      controller:
        node.signal.controller,

      distance,

      etaSeconds,
    });
  }

  upcomingSignals.sort(
    (a, b) =>
      a.distance -
      b.distance
  );

  /* ---------------------------------------
     RETURN
  --------------------------------------- */

  return {
    simulationTime:
      simulation.elapsedTime,

    ambulance: {
      id: ambulance.id,

      state:
        ambulance.state,

      currentNode:
        ambulance.currentNode,

      nextNode:
        ambulance.nextNode,

      speed,

      lastMovingSpeed:
        fallbackSpeed,

      signalWaitSeconds:
        signalDelay,

      position:
        ambulance.position,

      routeIndex:
        ambulance.routeIndex,

      progress:
        ambulance.progress,

      waitingForSignal:
        ambulance.waitingForSignal,

      signalState:
        ambulance.signalState,
    },

    client: {
      node:
        CLIENT_NODE,

      position:
        client?.position || null,

      distance:
        distanceToClient,

      etaSeconds:
        etaToClient,
    },

    hospital: {
      node:
        HOSPITAL_NODE,

      position:
        hospital?.position || null,

      distance:
        distanceToHospital,

      etaSeconds:
        etaToHospital,
    },

    upcomingSignals,

    journeyStatus:
      getJourneyStatus(
        ambulance
      ),
  };
}

/*
 * Safe default fallback speed.
 *
 * Kept as a function to make it obvious
 * that telemetry never depends on an
 * undefined speed value.
 */
function DEFAULT_ETA_SPEED_SAFE() {
  return 8;
}