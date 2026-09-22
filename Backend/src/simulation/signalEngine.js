// Backend/src/simulation/signalEngine.js

import {
  ROAD_NODES,
  getRoadNode,
} from "./roadNetwork.js";

// --------------------------------------------------
// SIGNAL PHASE CONFIGURATION
// --------------------------------------------------
// 0 → Horizontal GREEN
// 1 → Horizontal YELLOW
// 2 → Vertical GREEN
// 3 → Vertical YELLOW
// --------------------------------------------------

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


// --------------------------------------------------
// GET SIGNAL PHASE
// --------------------------------------------------

export function getSignalPhase(simulationTime) {
  const cycleTime =
    simulationTime % SIGNAL_CYCLE_SECONDS;

  let elapsed = 0;

  for (const phase of SIGNAL_PHASES) {
    if (
      cycleTime >= elapsed &&
      cycleTime < elapsed + phase.duration
    ) {
      return {
        ...phase,
        remainingSeconds:
          elapsed + phase.duration - cycleTime,
      };
    }

    elapsed += phase.duration;
  }

  // Fallback
  return {
    ...SIGNAL_PHASES[0],
    remainingSeconds: SIGNAL_PHASES[0].duration,
  };
}


// --------------------------------------------------
// GET SIGNAL STATE FOR A NODE
// --------------------------------------------------

export function getSignalSnapshot(
  nodeId,
  simulationTime
) {
  const node = getRoadNode(nodeId);

  if (!node) {
    return null;
  }

  const phase = getSignalPhase(simulationTime);

  return {
    signalId: node.signal.id,
    nodeId: node.id,

    controller: node.signal.controller,

    phase: phase.phase,

    horizontal: phase.horizontal,
    vertical: phase.vertical,

    remainingSeconds: Math.max(
      0,
      phase.remainingSeconds
    ),

    cycleSeconds: SIGNAL_CYCLE_SECONDS,

    mode: "NORMAL",
  };
}


// --------------------------------------------------
// DETERMINE MOVEMENT DIRECTION
// --------------------------------------------------
// Returns:
//
// HORIZONTAL
// VERTICAL
//
// Example:
//
// A1 → A2 = HORIZONTAL
// A2 → B2 = VERTICAL
// --------------------------------------------------

export function getMovementDirection(
  fromNodeId,
  toNodeId
) {
  const fromNode = ROAD_NODES[fromNodeId];
  const toNode = ROAD_NODES[toNodeId];

  if (!fromNode || !toNode) {
    return null;
  }

  const sameRow =
    fromNode.row === toNode.row;

  const sameColumn =
    fromNode.column === toNode.column;

  if (sameRow && !sameColumn) {
    return "HORIZONTAL";
  }

  if (sameColumn && !sameRow) {
    return "VERTICAL";
  }

  return null;
}


// --------------------------------------------------
// GET MOVEMENT SIGNAL STATE
// --------------------------------------------------

export function getMovementSignalState(
  nodeId,
  fromNodeId,
  toNodeId,
  simulationTime
) {
  const signal = getSignalSnapshot(
    nodeId,
    simulationTime
  );

  if (!signal) {
    return "RED";
  }

  const direction = getMovementDirection(
    fromNodeId,
    toNodeId
  );

  if (direction === "HORIZONTAL") {
    return signal.horizontal;
  }

  if (direction === "VERTICAL") {
    return signal.vertical;
  }

  return "RED";
}


// --------------------------------------------------
// CAN VEHICLE PROCEED?
// --------------------------------------------------

export function canVehicleProceed(
  nodeId,
  fromNodeId,
  toNodeId,
  simulationTime
) {
  const state = getMovementSignalState(
    nodeId,
    fromNodeId,
    toNodeId,
    simulationTime
  );

  return state === "GREEN";
}


// --------------------------------------------------
// GET ALL SIGNAL STATES
// --------------------------------------------------

export function getAllSignalSnapshots(
  simulationTime
) {
  const snapshots = {};

  for (const nodeId of Object.keys(ROAD_NODES)) {
    snapshots[nodeId] =
      getSignalSnapshot(
        nodeId,
        simulationTime
      );
  }

  return snapshots;
}