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

import {
  createGreenCorridorState,
  updateGreenCorridor,
} from "./greenCorridor.js";

import {
  createSignalControllers,
  updateSignalControllers,
} from "./signalController.js";


// ==================================================
// CONFIGURATION
// ==================================================

export const AMBULANCE_MIN_SPEED = 6;
export const AMBULANCE_MAX_SPEED = 12;
export const AMBULANCE_INITIAL_SPEED = 8;
export const AMBULANCE_ACCELERATION = 3.5;

export const TRAFFIC_MIN_SPEED = 3.5;
export const TRAFFIC_MAX_SPEED = 7;

export const USER_ARRIVAL_CONFIRMATION_DURATION = 1.0;
export const PICKUP_DURATION = 2.5;
export const HOSPITAL_COMPLETION_DURATION = 2.5;


// ==================================================
// HELPERS
// ==================================================

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}


function moveTowards(
  current,
  target,
  maxDelta
) {
  if (current < target) {
    return Math.min(
      current + maxDelta,
      target
    );
  }

  if (current > target) {
    return Math.max(
      current - maxDelta,
      target
    );
  }

  return current;
}


function calculateTargetSpeed(
  simulationTime,
  routeIndex
) {
  const wave1 =
    Math.sin(
      simulationTime * 0.45 +
      routeIndex * 1.3
    );

  const wave2 =
    Math.sin(
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
  const from =
    getNodePosition(fromNodeId);

  const to =
    getNodePosition(toNodeId);

  if (!from || !to) {
    return {
      x: 0,
      z: 0,
    };
  }

  const safeProgress =
    clamp(
      progress,
      0,
      1
    );

  return {
    x:
      from.x +
      (to.x - from.x) *
      safeProgress,

    z:
      from.z +
      (to.z - from.z) *
      safeProgress,
  };
}


// ==================================================
// AMBULANCE STATE
// ==================================================

export function createAmbulanceState() {
  return {
    id: "AMB-01",

    driverId: "DRIVER-001",

    currentNode:
      AMBULANCE_START_NODE,

    nextNode:
      FULL_EMERGENCY_ROUTE[1],

    route:
      [...FULL_EMERGENCY_ROUTE],

    routeIndex: 0,

    progress: 0,

    position:
      getInterpolatedPosition(
        AMBULANCE_START_NODE,
        FULL_EMERGENCY_ROUTE[1],
        0
      ),

    speed:
      AMBULANCE_INITIAL_SPEED,

    targetSpeed:
      AMBULANCE_INITIAL_SPEED,

    status:
      "EN_ROUTE_TO_USER",

    waitingForSignal:
      null,

    signalWaitSeconds:
      0,

    userArrivalTimer:
      0,

    pickupTimer:
      0,

    hospitalTimer:
      0,

    passengerOnboard:
      false,

    completed:
      false,
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

    route:
      [...route],

    routeIndex: 0,

    currentNode:
      route[0],

    nextNode:
      route[1],

    progress: 0,

    speed,

    position:
      getInterpolatedPosition(
        route[0],
        route[1],
        0
      ),

    waitingForSignal:
      null,

    active:
      true,
  };
}


// ==================================================
// CREATE TRAFFIC VEHICLES
// ==================================================

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
// CHECK SIGNAL FOR VEHICLE
// ==================================================

function canVehicleMoveThroughSignal(
  currentNode,
  nextNode,
  simulationTime,
  corridorState,
  signalControllers
) {
  const signalState =
    getMovementSignalState(
      nextNode,
      currentNode,
      nextNode,
      simulationTime,
      corridorState,
      signalControllers
    );

  return signalState === "GREEN";
}


// ==================================================
// UPDATE TRAFFIC VEHICLE
// ==================================================

function updateTrafficVehicle(
  vehicle,
  deltaSeconds,
  simulationTime,
  corridorState,
  signalControllers
) {
  if (
    !vehicle.active ||
    !vehicle.nextNode
  ) {
    return vehicle;
  }

  const canMove =
    canVehicleMoveThroughSignal(
      vehicle.currentNode,
      vehicle.nextNode,
      simulationTime,
      corridorState,
      signalControllers
    );

  // -----------------------------------------------
  // WAIT AT RED / YELLOW
  // -----------------------------------------------

  if (
    !canMove &&
    vehicle.progress <= 0
  ) {
    vehicle.waitingForSignal =
      vehicle.nextNode;

    return vehicle;
  }

  vehicle.waitingForSignal =
    null;

  // -----------------------------------------------
  // DISTANCE
  // -----------------------------------------------

  const distance =
    getDistanceBetweenNodes(
      vehicle.currentNode,
      vehicle.nextNode
    );

  if (distance <= 0) {
    return vehicle;
  }

  // -----------------------------------------------
  // MOVE
  // -----------------------------------------------

  const movement =
    vehicle.speed *
    deltaSeconds;

  vehicle.progress +=
    movement / distance;

  vehicle.position =
    getInterpolatedPosition(
      vehicle.currentNode,
      vehicle.nextNode,
      vehicle.progress
    );

  // -----------------------------------------------
  // NODE REACHED
  // -----------------------------------------------

  if (
    vehicle.progress >= 1
  ) {
    vehicle.routeIndex += 1;

    if (
      vehicle.routeIndex >=
      vehicle.route.length - 1
    ) {
      // Loop traffic back to the start
      // of its route.
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
  simulationTime,
  corridorState,
  signalControllers
) {
  return traffic.map(
    (vehicle) =>
      updateTrafficVehicle(
        {
          ...vehicle,
        },
        deltaSeconds,
        simulationTime,
        corridorState,
        signalControllers
      )
  );
}


// ==================================================
// NODE POSITION OBJECT
// ==================================================

function getNodePositionObject(nodeId) {
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
// ADVANCE AMBULANCE ROUTE
// ==================================================

function advanceAmbulanceRoute(
  ambulance
) {
  ambulance.routeIndex += 1;

  // -----------------------------------------------
  // ARRIVED AT USER
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

    ambulance.waitingForSignal =
      null;

    ambulance.signalWaitSeconds =
      0;

    ambulance.userArrivalTimer =
      0;

    ambulance.pickupTimer =
      0;

    return ambulance;
  }


  // -----------------------------------------------
  // ARRIVED AT HOSPITAL
  // -----------------------------------------------

  if (
    ambulance.route[
      ambulance.routeIndex
    ] === HOSPITAL_NODE
  ) {
    ambulance.currentNode =
      HOSPITAL_NODE;

    ambulance.nextNode =
      null;

    ambulance.progress = 0;

    ambulance.position =
      getNodePositionObject(
        HOSPITAL_NODE
      );

    ambulance.status =
      "ARRIVED_AT_HOSPITAL";

    ambulance.speed = 0;

    ambulance.targetSpeed = 0;

    ambulance.waitingForSignal =
      null;

    ambulance.signalWaitSeconds =
      0;

    ambulance.hospitalTimer =
      0;

    return ambulance;
  }


  // -----------------------------------------------
  // NORMAL NEXT SEGMENT
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
// UPDATE AMBULANCE
// ==================================================

function updateAmbulance(
  ambulance,
  deltaSeconds,
  simulationTime,
  corridorState,
  signalControllers
) {
  // -----------------------------------------------
  // COMPLETED
  // -----------------------------------------------

  if (ambulance.completed) {
    return ambulance;
  }


  // -----------------------------------------------
  // ARRIVED AT HOSPITAL
  // -----------------------------------------------

  if (
    ambulance.status ===
    "ARRIVED_AT_HOSPITAL"
  ) {
    ambulance.hospitalTimer +=
      deltaSeconds;

    ambulance.speed = 0;

    ambulance.targetSpeed = 0;

    if (
      ambulance.hospitalTimer >=
      HOSPITAL_COMPLETION_DURATION
    ) {
      ambulance.hospitalTimer = 0;

      ambulance.status =
        "COMPLETED";

      ambulance.completed =
        true;
    }

    return ambulance;
  }


  // -----------------------------------------------
  // ARRIVED AT USER
  // -----------------------------------------------

  if (
    ambulance.status ===
    "ARRIVED_AT_USER"
  ) {
    ambulance.userArrivalTimer +=
      deltaSeconds;

    ambulance.speed = 0;

    ambulance.targetSpeed = 0;

    if (
      ambulance.userArrivalTimer >=
      USER_ARRIVAL_CONFIRMATION_DURATION
    ) {
      ambulance.userArrivalTimer = 0;

      ambulance.pickupTimer = 0;

      ambulance.status =
        "PATIENT_PICKUP";
    }

    return ambulance;
  }


  // -----------------------------------------------
  // PATIENT PICKUP
  // -----------------------------------------------

  if (
    ambulance.status ===
    "PATIENT_PICKUP"
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

      ambulance.passengerOnboard =
        true;

      ambulance.status =
        "EN_ROUTE_TO_HOSPITAL";

      ambulance.currentNode =
        CLIENT_NODE;

      ambulance.routeIndex =
        ambulance.route.indexOf(
          CLIENT_NODE
        );

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

      ambulance.targetSpeed =
        AMBULANCE_INITIAL_SPEED;

      ambulance.speed =
        AMBULANCE_INITIAL_SPEED;

      ambulance.waitingForSignal =
        null;

      ambulance.signalWaitSeconds =
        0;
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
  // CONTROLLED SIGNAL
  // -----------------------------------------------

  const signalState =
    getMovementSignalState(
      ambulance.nextNode,
      ambulance.currentNode,
      ambulance.nextNode,
      simulationTime,
      corridorState,
      signalControllers
    );


  // -----------------------------------------------
// WAIT AT RED / YELLOW
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
// SIGNAL TURNED GREEN
// -----------------------------------------------
// Ambulance is no longer waiting at the signal,
// so reset the accumulated waiting time.

ambulance.waitingForSignal =
  null;

ambulance.signalWaitSeconds =
  0;


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
  // POSITION
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

  if (
    ambulance.progress >= 1
  ) {
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

    greenCorridor:
      createGreenCorridorState(),

    signalControllers:
      createSignalControllers(),

    lastEvent:
      "SIMULATION_STARTED",
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
  // CLOCK
  // -----------------------------------------------

  simulation.simulationTime +=
    safeDelta;


  // -----------------------------------------------
  // GREEN CORRIDOR REQUEST
  // -----------------------------------------------

  simulation.greenCorridor =
    updateGreenCorridor(
      simulation.greenCorridor,
      simulation.ambulance,
      simulation.simulationTime
    );


  // -----------------------------------------------
  // APPLY SIGNAL CONTROLLER CHANGES
  // -----------------------------------------------
  // Controller state must be updated BEFORE
  // vehicle movement so the ambulance and traffic
  // read the actual controlled signal state.

  simulation.signalControllers =
    updateSignalControllers(
      simulation.signalControllers,
      simulation.greenCorridor,
      safeDelta
    );


  // -----------------------------------------------
  // AMBULANCE
  // -----------------------------------------------

  const previousStatus =
    simulation.ambulance.status;

  simulation.ambulance =
    updateAmbulance(
      {
        ...simulation.ambulance,
      },

      safeDelta,

      simulation.simulationTime,

      simulation.greenCorridor,

      simulation.signalControllers
    );


  // -----------------------------------------------
  // NORMAL TRAFFIC
  // -----------------------------------------------

  simulation.traffic =
    updateTraffic(
      simulation.traffic,

      safeDelta,

      simulation.simulationTime,

      simulation.greenCorridor,

      simulation.signalControllers
    );


  // -----------------------------------------------
  // RECALCULATE CORRIDOR
  // -----------------------------------------------
  // The ambulance may have moved to another route
  // segment. Recalculate the planning state for
  // telemetry and the next controller update.
  //
  // We intentionally do NOT update signal controllers
  // a second time in this same tick because that would
  // decrement the controller timers twice.

  simulation.greenCorridor =
    updateGreenCorridor(
      simulation.greenCorridor,
      simulation.ambulance,
      simulation.simulationTime
    );


  // -----------------------------------------------
  // STATUS EVENT
  // -----------------------------------------------

  if (
    previousStatus !==
    simulation.ambulance.status
  ) {
    simulation.lastEvent =
      simulation.ambulance.status;
  }


  // -----------------------------------------------
  // COMPLETED
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