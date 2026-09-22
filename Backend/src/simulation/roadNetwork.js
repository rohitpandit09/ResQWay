// Backend/src/simulation/roadNetwork.js

// --------------------------------------------------
// ROAD COORDINATES
// --------------------------------------------------
// These are the same coordinates used by the frontend
// 3D simulation, but backend only needs X/Z values.
//
// X → left/right
// Z → forward/backward
// --------------------------------------------------

export const ROAD_X_POSITIONS = [-46, -10, 17, 52];
export const ROAD_Z_POSITIONS = [44, 15, -22, -52];


// --------------------------------------------------
// NODE IDS
// --------------------------------------------------

const ROWS = ["A", "B", "C", "D"];


// --------------------------------------------------
// BUILD ROAD NODES
// --------------------------------------------------

export const ROAD_NODES = {};

for (let row = 0; row < ROWS.length; row++) {
  for (let col = 0; col < ROAD_X_POSITIONS.length; col++) {
    const id = `${ROWS[row]}${col + 1}`;

    ROAD_NODES[id] = {
      id,

      row,
      column: col,

      position: {
        x: ROAD_X_POSITIONS[col],
        z: ROAD_Z_POSITIONS[row],
      },

      signal: {
        id: `ATCS-${id}`,
        controller: "ICCC_ATCS",

        state: "RED",
        phase: 0,

        cycleSeconds: 42,
      },
    };
  }
}


// --------------------------------------------------
// BUILD CONNECTIONS
// --------------------------------------------------
// Each intersection connects to adjacent
// horizontal / vertical intersections.
// --------------------------------------------------

export const ROAD_CONNECTIONS = {};

for (const nodeId of Object.keys(ROAD_NODES)) {
  ROAD_CONNECTIONS[nodeId] = [];
}

for (let row = 0; row < ROWS.length; row++) {
  for (let col = 0; col < ROAD_X_POSITIONS.length; col++) {
    const currentId = `${ROWS[row]}${col + 1}`;

    // Left
    if (col > 0) {
      ROAD_CONNECTIONS[currentId].push(
        `${ROWS[row]}${col}`
      );
    }

    // Right
    if (col < ROAD_X_POSITIONS.length - 1) {
      ROAD_CONNECTIONS[currentId].push(
        `${ROWS[row]}${col + 2}`
      );
    }

    // Up
    if (row > 0) {
      ROAD_CONNECTIONS[currentId].push(
        `${ROWS[row - 1]}${col + 1}`
      );
    }

    // Down
    if (row < ROWS.length - 1) {
      ROAD_CONNECTIONS[currentId].push(
        `${ROWS[row + 1]}${col + 1}`
      );
    }
  }
}


// --------------------------------------------------
// EMERGENCY ROUTES
// --------------------------------------------------

export const AMBULANCE_START_NODE = "A1";

export const CLIENT_NODE = "C2";

export const HOSPITAL_NODE = "A4";


// Ambulance → User
export const EMERGENCY_ROUTE_TO_CLIENT = [
  "A1",
  "A2",
  "B2",
  "C2",
];


// User → Hospital
export const EMERGENCY_ROUTE_TO_HOSPITAL = [
  "C2",
  "C3",
  "D3",
  "D4",
  "C4",
  "B4",
  "A4",
];


// Complete emergency journey
export const FULL_EMERGENCY_ROUTE = [
  ...EMERGENCY_ROUTE_TO_CLIENT,
  ...EMERGENCY_ROUTE_TO_HOSPITAL.slice(1),
];


// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

export function getRoadNode(nodeId) {
  return ROAD_NODES[nodeId] || null;
}


export function getRoadNeighbors(nodeId) {
  return ROAD_CONNECTIONS[nodeId] || [];
}


export function getNodePosition(nodeId) {
  const node = ROAD_NODES[nodeId];

  if (!node) {
    return null;
  }

  return {
    x: node.position.x,
    z: node.position.z,
  };
}


// --------------------------------------------------
// DISTANCE BETWEEN TWO NODES
// --------------------------------------------------

export function getDistanceBetweenNodes(fromNodeId, toNodeId) {
  const fromNode = ROAD_NODES[fromNodeId];
  const toNode = ROAD_NODES[toNodeId];

  if (!fromNode || !toNode) {
    return 0;
  }

  const dx =
    toNode.position.x -
    fromNode.position.x;

  const dz =
    toNode.position.z -
    fromNode.position.z;

  return Math.sqrt(
    dx * dx +
    dz * dz
  );
}


// --------------------------------------------------
// ROUTE DISTANCE
// --------------------------------------------------

export function getRouteDistance(route) {
  if (!route || route.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += getDistanceBetweenNodes(
      route[i],
      route[i + 1]
    );
  }

  return totalDistance;
}


// --------------------------------------------------
// ROUTE VALIDATION
// --------------------------------------------------

export function isValidRoute(route) {
  if (!Array.isArray(route) || route.length === 0) {
    return false;
  }

  for (const nodeId of route) {
    if (!ROAD_NODES[nodeId]) {
      return false;
    }
  }

  for (let i = 0; i < route.length - 1; i++) {
    const current = route[i];
    const next = route[i + 1];

    if (!ROAD_CONNECTIONS[current].includes(next)) {
      return false;
    }
  }

  return true;
}