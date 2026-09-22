// Backend/src/sockets/simulationSocket.js

import {
  simulationEvents,
  getSimulation,
} from "../simulation/simulationManager.js";

import {
  buildTelemetry,
} from "../simulation/telemetryEngine.js";


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
    ({ emergencyId, telemetry }) => {

      const room =
        getEmergencyRoom(emergencyId);

      console.log(
        `[SOCKET] Broadcasting telemetry → ${room}`
      );

      io
        .to(room)
        .emit("simulation:state", {
          emergencyId,
          telemetry,
        });
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
      ({ emergencyId, role = "unknown" } = {}) => {

        console.log(
          `[SOCKET] Join request received:`,
          {
            socketId: socket.id,
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

          socket.emit("emergency:error", {
            message:
              "emergencyId is required",
          });

          return;
        }


        // ---------------------------------------
        // Create room
        // ---------------------------------------

        const room =
          getEmergencyRoom(emergencyId);


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
        // Send current simulation state
        // ---------------------------------------

        const simulation =
          getSimulation(emergencyId);


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


        const telemetry =
          buildTelemetry(simulation);


        socket.emit(
          "simulation:state",
          {
            emergencyId,
            telemetry,
          }
        );


        console.log(
          `[SOCKET] Initial telemetry sent → ${socket.id}`
        );
      }
    );


    // ==========================================
    // LEAVE EMERGENCY
    // ==========================================

    socket.on(
      "emergency:leave",
      ({ emergencyId } = {}) => {

        if (!emergencyId) {
          return;
        }


        const room =
          getEmergencyRoom(emergencyId);


        socket.leave(room);


        console.log(
          `[SOCKET] ${socket.id} left ${room}`
        );
      }
    );


    // ==========================================
    // DISCONNECT
    // ==========================================

    socket.on("disconnect", (reason) => {

      console.log(
        `[SOCKET] Disconnected: ${socket.id}`
      );

      console.log(
        `[SOCKET] Reason: ${reason}`
      );
    });
  });
}