// Backend/src/sockets/simulationSocket.js

import {
  simulationEvents,
  getSimulation,
} from "../simulation/simulationManager.js";

import {
  buildTelemetry,
} from "../simulation/telemetryEngine.js";

import {
  buildSimulationSnapshot,
} from "../simulation/simulationSnapshot.js";


// ==================================================
// ROOM NAME
// ==================================================

function getEmergencyRoom(emergencyId) {
  return `emergency:${emergencyId}`;
}


// ==================================================
// SOCKET SETUP
// ==================================================

export function registerSimulationSocket(io) {

  // -----------------------------------------------
  // Listen to simulation updates
  // -----------------------------------------------

  simulationEvents.on(
    "simulation:state",
    ({
      emergencyId,
      telemetry,
      snapshot,
    }) => {

      const room =
        getEmergencyRoom(emergencyId);


      console.log(
        `[SOCKET] Broadcasting simulation state → ${room}`
      );


      io
        .to(room)
        .emit(
          "simulation:state",
          {
            emergencyId,

            telemetry,

            snapshot,
          }
        );
    }
  );


  // -----------------------------------------------
  // Handle connections
  // -----------------------------------------------

  io.on("connection", (socket) => {

    console.log(
      `[SOCKET] Connected: ${socket.id}`
    );


    // ==========================================
    // JOIN EMERGENCY
    // ==========================================

    socket.on(
      "emergency:join",
      ({
        emergencyId,
        role = "unknown",
      } = {}) => {

        console.log(
          `[SOCKET] Join request received:`,
          {
            socketId:
              socket.id,

            emergencyId,

            role,
          }
        );


        // ---------------------------------------
        // Validate emergency ID
        // ---------------------------------------

        if (!emergencyId) {

          console.log(
            `[SOCKET] Join rejected: missing emergencyId`
          );


          socket.emit(
            "emergency:error",
            {
              message:
                "emergencyId is required",
            }
          );


          return;
        }


        // ---------------------------------------
        // Create room
        // ---------------------------------------

        const room =
          getEmergencyRoom(
            emergencyId
          );


        // ---------------------------------------
        // Join room
        // ---------------------------------------

        socket.join(room);


        console.log(
          `[SOCKET] ${socket.id} joined ${room} as ${role}`
        );


        // ---------------------------------------
        // Tell client join was successful
        // ---------------------------------------

        socket.emit(
          "emergency:joined",
          {
            emergencyId,

            role,

            room,
          }
        );


        // ---------------------------------------
        // Get current simulation
        // ---------------------------------------

        const simulation =
          getSimulation(
            emergencyId
          );


        if (!simulation) {

          console.log(
            `[SOCKET] No active simulation found for ${emergencyId}`
          );


          socket.emit(
            "emergency:error",
            {
              message:
                "No active simulation found for this emergency",
            }
          );


          return;
        }


        // ---------------------------------------
        // Build current telemetry
        // ---------------------------------------

        const telemetry =
          buildTelemetry(
            simulation
          );


        // ---------------------------------------
        // Build complete simulation snapshot
        // ---------------------------------------

        const snapshot =
          buildSimulationSnapshot(
            emergencyId,
            simulation
          );


        // ---------------------------------------
        // Send current state immediately
        // ---------------------------------------

        socket.emit(
          "simulation:state",
          {
            emergencyId,

            telemetry,

            snapshot,
          }
        );


        console.log(
          `[SOCKET] Initial simulation snapshot sent → ${socket.id}`
        );
      }
    );


    // ==========================================
    // LEAVE EMERGENCY
    // ==========================================

    socket.on(
      "emergency:leave",
      ({
        emergencyId,
      } = {}) => {

        if (!emergencyId) {
          return;
        }


        const room =
          getEmergencyRoom(
            emergencyId
          );


        socket.leave(room);


        console.log(
          `[SOCKET] ${socket.id} left ${room}`
        );
      }
    );


    // ==========================================
    // DISCONNECT
    // ==========================================

    socket.on(
      "disconnect",
      (reason) => {

        console.log(
          `[SOCKET] Disconnected: ${socket.id}`
        );


        console.log(
          `[SOCKET] Reason: ${reason}`
        );
      }
    );
  });
}