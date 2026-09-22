import {
  FULL_EMERGENCY_ROUTE,
  CLIENT_NODE,
  HOSPITAL_NODE,
  getNode,
} from "./roadNetwork";

import {
  canVehicleProceed,
  getMovementSignalState,
} from "./signalEngine";

const AMBULANCE_MIN_SPEED = 6;
const AMBULANCE_MAX_SPEED = 12;
const AMBULANCE_INITIAL_SPEED = 8;
const AMBULANCE_ACCELERATION = 3.5;

const NORMAL_CAR_SPEED = 5.5;

const PICKUP_DURATION = 2.5;

const STOP_DISTANCE = 3;

const DEFAULT_ETA_SPEED =
  AMBULANCE_INITIAL_SPEED;

/* =========================================
   HELPERS
========================================= */

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function getAmbulanceTargetSpeed(
  simulationTime,
  routeIndex
) {
  const wave1 = Math.sin(
    simulationTime * 0.45 +
      routeIndex * 1.3
  );

  const wave2 = Math.sin(
    simulationTime * 0.9 +
      routeIndex * 0.7
  );

  const target =
    8.5 +
    wave1 * 2.2 +
    wave2 * 0.8;

  return clamp(
    target,
    AMBULANCE_MIN_SPEED,
    AMBULANCE_MAX_SPEED
  );
}

function updateAmbulanceSpeed(
  ambulance,
  deltaSeconds,
  simulationTime
) {
  const targetSpeed =
    getAmbulanceTargetSpeed(
      simulationTime,
      ambulance.routeIndex
    );

  const maxChange =
    AMBULANCE_ACCELERATION *
    deltaSeconds;

  const difference =
    targetSpeed -
    ambulance.speed;

  if (
    Math.abs(difference) <=
    maxChange
  ) {
    ambulance.speed =
      targetSpeed;
  } else {
    ambulance.speed +=
      Math.sign(difference) *
      maxChange;
  }

  ambulance.speed = clamp(
    ambulance.speed,
    AMBULANCE_MIN_SPEED,
    AMBULANCE_MAX_SPEED
  );
}

function distanceBetween(a, b) {
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];

  return Math.sqrt(
    dx * dx +
      dz * dz
  );
}

function interpolate(
  a,
  b,
  progress,
  laneOffset = 0
) {
  const x =
    a[0] +
    (b[0] - a[0]) *
      progress;

  const z =
    a[2] +
    (b[2] - a[2]) *
      progress;

  const dx =
    b[0] - a[0];

  const dz =
    b[2] - a[2];

  const length =
    Math.sqrt(
      dx * dx +
        dz * dz
    );

  if (length === 0) {
    return [x, 0.5, z];
  }

  const perpendicularX =
    -dz / length;

  const perpendicularZ =
    dx / length;

  return [
    x +
      perpendicularX *
        laneOffset,

    0.5,

    z +
      perpendicularZ *
        laneOffset,
  ];
}

function getInitialPosition(
  route,
  routeIndex,
  progress
) {
  const current =
    getNode(
      route[routeIndex]
    );

  if (!current) {
    return [0, 0.5, 0];
  }

  if (
    routeIndex >=
    route.length - 1
  ) {
    return [
      current.position[0],
      0.5,
      current.position[2],
    ];
  }

  const next =
    getNode(
      route[
        routeIndex + 1
      ]
    );

  if (!next) {
    return [
      current.position[0],
      0.5,
      current.position[2],
    ];
  }

  return interpolate(
    current.position,
    next.position,
    progress
  );
}

/* =========================================
   AMBULANCE
========================================= */

export function createAmbulanceState() {
  const route =
    FULL_EMERGENCY_ROUTE;

  const startNode =
    route[0];

  return {
    id: "AMBULANCE_01",

    state:
      "EN_ROUTE_TO_CLIENT",

    route,

    routeIndex: 0,

    currentNode:
      startNode,

    nextNode:
      route[1],

    progress: 0,

    speed:
      AMBULANCE_INITIAL_SPEED,

    position:
      getInitialPosition(
        route,
        0,
        0
      ),

    distanceTravelled: 0,

    pickupTimer: 0,

    waitingForSignal: null,

    signalState: null,

    signalWaitSeconds: 0,

    lastMovingSpeed:
      DEFAULT_ETA_SPEED,

    completed: false,
  };
}

/* =========================================
   NORMAL TRAFFIC
========================================= */

function createTrafficVehicle(
  id,
  route,
  routeIndex,
  progress
) {
  return {
    id,

    route,

    routeIndex,

    progress,

    speed:
      NORMAL_CAR_SPEED,

    currentNode:
      route[routeIndex],

    nextNode:
      route[
        routeIndex + 1
      ] || null,

    position:
      getInitialPosition(
        route,
        routeIndex,
        progress
      ),

    waitingForSignal: null,

    signalState: null,
  };
}

export function createTrafficVehicles() {
  return [
    createTrafficVehicle(
      "CAR_01",
      ["A4", "A3", "A2", "A1"],
      0,
      0.2
    ),

    createTrafficVehicle(
      "CAR_02",
      ["D1", "D2", "D3", "D4"],
      0,
      0.5
    ),

    createTrafficVehicle(
      "CAR_03",
      ["A1", "B1", "C1", "D1"],
      1,
      0.25
    ),

    createTrafficVehicle(
      "CAR_04",
      ["A4", "B4", "C4", "D4"],
      1,
      0.7
    ),

    createTrafficVehicle(
      "CAR_05",
      ["C1", "C2", "C3", "C4"],
      0,
      0.2
    ),

    createTrafficVehicle(
      "CAR_06",
      ["D4", "C4", "B4", "A4"],
      1,
      0.45
    ),

    createTrafficVehicle(
      "CAR_07",
      ["A2", "B2", "C2", "D2"],
      0,
      0.65
    ),

    createTrafficVehicle(
      "CAR_08",
      ["D3", "C3", "B3", "A3"],
      2,
      0.25
    ),
  ];
}

/* =========================================
   VEHICLE MOVEMENT
========================================= */

function moveVehicle(
  vehicle,
  deltaSeconds,
  simulationTime
) {
  vehicle.waitingForSignal =
    null;

  vehicle.signalState = null;

  let remainingDistance =
    vehicle.speed *
    deltaSeconds;

  while (
    remainingDistance > 0 &&
    vehicle.routeIndex <
      vehicle.route.length - 1
  ) {
    const currentNode =
      getNode(
        vehicle.route[
          vehicle.routeIndex
        ]
      );

    const nextNode =
      getNode(
        vehicle.route[
          vehicle.routeIndex + 1
        ]
      );

    if (
      !currentNode ||
      !nextNode
    ) {
      return;
    }

    const segmentDistance =
      distanceBetween(
        currentNode.position,
        nextNode.position
      );

    if (segmentDistance <= 0) {
      vehicle.routeIndex += 1;

      vehicle.progress = 0;

      vehicle.currentNode =
        vehicle.route[
          vehicle.routeIndex
        ];

      vehicle.nextNode =
        vehicle.route[
          vehicle.routeIndex + 1
        ] || null;

      continue;
    }

    const currentDistance =
      vehicle.progress *
      segmentDistance;

    const remainingSegment =
      segmentDistance -
      currentDistance;

    const movementState =
      getMovementSignalState(
        nextNode.id,
        currentNode.id,
        nextNode.id,
        simulationTime
      );

    vehicle.signalState =
      movementState;

    const signalAllowsMovement =
      canVehicleProceed(
        nextNode.id,
        currentNode.id,
        nextNode.id,
        simulationTime
      );

    /* -------------------------------------
       RED / YELLOW
    ------------------------------------- */

    if (
      !signalAllowsMovement
    ) {
      const stopDistance =
        Math.min(
          STOP_DISTANCE,
          segmentDistance
        );

      const stopProgress =
        Math.max(
          0,
          1 -
            stopDistance /
              segmentDistance
        );

      if (
        vehicle.progress <
        stopProgress
      ) {
        const distanceToStop =
          (
            stopProgress -
            vehicle.progress
          ) *
          segmentDistance;

        const movement =
          Math.min(
            remainingDistance,
            distanceToStop
          );

        vehicle.progress +=
          movement /
          segmentDistance;

        remainingDistance -=
          movement;

        vehicle.position =
          interpolate(
            currentNode.position,
            nextNode.position,
            vehicle.progress
          );

        if (
          vehicle.progress >=
          stopProgress - 0.0001
        ) {
          /*
           * IMPORTANT:
           * Store NODE ID, not signal ID.
           *
           * C2
           * NOT
           * ATCS-C2
           */
          vehicle.waitingForSignal =
            nextNode.id;

          return;
        }

        continue;
      }

      vehicle.position =
        interpolate(
          currentNode.position,
          nextNode.position,
          vehicle.progress
        );

      vehicle.waitingForSignal =
        nextNode.id;

      return;
    }

    /* -------------------------------------
       GREEN
    ------------------------------------- */

    const movement =
      Math.min(
        remainingDistance,
        remainingSegment
      );

    vehicle.progress +=
      movement /
      segmentDistance;

    remainingDistance -=
      movement;

    vehicle.position =
      interpolate(
        currentNode.position,
        nextNode.position,
        vehicle.progress
      );

    /* -------------------------------------
       REACHED INTERSECTION
    ------------------------------------- */

    if (
      vehicle.progress >=
      0.999999
    ) {
      vehicle.routeIndex += 1;

      vehicle.progress = 0;

      vehicle.currentNode =
        vehicle.route[
          vehicle.routeIndex
        ];

      vehicle.nextNode =
        vehicle.route[
          vehicle.routeIndex + 1
        ] || null;

      vehicle.position = [
        nextNode.position[0],
        0.5,
        nextNode.position[2],
      ];
    }
  }

  /* -------------------------------------
     FINAL NODE
  ------------------------------------- */

  if (
    vehicle.routeIndex >=
    vehicle.route.length - 1
  ) {
    const finalNode =
      getNode(
        vehicle.route[
          vehicle.route.length - 1
        ]
      );

    if (finalNode) {
      vehicle.position = [
        finalNode.position[0],
        0.5,
        finalNode.position[2],
      ];
    }
  }
}

/* =========================================
   AMBULANCE UPDATE
========================================= */

function updateAmbulance(
  ambulance,
  deltaSeconds,
  simulationTime
) {
  if (ambulance.completed) {
    return;
  }

  /* -------------------------------------
     PATIENT PICKUP
  ------------------------------------- */

  if (
    ambulance.state ===
    "PICKUP"
  ) {
    ambulance.pickupTimer +=
      deltaSeconds;

    ambulance.speed = 0;

    ambulance.waitingForSignal =
      null;

    ambulance.signalState =
      null;

    if (
      ambulance.pickupTimer >=
      PICKUP_DURATION
    ) {
      ambulance.state =
        "EN_ROUTE_TO_HOSPITAL";

      ambulance.pickupTimer = 0;

      ambulance.signalWaitSeconds =
        0;

      ambulance.waitingForSignal =
        null;

      ambulance.lastMovingSpeed =
        AMBULANCE_INITIAL_SPEED;

      ambulance.speed =
        AMBULANCE_INITIAL_SPEED;
    }

    return;
  }

  /* -------------------------------------
     ALREADY WAITING AT SIGNAL
  ------------------------------------- */

  if (
    ambulance.waitingForSignal
  ) {
    const signalState =
      getMovementSignalState(
        ambulance.waitingForSignal,
        ambulance.currentNode,
        ambulance.nextNode,
        simulationTime
      );

    ambulance.signalState =
      signalState;

    if (
      signalState !== "GREEN"
    ) {
      ambulance.speed = 0;

      ambulance.signalWaitSeconds +=
        deltaSeconds;

      return;
    }

    /*
     * Signal became green.
     */

    ambulance.waitingForSignal =
      null;

    ambulance.speed =
      ambulance.lastMovingSpeed ||
      DEFAULT_ETA_SPEED;
  }

  /* -------------------------------------
     VARIABLE AMBULANCE SPEED
  ------------------------------------- */

  if (
    ambulance.state ===
      "EN_ROUTE_TO_CLIENT" ||
    ambulance.state ===
      "EN_ROUTE_TO_HOSPITAL"
  ) {
    updateAmbulanceSpeed(
      ambulance,
      deltaSeconds,
      simulationTime
    );

    if (
      ambulance.speed > 0
    ) {
      ambulance.lastMovingSpeed =
        ambulance.speed;
    }
  }

  /* -------------------------------------
     MOVE
  ------------------------------------- */

  moveVehicle(
    ambulance,
    deltaSeconds,
    simulationTime
  );

  /*
   * If the movement just caused
   * the ambulance to reach a red
   * light, stop it immediately.
   */

  if (
    ambulance.waitingForSignal
  ) {
    ambulance.speed = 0;
  }

  /* -------------------------------------
     CLIENT REACHED
  ------------------------------------- */

  if (
    ambulance.currentNode ===
      CLIENT_NODE &&
    ambulance.state ===
      "EN_ROUTE_TO_CLIENT"
  ) {
    ambulance.state =
      "PICKUP";

    ambulance.speed = 0;

    ambulance.pickupTimer = 0;

    ambulance.waitingForSignal =
      null;

    ambulance.signalState =
      null;

    return;
  }

  /* -------------------------------------
     HOSPITAL REACHED
  ------------------------------------- */

  if (
    ambulance.currentNode ===
      HOSPITAL_NODE &&
    ambulance.routeIndex ===
      ambulance.route.length - 1
  ) {
    ambulance.state =
      "COMPLETED";

    ambulance.speed = 0;

    ambulance.completed = true;

    ambulance.waitingForSignal =
      null;

    ambulance.signalState =
      null;
  }
}

/* =========================================
   TRAFFIC UPDATE
========================================= */

function updateTrafficVehicle(
  vehicle,
  deltaSeconds,
  simulationTime
) {
  /*
   * Traffic vehicles don't accumulate
   * emergency signal delay.
   */
  moveVehicle(
    vehicle,
    deltaSeconds,
    simulationTime
  );

  /*
   * Restart route after reaching
   * final node.
   */
  if (
    vehicle.routeIndex >=
      vehicle.route.length - 1 &&
    !vehicle.waitingForSignal
  ) {
    vehicle.routeIndex = 0;

    vehicle.progress = 0;

    vehicle.currentNode =
      vehicle.route[0];

    vehicle.nextNode =
      vehicle.route[1] ||
      null;

    vehicle.position =
      getInitialPosition(
        vehicle.route,
        0,
        0
      );
  }
}

/* =========================================
   MAIN SIMULATION UPDATE
========================================= */

export function updateSimulation(
  simulation,
  deltaSeconds
) {
  const nextTime =
    simulation.elapsedTime +
    deltaSeconds;

  updateAmbulance(
    simulation.ambulance,
    deltaSeconds,
    nextTime
  );

  simulation.traffic =
    simulation.traffic.map(
      (vehicle) => {
        updateTrafficVehicle(
          vehicle,
          deltaSeconds,
          nextTime
        );

        return {
          ...vehicle,

          position: [
            ...vehicle.position,
          ],
        };
      }
    );

  simulation.elapsedTime =
    nextTime;

  return {
    ...simulation,

    ambulance: {
      ...simulation.ambulance,

      position: [
        ...simulation.ambulance.position,
      ],
    },

    traffic:
      simulation.traffic.map(
        (vehicle) => ({
          ...vehicle,

          position: [
            ...vehicle.position,
          ],
        })
      ),
  };
}

/* =========================================
   INITIAL STATE
========================================= */

export function createInitialSimulation() {
  return {
    elapsedTime: 0,

    ambulance:
      createAmbulanceState(),

    traffic:
      createTrafficVehicles(),
  };
}