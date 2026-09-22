// Backend/src/simulation/simulationEngine.js

import {
  ROAD_NODES,
  getNodePosition,
  getDistanceBetweenNodes,
  FULL_EMERGENCY_ROUTE,
  AMBULANCE_START_NODE,
  CLIENT_NODE,
  HOSPITAL_NODE,
} from "./roadNetwork.js";

import {
  getMovementSignalState,
} from "./signalEngine.js";


// ==================================================
// CONFIGURATION
// ==================================================

export const AMBULANCE_MIN_SPEED = 6;
export const AMBULANCE_MAX_SPEED = 12;
export const AMBULANCE_INITIAL_SPEED = 8;
export const AMBULANCE_ACCELERATION = 3.5;

export const TRAFFIC_MIN_SPEED = 3.5;
export const TRAFFIC_MAX_SPEED = 7;

export const PICKUP_DURATION = 2.5;


// ==================================================
// HELPERS
// ==================================================

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


function moveTowards(current, target, maxDelta) {
  if (current < target) {
    return Math.min(current + maxDelta, target);
  }

  if (current > target) {
    return Math.max(current - maxDelta, target);
  }

  return current;
}


function calculateTargetSpeed(
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


// ==================================================
// POSITION INTERPOLATION
// ==================================================

export function getInterpolatedPosition(
  fromNodeId,
  toNodeId,
  progress
) {
  const from = getNodePosition(fromNodeId);
  const to = getNodePosition(toNodeId);

  if (!from || !to) {
    return {
      x: 0,
      z: 0,
    };
  }

  const safeProgress = clamp(
    progress,
    0,
    1
  );

  return {
    x:
      from.x +
      (to.x - from.x) * safeProgress,

    z:
      from.z +
      (to.z - from.z) * safeProgress,
  };
}


// ==================================================
// AMBULANCE STATE
// ==================================================

export function createAmbulanceState() {
  return {
    id: "AMB-01",

    driverId: "DRIVER-001",

    currentNode: AMBULANCE_START_NODE,

    nextNode: FULL_EMERGENCY_ROUTE[1],

    route: [...FULL_EMERGENCY_ROUTE],

    routeIndex: 0,

    progress: 0,

    position: getInterpolatedPosition(
      AMBULANCE_START_NODE,
      FULL_EMERGENCY_ROUTE[1],
      0
    ),

    speed: AMBULANCE_INITIAL_SPEED,

    targetSpeed: AMBULANCE_INITIAL_SPEED,

    status: "EN_ROUTE_TO_USER",

    waitingForSignal: null,

    signalWaitSeconds: 0,

    pickupTimer: 0,

    passengerOnboard: false,

    completed: false,
  };
}


// ==================================================
// NORMAL TRAFFIC
// ==================================================

function createTrafficVehicle(
  id,
  route,
  speed
) {
  return {
    id,

    route: [...route],

    routeIndex: 0,

    currentNode: route[0],

    nextNode: route[1],

    progress: 0,

    speed,

    position: getInterpolatedPosition(
      route[0],
      route[1],
      0
    ),

    waitingForSignal: null,

    active: true,
  };
}


// --------------------------------------------------
// Deterministic traffic routes
// --------------------------------------------------

export function createTrafficVehicles() {
  return [
    createTrafficVehicle(
      "CAR-01",
      [
        "A1",
        "A2",
        "A3",
        "A4",
      ],
      5
    ),

    createTrafficVehicle(
      "CAR-02",
      [
        "B4",
        "B3",
        "B2",
        "B1",
      ],
      4.5
    ),

    createTrafficVehicle(
      "CAR-03",
      [
        "C1",
        "C2",
        "C3",
        "C4",
      ],
      5.5
    ),

    createTrafficVehicle(
      "CAR-04",
      [
        "D4",
        "D3",
        "D2",
        "D1",
      ],
      4
    ),

    createTrafficVehicle(
      "CAR-05",
      [
        "A1",
        "B1",
        "C1",
        "D1",
      ],
      4.5
    ),

    createTrafficVehicle(
      "CAR-06",
      [
        "A3",
        "B3",
        "C3",
        "D3",
      ],
      5
    ),
  ];
}


// ==================================================
// CHECK SIGNAL
// ==================================================

function canVehicleMoveThroughSignal(
  currentNode,
  nextNode,
  simulationTime
) {
  const signalState =
    getMovementSignalState(
      nextNode,
      currentNode,
      nextNode,
      simulationTime
    );

  return signalState === "GREEN";
}


// ==================================================
// ADVANCE TRAFFIC VEHICLE
// ==================================================

function updateTrafficVehicle(
  vehicle,
  deltaSeconds,
  simulationTime
) {
  if (
    !vehicle.active ||
    !vehicle.nextNode
  ) {
    return vehicle;
  }

  // -----------------------------------------------
  // Check signal before entering next intersection
  // -----------------------------------------------

  const canMove =
    canVehicleMoveThroughSignal(
      vehicle.currentNode,
      vehicle.nextNode,
      simulationTime
    );

  if (!canMove && vehicle.progress <= 0) {
    vehicle.waitingForSignal =
      vehicle.nextNode;

    return vehicle;
  }

  vehicle.waitingForSignal = null;


  // -----------------------------------------------
  // Move vehicle
  // -----------------------------------------------

  const distance =
    getDistanceBetweenNodes(
      vehicle.currentNode,
      vehicle.nextNode
    );

  if (distance <= 0) {
    return vehicle;
  }

  const movement =
    vehicle.speed *
    deltaSeconds;

  vehicle.progress +=
    movement / distance;


  // -----------------------------------------------
  // Update position
  // -----------------------------------------------

  vehicle.position =
    getInterpolatedPosition(
      vehicle.currentNode,
      vehicle.nextNode,
      vehicle.progress
    );


  // -----------------------------------------------
  // Reached next intersection
  // -----------------------------------------------

  if (vehicle.progress >= 1) {
    vehicle.routeIndex += 1;


    // Loop traffic route
    if (
      vehicle.routeIndex >=
      vehicle.route.length - 1
    ) {
      vehicle.routeIndex = 0;
    }


    vehicle.currentNode =
      vehicle.route[
        vehicle.routeIndex
      ];

    vehicle.nextNode =
      vehicle.route[
        vehicle.routeIndex + 1
      ];

    vehicle.progress = 0;

    vehicle.position =
      getInterpolatedPosition(
        vehicle.currentNode,
        vehicle.nextNode,
        0
      );
  }

  return vehicle;
}


// ==================================================
// UPDATE ALL TRAFFIC
// ==================================================

function updateTraffic(
  traffic,
  deltaSeconds,
  simulationTime
) {
  return traffic.map((vehicle) =>
    updateTrafficVehicle(
      {
        ...vehicle,
      },
      deltaSeconds,
      simulationTime
    )
  );
}


// ==================================================
// AMBULANCE: ARRIVAL AT NODE
// ==================================================

function advanceAmbulanceRoute(
  ambulance
) {
  ambulance.routeIndex += 1;

  // -----------------------------------------------
  // Reached client
  // -----------------------------------------------

  if (
    ambulance.route[
      ambulance.routeIndex
    ] === CLIENT_NODE
  ) {
    ambulance.currentNode =
      CLIENT_NODE;

    ambulance.nextNode =
      FULL_EMERGENCY_ROUTE[
        ambulance.routeIndex + 1
      ] || null;

    ambulance.progress = 0;

    ambulance.position =
      getNodePositionObject(
        CLIENT_NODE
      );

    ambulance.status =
      "ARRIVED_AT_USER";

    ambulance.speed = 0;

    ambulance.targetSpeed = 0;

    ambulance.waitingForSignal = null;

    ambulance.signalWaitSeconds = 0;

    return ambulance;
  }


  // -----------------------------------------------
  // Reached hospital
  // -----------------------------------------------

  if (
    ambulance.route[
      ambulance.routeIndex
    ] === HOSPITAL_NODE
  ) {
    ambulance.currentNode =
      HOSPITAL_NODE;

    ambulance.nextNode = null;

    ambulance.progress = 0;

    ambulance.position =
      getNodePositionObject(
        HOSPITAL_NODE
      );

    ambulance.status =
      "COMPLETED";

    ambulance.speed = 0;

    ambulance.targetSpeed = 0;

    ambulance.completed = true;

    ambulance.waitingForSignal = null;

    ambulance.signalWaitSeconds = 0;

    return ambulance;
  }


  // -----------------------------------------------
  // Normal next segment
  // -----------------------------------------------

  ambulance.currentNode =
    ambulance.route[
      ambulance.routeIndex
    ];

  ambulance.nextNode =
    ambulance.route[
      ambulance.routeIndex + 1
    ];

  ambulance.progress = 0;

  ambulance.position =
    getInterpolatedPosition(
      ambulance.currentNode,
      ambulance.nextNode,
      0
    );

  return ambulance;
}


// ==================================================
// NODE POSITION OBJECT
// ==================================================

function getNodePositionObject(
  nodeId
) {
  const node =
    ROAD_NODES[nodeId];

  if (!node) {
    return {
      x: 0,
      z: 0,
    };
  }

  return {
    x: node.position.x,
    z: node.position.z,
  };
}


// ==================================================
// UPDATE AMBULANCE
// ==================================================

function updateAmbulance(
  ambulance,
  deltaSeconds,
  simulationTime
) {
  // -----------------------------------------------
  // COMPLETED
  // -----------------------------------------------

  if (ambulance.completed) {
    return ambulance;
  }


  // -----------------------------------------------
  // PATIENT PICKUP
  // -----------------------------------------------

  if (
    ambulance.status ===
    "ARRIVED_AT_USER"
  ) {
    ambulance.pickupTimer +=
      deltaSeconds;

    ambulance.speed = 0;

    ambulance.targetSpeed = 0;

    if (
      ambulance.pickupTimer >=
      PICKUP_DURATION
    ) {
      ambulance.pickupTimer = 0;

      ambulance.passengerOnboard = true;

      ambulance.status =
        "EN_ROUTE_TO_HOSPITAL";

      ambulance.currentNode =
        CLIENT_NODE;

      ambulance.nextNode =
        ambulance.route[
          ambulance.routeIndex + 1
        ];

      ambulance.routeIndex =
        ambulance.route.indexOf(
          CLIENT_NODE
        );

      ambulance.progress = 0;

      ambulance.position =
        getInterpolatedPosition(
          ambulance.currentNode,
          ambulance.nextNode,
          0
        );

      ambulance.targetSpeed =
        AMBULANCE_INITIAL_SPEED;

      ambulance.speed =
        AMBULANCE_INITIAL_SPEED;
    }

    return ambulance;
  }


  // -----------------------------------------------
  // NO NEXT NODE
  // -----------------------------------------------

  if (!ambulance.nextNode) {
    return ambulance;
  }


  // -----------------------------------------------
  // CHECK SIGNAL
  // -----------------------------------------------

  const signalState =
    getMovementSignalState(
      ambulance.nextNode,
      ambulance.currentNode,
      ambulance.nextNode,
      simulationTime
    );


  // -----------------------------------------------
  // RED / YELLOW
  // -----------------------------------------------

  if (
    signalState !== "GREEN" &&
    ambulance.progress <= 0
  ) {
    ambulance.waitingForSignal =
      ambulance.nextNode;

    ambulance.signalWaitSeconds +=
      deltaSeconds;

    ambulance.speed = 0;

    return ambulance;
  }


  // -----------------------------------------------
  // GREEN
  // -----------------------------------------------

  if (
    ambulance.waitingForSignal
  ) {
    ambulance.waitingForSignal = null;
  }


  // -----------------------------------------------
  // VARIABLE SPEED
  // -----------------------------------------------

  ambulance.targetSpeed =
    calculateTargetSpeed(
      simulationTime,
      ambulance.routeIndex
    );

  ambulance.speed =
    moveTowards(
      ambulance.speed,
      ambulance.targetSpeed,
      AMBULANCE_ACCELERATION *
        deltaSeconds
    );


  // -----------------------------------------------
  // MOVE
  // -----------------------------------------------

  const distance =
    getDistanceBetweenNodes(
      ambulance.currentNode,
      ambulance.nextNode
    );

  if (distance <= 0) {
    return ambulance;
  }

  const movement =
    ambulance.speed *
    deltaSeconds;

  ambulance.progress +=
    movement / distance;


  // -----------------------------------------------
  // UPDATE POSITION
  // -----------------------------------------------

  ambulance.position =
    getInterpolatedPosition(
      ambulance.currentNode,
      ambulance.nextNode,
      ambulance.progress
    );


  // -----------------------------------------------
  // NODE REACHED
  // -----------------------------------------------

  if (ambulance.progress >= 1) {
    advanceAmbulanceRoute(
      ambulance
    );
  }


  return ambulance;
}


// ==================================================
// CREATE COMPLETE SIMULATION
// ==================================================

export function createSimulation() {
  return {
    running: true,

    completed: false,

    simulationTime: 0,

    ambulance:
      createAmbulanceState(),

    traffic:
      createTrafficVehicles(),

    lastEvent: "SIMULATION_STARTED",
  };
}


// ==================================================
// UPDATE SIMULATION
// ==================================================

export function updateSimulation(
  simulation,
  deltaSeconds
) {
  if (
    !simulation.running ||
    simulation.completed
  ) {
    return simulation;
  }


  const safeDelta =
    Math.max(
      0,
      Math.min(
        deltaSeconds,
        0.25
      )
    );


  // -----------------------------------------------
  // ADVANCE SIMULATION CLOCK
  // -----------------------------------------------

  simulation.simulationTime +=
    safeDelta;


  // -----------------------------------------------
  // UPDATE AMBULANCE
  // -----------------------------------------------

  const previousAmbulanceStatus =
    simulation.ambulance.status;

  simulation.ambulance =
    updateAmbulance(
      {
        ...simulation.ambulance,
      },
      safeDelta,
      simulation.simulationTime
    );


  // -----------------------------------------------
  // UPDATE TRAFFIC
  // -----------------------------------------------

  simulation.traffic =
    updateTraffic(
      simulation.traffic,
      safeDelta,
      simulation.simulationTime
    );


  // -----------------------------------------------
  // DETECT EVENTS
  // -----------------------------------------------

  if (
    previousAmbulanceStatus !==
    simulation.ambulance.status
  ) {
    simulation.lastEvent =
      simulation.ambulance.status;
  }


  // -----------------------------------------------
  // SIMULATION COMPLETE
  // -----------------------------------------------

  if (
    simulation.ambulance.status ===
    "COMPLETED"
  ) {
    simulation.running = false;

    simulation.completed = true;

    simulation.lastEvent =
      "EMERGENCY_COMPLETED";
  }


  return simulation;
}