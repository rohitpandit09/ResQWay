import { ROAD_NODES } from "./roadNetwork";

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

export function getSignalSnapshot(
  signalNodeId,
  simulationTime
) {
  const node =
    ROAD_NODES[signalNodeId];

  if (!node) {
    return null;
  }

  const cycleTime =
    simulationTime %
    SIGNAL_CYCLE_SECONDS;

  let elapsed = 0;

  for (const phase of SIGNAL_PHASES) {
    if (
      cycleTime <
      elapsed + phase.duration
    ) {
      const remaining =
        elapsed +
        phase.duration -
        cycleTime;

      return {
        signalId:
          node.signal.id,

        controller:
          node.signal.controller,

        phase: phase.phase,

        phaseDuration:
          phase.duration,

        horizontalState:
          phase.horizontal,

        verticalState:
          phase.vertical,

        remainingPhaseSeconds:
          remaining,

        cycleTime,

        state:
          phase.horizontal ===
          "GREEN"
            ? "GREEN"
            : phase.vertical ===
              "GREEN"
            ? "GREEN"
            : "YELLOW",
      };
    }

    elapsed += phase.duration;
  }

  return {
    signalId: node.signal.id,
    controller:
      node.signal.controller,

    phase: 0,

    phaseDuration: 18,

    horizontalState: "GREEN",

    verticalState: "RED",

    remainingPhaseSeconds: 18,

    cycleTime: 0,

    state: "GREEN",
  };
}

export function getMovementDirection(
  fromNodeId,
  toNodeId
) {
  const from =
    ROAD_NODES[fromNodeId];

  const to =
    ROAD_NODES[toNodeId];

  if (!from || !to) {
    return null;
  }

  if (from.row === to.row) {
    return "HORIZONTAL";
  }

  if (from.column === to.column) {
    return "VERTICAL";
  }

  return null;
}

export function getMovementSignalState(
  signalNodeId,
  fromNodeId,
  toNodeId,
  simulationTime
) {
  const snapshot =
    getSignalSnapshot(
      signalNodeId,
      simulationTime
    );

  if (!snapshot) {
    return "RED";
  }

  const direction =
    getMovementDirection(
      fromNodeId,
      toNodeId
    );

  if (direction === "HORIZONTAL") {
    return snapshot.horizontalState;
  }

  if (direction === "VERTICAL") {
    return snapshot.verticalState;
  }

  return "RED";
}

export function canVehicleProceed(
  signalNodeId,
  fromNodeId,
  toNodeId,
  simulationTime
) {
  return (
    getMovementSignalState(
      signalNodeId,
      fromNodeId,
      toNodeId,
      simulationTime
    ) === "GREEN"
  );
}