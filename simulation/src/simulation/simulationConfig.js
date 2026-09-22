import {
  AMBULANCE_START_NODE,
  CLIENT_NODE,
  HOSPITAL_NODE,
  EMERGENCY_ROUTES,
  FULL_EMERGENCY_ROUTE,
  getNode,
} from "./roadNetwork";

export const SIMULATION_CONFIG = {
  ambulance: {
    id: "AMBULANCE_01",

    startNode: AMBULANCE_START_NODE,

    startPosition:
      getNode(AMBULANCE_START_NODE).position,

    status: "IDLE",
  },

  client: {
    id: "CLIENT_01",

    node: CLIENT_NODE,

    position:
      getNode(CLIENT_NODE).position,

    label: "Emergency Location",
  },

  hospital: {
    id: "HOSPITAL_01",

    node: HOSPITAL_NODE,

    position:
      getNode(HOSPITAL_NODE).position,

    label: "Hospital",
  },

  route: {
    toClient: EMERGENCY_ROUTES.toClient,

    toHospital: EMERGENCY_ROUTES.toHospital,

    full: FULL_EMERGENCY_ROUTE,
  },

  signal: {
    controller: "ICCC_ATCS",

    defaultCycleSeconds: 42,
  },
};