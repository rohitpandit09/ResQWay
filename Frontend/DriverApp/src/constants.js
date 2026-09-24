// src/constants.js
// Single source of truth for all backend-derived constants.
// These MUST match exactly what the backend uses.

// ==================================================
// BACKEND URL
// ==================================================

export const BACKEND_URL = "http://localhost:3000";
export const API_BASE = `${BACKEND_URL}/api`;

// ==================================================
// SOCKET.IO EVENTS
// Sourced from: Backend/src/sockets/simulationSocket.js
// ==================================================

export const SOCKET_EVENTS = {
  // Simulation
  SNAPSHOT: "simulation:snapshot",
  STATUS: "simulation:status",
  REQUEST_SNAPSHOT: "simulation:requestSnapshot",

  // Emergency
  EMERGENCY_CREATED: "emergency:created",
  EMERGENCY_UPDATED: "emergency:updated",
  EMERGENCY_REQUEST: "emergency:request",
};

// ==================================================
// AMBULANCE STATES
// Sourced from: Backend/src/ambulance/ambulance.js
// ==================================================

export const AMBULANCE_STATES = {
  IDLE: "IDLE",
  DISPATCHED: "DISPATCHED",
  EN_ROUTE_TO_CLIENT: "EN_ROUTE_TO_CLIENT",
  ARRIVED_AT_CLIENT: "ARRIVED_AT_CLIENT",
  PICKUP: "PICKUP",
  EN_ROUTE_TO_HOSPITAL: "EN_ROUTE_TO_HOSPITAL",
  ARRIVED_AT_HOSPITAL: "ARRIVED_AT_HOSPITAL",
  COMPLETED: "COMPLETED",
};

// ==================================================
// EMERGENCY STATES
// Sourced from: Backend/src/emergency/emergencyService.js
// ==================================================

export const EMERGENCY_STATES = {
  CREATED: "CREATED",
  DISPATCHING: "DISPATCHING",
  DRIVER_ASSIGNED: "DRIVER_ASSIGNED",
  EN_ROUTE_TO_CLIENT: "EN_ROUTE_TO_CLIENT",
  ARRIVED_AT_CLIENT: "ARRIVED_AT_CLIENT",
  PICKUP: "PICKUP",
  EN_ROUTE_TO_HOSPITAL: "EN_ROUTE_TO_HOSPITAL",
  ARRIVED_AT_HOSPITAL: "ARRIVED_AT_HOSPITAL",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

// ==================================================
// GREEN CORRIDOR STATUS
// Sourced from: Backend/src/greenCorridor/greenCorridorEngine.js
// ==================================================

export const GREEN_CORRIDOR_STATUS = {
  EMERGENCY_PRIORITY: "EMERGENCY_PRIORITY",
  PREPARE: "PREPARE",
  NORMAL: "NORMAL",
  RELEASE: "RELEASE",
};

// ==================================================
// SIGNAL PHASES
// Sourced from: Backend/src/signals/signalPhases.js (inferred from signalController.js)
// ==================================================

export const SIGNAL_PHASES = {
  NORTH_SOUTH_GREEN: "NORTH_SOUTH_GREEN",
  NORTH_SOUTH_YELLOW: "NORTH_SOUTH_YELLOW",
  EAST_WEST_GREEN: "EAST_WEST_GREEN",
  EAST_WEST_YELLOW: "EAST_WEST_YELLOW",
};

// ==================================================
// DRIVER STATUS
// Local-only concept — the backend does not currently
// track driver online/offline status.
// This is a frontend-managed state that gates
// whether the driver is available to receive
// emergency dispatches.
// ==================================================

export const DRIVER_STATUS = {
  OFFLINE: "OFFLINE",
  ONLINE: "ONLINE",
  ON_EMERGENCY: "ON_EMERGENCY",
};

// ==================================================
// SIMULATION STATUS
// Sourced from: Backend/src/simulation/simulationEngine.js
// ==================================================

export const SIMULATION_STATUS = {
  STOPPED: "STOPPED",
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
};

// ==================================================
// REST API ENDPOINTS
// Sourced from: Backend/src/emergency/emergencyRoutes.js
// ==================================================

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE}/health`,
  EMERGENCIES: `${API_BASE}/emergencies`,
  EMERGENCY: (id) => `${API_BASE}/emergencies/${id}`,
};

// ==================================================
// ROAD NETWORK NODES
// Sourced from: Backend/src/simulation/simulationRuntime.js
// ==================================================

export const NETWORK_NODES = ["INT-01", "INT-02", "INT-03", "INT-04"];

// ==================================================
// AMBULANCE LABELS
// Human-readable labels for ambulance states
// ==================================================

export const AMBULANCE_STATE_LABELS = {
  [AMBULANCE_STATES.IDLE]: "Waiting",
  [AMBULANCE_STATES.DISPATCHED]: "Dispatched",
  [AMBULANCE_STATES.EN_ROUTE_TO_CLIENT]: "En Route to Patient",
  [AMBULANCE_STATES.ARRIVED_AT_CLIENT]: "Arrived at Patient",
  [AMBULANCE_STATES.PICKUP]: "Patient Pickup",
  [AMBULANCE_STATES.EN_ROUTE_TO_HOSPITAL]: "En Route to Hospital",
  [AMBULANCE_STATES.ARRIVED_AT_HOSPITAL]: "Arrived at Hospital",
  [AMBULANCE_STATES.COMPLETED]: "Trip Complete",
};

// ==================================================
// EMERGENCY STATE LABELS
// ==================================================

export const EMERGENCY_STATE_LABELS = {
  [EMERGENCY_STATES.CREATED]: "Emergency Created",
  [EMERGENCY_STATES.DISPATCHING]: "Dispatching",
  [EMERGENCY_STATES.DRIVER_ASSIGNED]: "Driver Assigned",
  [EMERGENCY_STATES.EN_ROUTE_TO_CLIENT]: "En Route to Patient",
  [EMERGENCY_STATES.ARRIVED_AT_CLIENT]: "Arrived at Patient",
  [EMERGENCY_STATES.PICKUP]: "Patient Pickup",
  [EMERGENCY_STATES.EN_ROUTE_TO_HOSPITAL]: "En Route to Hospital",
  [EMERGENCY_STATES.ARRIVED_AT_HOSPITAL]: "Arrived at Hospital",
  [EMERGENCY_STATES.COMPLETED]: "Completed",
  [EMERGENCY_STATES.CANCELLED]: "Cancelled",
};
