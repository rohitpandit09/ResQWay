// Backend/src/simulation/signalEngine.js

import {
  ROAD_NODES,
  getRoadNode,
} from "./roadNetwork.js";


// ==================================================
// NORMAL SIGNAL PHASES
// ==================================================
//
// Phase 0:
// Horizontal GREEN
// Vertical RED
//
// Phase 1:
// Horizontal YELLOW
// Vertical RED
//
// Phase 2:
// Horizontal RED
// Vertical GREEN
//
// Phase 3:
// Horizontal RED
// Vertical YELLOW
// ==================================================

export const SIGNAL_PHASES = [
  {
    phase: 0,
    duration: 18,
    horizontal: "GREEN",
    vertical: "RED",
  },

  {
    phase: 1,
    duration: 3,
    horizontal: "YELLOW",
    vertical: "RED",
  },

  {
    phase: 2,
    duration: 18,
    horizontal: "RED",
    vertical: "GREEN",
  },

  {
    phase: 3,
    duration: 3,
    horizontal: "RED",
    vertical: "YELLOW",
  },
];


export const SIGNAL_CYCLE_SECONDS = 42;


// ==================================================
// GET NORMAL SIGNAL PHASE
// ==================================================

export function getSignalPhase(
  simulationTime
) {
  const cycleTime =
    simulationTime %
    SIGNAL_CYCLE_SECONDS;

  let elapsed = 0;


  for (const phase of SIGNAL_PHASES) {
    if (
      cycleTime >= elapsed &&
      cycleTime <
        elapsed + phase.duration
    ) {
      return {
        ...phase,

        remainingSeconds:
          elapsed +
          phase.duration -
          cycleTime,
      };
    }

    elapsed += phase.duration;
  }


  return {
    ...SIGNAL_PHASES[0],

    remainingSeconds:
      SIGNAL_PHASES[0].duration,
  };
}


// ==================================================
// NORMAL SIGNAL SNAPSHOT
// ==================================================

export function getSignalSnapshot(
  nodeId,
  simulationTime
) {
  const node =
    getRoadNode(nodeId);


  if (!node) {
    return null;
  }


  const phase =
    getSignalPhase(
      simulationTime
    );


  return {
    signalId:
      node.signal.id,

    nodeId:
      node.id,

    controller:
      node.signal.controller,

    phase:
      phase.phase,

    horizontal:
      phase.horizontal,

    vertical:
      phase.vertical,

    remainingSeconds:
      Math.max(
        0,
        phase.remainingSeconds
      ),

    cycleSeconds:
      SIGNAL_CYCLE_SECONDS,

    mode:
      "NORMAL",

    priority:
      false,

    priorityDirection:
      null,

    priorityRemainingSeconds:
      0,

    lastAction:
      "NORMAL_CYCLE",
  };
}


// ==================================================
// GET PRIORITY REQUEST FOR SIGNAL
// ==================================================

function getPrioritySignal(
  nodeId,
  corridorState
) {
  if (
    !corridorState ||
    !Array.isArray(
      corridorState.signals
    )
  ) {
    return null;
  }


  return (
    corridorState.signals.find(
      (signal) =>
        signal.nodeId === nodeId
    ) || null
  );
}


// ==================================================
// CONTROLLED SIGNAL SNAPSHOT
// ==================================================
//
// Priority order:
//
// 1. Mutable signal controller
// 2. Green Corridor fallback
// 3. Normal signal cycle
//
// The signal controller is the authoritative
// source once the simulation is running.
// ==================================================

export function getControlledSignalSnapshot(
  nodeId,
  simulationTime,
  corridorState = null,
  signalControllers = null
) {
  // -----------------------------------------------
  // 1. LIVE MUTABLE SIGNAL CONTROLLER
  // -----------------------------------------------

  if (
    signalControllers &&
    signalControllers[nodeId]
  ) {
    return {
      ...signalControllers[nodeId],
    };
  }


  // -----------------------------------------------
  // 2. FALLBACK TO NORMAL SIGNAL
  // -----------------------------------------------

  const normalSignal =
    getSignalSnapshot(
      nodeId,
      simulationTime
    );


  if (!normalSignal) {
    return null;
  }


  // -----------------------------------------------
  // 3. FALLBACK TO GREEN CORRIDOR STATE
  // -----------------------------------------------

  const priority =
    getPrioritySignal(
      nodeId,
      corridorState
    );


  if (!priority) {
    return normalSignal;
  }


  const direction =
    priority.direction;


  // ===============================================
  // CLEARING
  // ===============================================

  if (
    priority.mode ===
    "CLEARING"
  ) {
    let horizontal =
      "RED";

    let vertical =
      "RED";


    if (
      direction ===
      "HORIZONTAL"
    ) {
      horizontal =
        "RED";

      vertical =
        "YELLOW";
    }


    if (
      direction ===
      "VERTICAL"
    ) {
      horizontal =
        "YELLOW";

      vertical =
        "RED";
    }


    return {
      ...normalSignal,

      horizontal,

      vertical,

      mode:
        "CLEARING",

      priority:
        true,

      priorityDirection:
        direction,

      remainingSeconds:
        Math.max(
          0,
          priority.secondsUntilGreen || 0
        ),

      priorityRemainingSeconds:
        Math.max(
          0,
          priority.priorityRemaining || 0
        ),

      lastAction:
        "EMERGENCY_CLEARING",
    };
  }


  // ===============================================
  // EMERGENCY PRIORITY
  // ===============================================

  if (
    priority.mode ===
    "EMERGENCY_PRIORITY"
  ) {
    const horizontal =
      direction ===
      "HORIZONTAL"
        ? "GREEN"
        : "RED";


    const vertical =
      direction ===
      "VERTICAL"
        ? "GREEN"
        : "RED";


    return {
      ...normalSignal,

      horizontal,

      vertical,

      mode:
        "EMERGENCY_PRIORITY",

      priority:
        true,

      priorityDirection:
        direction,

      remainingSeconds:
        Math.max(
          0,
          priority.priorityRemaining || 0
        ),

      priorityRemainingSeconds:
        Math.max(
          0,
          priority.priorityRemaining || 0
        ),

      lastAction:
        "EMERGENCY_GREEN",
    };
  }


  return normalSignal;
}


// ==================================================
// GET MOVEMENT DIRECTION
// ==================================================

export function getMovementDirection(
  fromNodeId,
  toNodeId
) {
  const fromNode =
    ROAD_NODES[fromNodeId];

  const toNode =
    ROAD_NODES[toNodeId];


  if (
    !fromNode ||
    !toNode
  ) {
    return null;
  }


  const sameRow =
    fromNode.row ===
    toNode.row;

  const sameColumn =
    fromNode.column ===
    toNode.column;


  // -----------------------------------------------
  // Horizontal movement
  // -----------------------------------------------

  if (
    sameRow &&
    !sameColumn
  ) {
    return "HORIZONTAL";
  }


  // -----------------------------------------------
  // Vertical movement
  // -----------------------------------------------

  if (
    sameColumn &&
    !sameRow
  ) {
    return "VERTICAL";
  }


  return null;
}


// ==================================================
// GET MOVEMENT SIGNAL STATE
// ==================================================

export function getMovementSignalState(
  nodeId,
  fromNodeId,
  toNodeId,
  simulationTime,
  corridorState = null,
  signalControllers = null
) {
  const signal =
    getControlledSignalSnapshot(
      nodeId,
      simulationTime,
      corridorState,
      signalControllers
    );


  if (!signal) {
    return "RED";
  }


  const direction =
    getMovementDirection(
      fromNodeId,
      toNodeId
    );


  if (
    direction ===
    "HORIZONTAL"
  ) {
    return signal.horizontal;
  }


  if (
    direction ===
    "VERTICAL"
  ) {
    return signal.vertical;
  }


  return "RED";
}


// ==================================================
// CAN VEHICLE PROCEED?
// ==================================================

export function canVehicleProceed(
  nodeId,
  fromNodeId,
  toNodeId,
  simulationTime,
  corridorState = null,
  signalControllers = null
) {
  const state =
    getMovementSignalState(
      nodeId,
      fromNodeId,
      toNodeId,
      simulationTime,
      corridorState,
      signalControllers
    );


  return state === "GREEN";
}


// ==================================================
// GET ALL NORMAL SIGNAL SNAPSHOTS
// ==================================================

export function getAllSignalSnapshots(
  simulationTime
) {
  const snapshots = {};


  for (
    const nodeId of
    Object.keys(ROAD_NODES)
  ) {
    snapshots[nodeId] =
      getSignalSnapshot(
        nodeId,
        simulationTime
      );
  }


  return snapshots;
}


// ==================================================
// GET ALL CONTROLLED SIGNAL SNAPSHOTS
// ==================================================

export function getAllControlledSignalSnapshots(
  simulationTime,
  corridorState = null,
  signalControllers = null
) {
  const snapshots = {};


  for (
    const nodeId of
    Object.keys(ROAD_NODES)
  ) {
    snapshots[nodeId] =
      getControlledSignalSnapshot(
        nodeId,
        simulationTime,
        corridorState,
        signalControllers
      );
  }


  return snapshots;
}