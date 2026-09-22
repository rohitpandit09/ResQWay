// Backend/src/simulation/signalController.js

import {
  ROAD_NODES,
} from "./roadNetwork.js";

import {
  SIGNAL_PHASES,
} from "./signalEngine.js";


// ==================================================
// CONFIGURATION
// ==================================================

const PREEMPTION_CLEARING_SECONDS = 2;

const MIN_EMERGENCY_GREEN_SECONDS = 2;


// ==================================================
// HELPERS
// ==================================================

function getPhaseConfig(phase) {
  return (
    SIGNAL_PHASES.find(
      (item) =>
        item.phase === phase
    ) ||
    SIGNAL_PHASES[0]
  );
}


// ==================================================
// CREATE SINGLE SIGNAL CONTROLLER
// ==================================================

function createSignalController(
  nodeId
) {
  const initialPhase =
    SIGNAL_PHASES[0];


  return {
    nodeId,

    signalId:
      ROAD_NODES[nodeId].signal.id,

    controller:
      ROAD_NODES[nodeId].signal.controller,

    phase:
      initialPhase.phase,

    remainingSeconds:
      initialPhase.duration,

    horizontal:
      initialPhase.horizontal,

    vertical:
      initialPhase.vertical,

    mode:
      "NORMAL",

    priority:
      false,

    priorityDirection:
      null,

    priorityRemainingSeconds:
      0,

    clearingRemainingSeconds:
      0,

    lastAction:
      "NORMAL_CYCLE",
  };
}


// ==================================================
// CREATE ALL SIGNAL CONTROLLERS
// ==================================================

export function createSignalControllers() {
  const controllers = {};


  for (
    const nodeId of
    Object.keys(ROAD_NODES)
  ) {
    controllers[nodeId] =
      createSignalController(
        nodeId
      );
  }


  return controllers;
}


// ==================================================
// APPLY NORMAL PHASE
// ==================================================

function applyPhase(
  controller,
  phase
) {
  const phaseConfig =
    getPhaseConfig(
      phase
    );


  controller.phase =
    phaseConfig.phase;

  controller.remainingSeconds =
    phaseConfig.duration;

  controller.horizontal =
    phaseConfig.horizontal;

  controller.vertical =
    phaseConfig.vertical;

  controller.mode =
    "NORMAL";

  controller.priority =
    false;

  controller.priorityDirection =
    null;

  controller.priorityRemainingSeconds =
    0;

  controller.clearingRemainingSeconds =
    0;

  controller.lastAction =
    "NORMAL_CYCLE";
}


// ==================================================
// ADVANCE NORMAL SIGNAL
// ==================================================

function advanceNormalSignal(
  controller,
  deltaSeconds
) {
  controller.remainingSeconds -=
    deltaSeconds;


  while (
    controller.remainingSeconds <=
    0
  ) {
    let nextPhase =
      controller.phase + 1;


    if (
      nextPhase >=
      SIGNAL_PHASES.length
    ) {
      nextPhase = 0;
    }


    const nextConfig =
      getPhaseConfig(
        nextPhase
      );


    controller.phase =
      nextPhase;

    controller.remainingSeconds +=
      nextConfig.duration;

    controller.horizontal =
      nextConfig.horizontal;

    controller.vertical =
      nextConfig.vertical;

    controller.mode =
      "NORMAL";

    controller.priority =
      false;

    controller.priorityDirection =
      null;

    controller.priorityRemainingSeconds =
      0;

    controller.clearingRemainingSeconds =
      0;

    controller.lastAction =
      `PHASE_TO_${nextPhase}`;
  }
}


// ==================================================
// RELEASE EMERGENCY PRIORITY
// ==================================================

function releaseEmergencyPriority(
  controller
) {
  const direction =
    controller.priorityDirection;


  controller.priority =
    false;

  controller.priorityRemainingSeconds =
    0;

  controller.priorityDirection =
    null;

  controller.clearingRemainingSeconds =
    0;


  // -----------------------------------------------
  // Safe transition through yellow
  // -----------------------------------------------

  if (
    direction ===
    "HORIZONTAL"
  ) {
    controller.phase = 1;

    controller.remainingSeconds =
      3;

    controller.horizontal =
      "YELLOW";

    controller.vertical =
      "RED";
  }

  else if (
    direction ===
    "VERTICAL"
  ) {
    controller.phase = 3;

    controller.remainingSeconds =
      3;

    controller.horizontal =
      "RED";

    controller.vertical =
      "YELLOW";
  }

  else {
    applyPhase(
      controller,
      0
    );
  }


  controller.mode =
    "NORMAL";

  controller.lastAction =
    "EMERGENCY_PRIORITY_RELEASED";
}


// ==================================================
// START CLEARING
// ==================================================

function startClearing(
  controller,
  direction
) {
  controller.mode =
    "CLEARING";

  controller.priority =
    true;

  controller.priorityDirection =
    direction;

  controller.clearingRemainingSeconds =
    PREEMPTION_CLEARING_SECONDS;

  controller.priorityRemainingSeconds =
    PREEMPTION_CLEARING_SECONDS;

  controller.remainingSeconds =
    PREEMPTION_CLEARING_SECONDS;


  if (
    direction ===
    "HORIZONTAL"
  ) {
    controller.horizontal =
      "RED";

    controller.vertical =
      "YELLOW";
  }

  else {
    controller.horizontal =
      "YELLOW";

    controller.vertical =
      "RED";
  }


  controller.lastAction =
    "EMERGENCY_CLEARING";
}


// ==================================================
// ACTIVATE EMERGENCY GREEN
// ==================================================

function activateEmergencyGreen(
  controller,
  direction,
  greenDuration
) {
  const duration =
    Math.max(
      MIN_EMERGENCY_GREEN_SECONDS,
      greenDuration
    );


  controller.mode =
    "EMERGENCY_PRIORITY";

  controller.priority =
    true;

  controller.priorityDirection =
    direction;

  controller.priorityRemainingSeconds =
    duration;

  controller.clearingRemainingSeconds =
    0;


  if (
    direction ===
    "HORIZONTAL"
  ) {
    controller.horizontal =
      "GREEN";

    controller.vertical =
      "RED";

    controller.phase =
      0;
  }

  else {
    controller.horizontal =
      "RED";

    controller.vertical =
      "GREEN";

    controller.phase =
      2;
  }


  // -----------------------------------------------
  // ACTUAL TIMER MANIPULATION
  // -----------------------------------------------

  controller.remainingSeconds =
    duration;

  controller.lastAction =
    "EMERGENCY_GREEN_ACTIVATED";
}


// ==================================================
// APPLY GREEN CORRIDOR REQUEST
// ==================================================

function applyEmergencyRequest(
  controller,
  request,
  deltaSeconds
) {
  // -----------------------------------------------
  // NO ACTIVE EMERGENCY REQUEST
  // -----------------------------------------------

  if (!request) {
    releaseEmergencyIfNeeded(
      controller
    );


    if (
      controller.mode ===
      "NORMAL"
    ) {
      advanceNormalSignal(
        controller,
        deltaSeconds
      );
    }


    return;
  }


  const direction =
    request.direction;


  // ===============================================
  // PREPARED
  // ===============================================

  if (
    request.mode ===
    "PREPARED"
  ) {
    releaseEmergencyIfNeeded(
      controller
    );


    if (
      controller.mode ===
      "NORMAL"
    ) {
      advanceNormalSignal(
        controller,
        deltaSeconds
      );
    }


    return;
  }


  // -----------------------------------------------
// CLEARING
// -----------------------------------------------

if (
  controller.mode ===
  "CLEARING"
) {
  controller.clearingRemainingSeconds =
    Math.max(
      0,
      controller.clearingRemainingSeconds -
        deltaSeconds
    );


  // ---------------------------------------------
  // KEEP ALL EMERGENCY TIMERS SYNCHRONIZED
  // ---------------------------------------------

  controller.priorityRemainingSeconds =
    controller.clearingRemainingSeconds;

  controller.remainingSeconds =
    controller.clearingRemainingSeconds;


  // ---------------------------------------------
  // CLEARING COMPLETE
  // ---------------------------------------------

  if (
    controller.clearingRemainingSeconds <=
    0
  ) {
    activateEmergencyGreen(
      controller,
      direction,
      Math.max(
        request.priorityRemaining || 0,
        MIN_EMERGENCY_GREEN_SECONDS
      )
    );
  }


  return;
}

  // ===============================================
  // EMERGENCY PRIORITY
  // ===============================================

  if (
    request.mode ===
    "EMERGENCY_PRIORITY"
  ) {
    const requestedDuration =
      Math.max(
        MIN_EMERGENCY_GREEN_SECONDS,
        request.priorityRemaining || 0
      );


    // ---------------------------------------------
    // Already in emergency green
    // ---------------------------------------------

    if (
      controller.mode ===
      "EMERGENCY_PRIORITY"
    ) {

      controller.priorityRemainingSeconds =
        requestedDuration;

      controller.remainingSeconds =
        requestedDuration;

      controller.priorityDirection =
        direction;


      if (
        direction ===
        "HORIZONTAL"
      ) {
        controller.horizontal =
          "GREEN";

        controller.vertical =
          "RED";

        controller.phase =
          0;
      }

      else {
        controller.horizontal =
          "RED";

        controller.vertical =
          "GREEN";

        controller.phase =
          2;
      }


      controller.lastAction =
        "EMERGENCY_GREEN_TIMER_UPDATED";


      return;
    }


    // ---------------------------------------------
    // First activation
    // ---------------------------------------------

    activateEmergencyGreen(
      controller,

      direction,

      requestedDuration
    );


    return;
  }


  // ===============================================
  // UNKNOWN MODE
  // ===============================================

  releaseEmergencyIfNeeded(
    controller
  );


  if (
    controller.mode ===
    "NORMAL"
  ) {
    advanceNormalSignal(
      controller,
      deltaSeconds
    );
  }
}


// ==================================================
// RELEASE IF EMERGENCY REQUEST ENDED
// ==================================================

function releaseEmergencyIfNeeded(
  controller
) {
  if (
    controller.mode ===
      "CLEARING" ||

    controller.mode ===
      "EMERGENCY_PRIORITY"
  ) {
    releaseEmergencyPriority(
      controller
    );
  }
}


// ==================================================
// UPDATE ALL SIGNAL CONTROLLERS
// ==================================================

export function updateSignalControllers(
  controllers,
  corridorState,
  deltaSeconds
) {
  for (
    const nodeId of
    Object.keys(
      controllers
    )
  ) {
    const controller =
      controllers[nodeId];


    // ---------------------------------------------
    // Only actual emergency control states should
    // manipulate the physical/simulated timer.
    //
    // PREPARED = do nothing yet.
    // ---------------------------------------------

    const request =
      corridorState?.signals?.find(
        (signal) =>
          signal.nodeId ===
            nodeId &&

          (
            signal.mode ===
              "CLEARING" ||

            signal.mode ===
              "EMERGENCY_PRIORITY"
          )
      );


    applyEmergencyRequest(
      controller,
      request,
      deltaSeconds
    );
  }


  return controllers;
}


// ==================================================
// GET SIGNAL CONTROLLER
// ==================================================

export function getSignalController(
  controllers,
  nodeId
) {
  return (
    controllers?.[nodeId] ||
    null
  );
}


// ==================================================
// GET ALL SIGNAL CONTROLLERS
// ==================================================

export function getAllSignalControllers(
  controllers
) {
  return controllers || {};
}