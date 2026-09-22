// Backend/src/simulation/greenCorridor.js

import {
  ROAD_NODES,
  getDistanceBetweenNodes,
} from "./roadNetwork.js";

import {
  getMovementDirection,
  getSignalSnapshot,
} from "./signalEngine.js";


// ==================================================
// CONFIGURATION
// ==================================================

export const GREEN_CORRIDOR_LOOKAHEAD = 4;

export const PRIORITY_LEAD_SECONDS = 5;

// Time used to clear conflicting traffic.
export const PREEMPTION_YELLOW_SECONDS = 2;

export const PRIORITY_CLEARANCE_SECONDS = 3;

export const DEFAULT_CORRIDOR_SPEED = 8;


// ==================================================
// INITIAL STATE
// ==================================================

export function createGreenCorridorState() {
  return {
    active: false,

    mode: "NORMAL",

    updatedAt: 0,

    activeSignalId: null,

    signals: [],
  };
}


// ==================================================
// HELPERS
// ==================================================

function getSafeSpeed(speed) {
  if (
    Number.isFinite(speed) &&
    speed > 0
  ) {
    return speed;
  }

  return DEFAULT_CORRIDOR_SPEED;
}


function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}


// ==================================================
// DISTANCE TO ROUTE NODE
// ==================================================

function getDistanceToRouteNode(
  ambulance,
  targetIndex
) {
  if (
    !ambulance ||
    !Array.isArray(ambulance.route)
  ) {
    return 0;
  }

  const route =
    ambulance.route;

  const currentIndex =
    ambulance.routeIndex;


  if (
    targetIndex <= currentIndex
  ) {
    return 0;
  }


  let distance = 0;


  // -----------------------------------------------
  // Remaining current segment
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

    distance +=
      segmentDistance *
      remainingProgress;


    // ---------------------------------------------
    // Important:
    // target is the immediate next node.
    // Current segment already contains the entire
    // remaining distance to that node.
    // ---------------------------------------------

    if (
      targetIndex ===
      currentIndex + 1
    ) {
      return distance;
    }
  }


  // -----------------------------------------------
  // Remaining route segments
  // -----------------------------------------------

  for (
    let index =
      currentIndex + 1;

    index < targetIndex;

    index++
  ) {
    distance +=
      getDistanceBetweenNodes(
        route[index],
        route[index + 1]
      );
  }


  return distance;
}


// ==================================================
// BUILD GREEN CORRIDOR PLAN
// ==================================================

export function calculateGreenCorridorPlan(
  ambulance,
  simulationTime
) {
  if (
    !ambulance ||
    !Array.isArray(
      ambulance.route
    )
  ) {
    return [];
  }


  // -----------------------------------------------
  // No corridor during pickup / completion
  // -----------------------------------------------

  if (
    ambulance.status ===
      "ARRIVED_AT_USER" ||

    ambulance.status ===
      "PATIENT_PICKUP" ||

    ambulance.status ===
      "ARRIVED_AT_HOSPITAL" ||

    ambulance.status ===
      "COMPLETED"
  ) {
    return [];
  }


  const speed =
    getSafeSpeed(
      ambulance.speed
    );


  const route =
    ambulance.route;

  const currentIndex =
    ambulance.routeIndex;


  const results = [];


  // -----------------------------------------------
  // Look ahead
  // -----------------------------------------------

  for (
    let index =
      currentIndex + 1;

    index < route.length &&
    results.length <
      GREEN_CORRIDOR_LOOKAHEAD;

    index++
  ) {
    const nodeId =
      route[index];

    const node =
      ROAD_NODES[nodeId];

    if (!node) {
      continue;
    }


    const fromNode =
      route[index - 1];

    const toNode =
      nodeId;


    const direction =
      getMovementDirection(
        fromNode,
        toNode
      );

    if (!direction) {
      continue;
    }


    // ---------------------------------------------
    // Distance / ETA
    // ---------------------------------------------

    const distance =
      getDistanceToRouteNode(
        ambulance,
        index
      );

    const eta =
      distance /
      speed;


    // ---------------------------------------------
    // Priority window
    // ---------------------------------------------

    const priorityStart =
      simulationTime +
      Math.max(
        0,
        eta -
          PRIORITY_LEAD_SECONDS
      );

    const priorityEnd =
      simulationTime +
      eta +
      PRIORITY_CLEARANCE_SECONDS;


    // ---------------------------------------------
    // Normal signal state
    // ---------------------------------------------

    const normalSignal =
      getSignalSnapshot(
        nodeId,
        simulationTime
      );

    if (!normalSignal) {
      continue;
    }


    const normalState =
      direction ===
      "HORIZONTAL"
        ? normalSignal.horizontal
        : normalSignal.vertical;


    // ---------------------------------------------
    // PRIORITY WINDOW
    // ---------------------------------------------
    //
    // Instead of depending only on an absolute
    // timestamp comparison, directly use the ETA.
    //
    // ETA <= lead time means:
    // "Prepare this signal now."
    //
    // ---------------------------------------------

    const priorityStarted =
      eta <=
      PRIORITY_LEAD_SECONDS;


    let mode =
      "PREPARED";

    let active =
      false;


    let emergencyGreenStart =
      priorityStart;


    // -----------------------------------------------
    // BEFORE PRIORITY WINDOW
    // -----------------------------------------------

    if (
      !priorityStarted
    ) {
      mode =
        "PREPARED";

      active =
        false;
    }


    // -----------------------------------------------
    // PRIORITY WINDOW
    // -----------------------------------------------

    else {
      active =
        true;


      // ---------------------------------------------
      // Required direction already GREEN
      // ---------------------------------------------

      if (
        normalState ===
        "GREEN"
      ) {
        mode =
          "EMERGENCY_PRIORITY";

        emergencyGreenStart =
          simulationTime;
      }


      // ---------------------------------------------
      // Required direction is NOT GREEN
      // ---------------------------------------------

      else {
        emergencyGreenStart =
          simulationTime +
          PREEMPTION_YELLOW_SECONDS;


        // First clear conflicting traffic.
        if (
          eta >
          PREEMPTION_YELLOW_SECONDS
        ) {
          mode =
            "CLEARING";
        }

        // Clearing period already elapsed.
        else {
          mode =
            "EMERGENCY_PRIORITY";
        }
      }
    }


    // -----------------------------------------------
    // TIMERS
    // -----------------------------------------------

    const secondsUntilPriority =
      Math.max(
        0,
        priorityStart -
          simulationTime
      );


    const secondsUntilGreen =
      mode ===
      "CLEARING"
        ? PREEMPTION_YELLOW_SECONDS

        : 0;


    const priorityRemaining =
      active
        ? Math.max(
            0,
            priorityEnd -
              simulationTime
          )

        : 0;


    results.push({
      signalId:
        node.signal.id,

      nodeId,

      controller:
        node.signal.controller,

      direction,

      distanceMeters:
        Number(
          distance.toFixed(2)
        ),

      etaSeconds:
        Number(
          eta.toFixed(2)
        ),

      normalState,

      normalPhase:
        normalSignal.phase,

      normalRemainingSeconds:
        Number(
          normalSignal.remainingSeconds.toFixed(2)
        ),

      priorityStart:
        Number(
          priorityStart.toFixed(2)
        ),

      priorityEnd:
        Number(
          priorityEnd.toFixed(2)
        ),

      secondsUntilPriority:
        Number(
          secondsUntilPriority.toFixed(2)
        ),

      secondsUntilGreen:
        Number(
          secondsUntilGreen.toFixed(2)
        ),

      priorityRemaining:
        Number(
          priorityRemaining.toFixed(2)
        ),

      mode,

      active,
    });
  }


  return results;
}


// ==================================================
// UPDATE GREEN CORRIDOR
// ==================================================

export function updateGreenCorridor(
  previousState,
  ambulance,
  simulationTime
) {
  const signals =
    calculateGreenCorridorPlan(
      ambulance,
      simulationTime
    );


  const activeSignal =
    signals.find(
      (signal) =>
        signal.active
    );


  let mode =
    "NORMAL";


  if (activeSignal) {
    mode =
      activeSignal.mode;
  }

  else if (
    signals.length > 0
  ) {
    mode =
      "PREPARING";
  }


  return {
    active:
      Boolean(activeSignal),

    mode,

    updatedAt:
      simulationTime,

    activeSignalId:
      activeSignal
        ? activeSignal.signalId
        : null,

    signals,
  };
}


// ==================================================
// GET ACTIVE SIGNAL PRIORITY
// ==================================================

export function getActiveSignalPriority(
  corridorState,
  signalNodeId,
  simulationTime
) {
  if (
    !corridorState ||
    !Array.isArray(
      corridorState.signals
    )
  ) {
    return null;
  }


  const signal =
    corridorState.signals.find(
      (item) =>
        item.nodeId ===
        signalNodeId
    );


  if (!signal) {
    return null;
  }


  if (!signal.active) {
    return null;
  }


  if (
    simulationTime <
    signal.priorityStart
  ) {
    return null;
  }


  if (
    simulationTime >
    signal.priorityEnd
  ) {
    return null;
  }


  return signal;
}