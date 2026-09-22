// Backend/testLiveSocket.js

import { io } from "socket.io-client";


// ==================================================
// CONFIG
// ==================================================

const API_URL =
  "http://localhost:3000";

const SOCKET_URL =
  "http://localhost:3000";


// ==================================================
// CREATE EMERGENCY
// ==================================================

async function createEmergency() {
  const response =
    await fetch(
      `${API_URL}/api/emergencies`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          callerId:
            "USER-001",

          driverId:
            "DRIVER-001",

          callerNode:
            "C2",
        }),
      }
    );


  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Emergency creation failed: ${errorText}`
    );
  }


  return response.json();
}


// ==================================================
// MAIN
// ==================================================

async function main() {
  console.log(
    "\n[TEST] Creating fresh emergency..."
  );


  // -----------------------------------------------
  // CREATE FRESH EMERGENCY
  // -----------------------------------------------

  const result =
    await createEmergency();


  const emergencyId =
    result.emergency.emergencyId;


  console.log(
    `[TEST] Emergency created: ${emergencyId}`
  );


  // -----------------------------------------------
  // CONNECT SOCKET IMMEDIATELY
  // -----------------------------------------------

  const socket =
    io(SOCKET_URL);


  // -----------------------------------------------
  // SOCKET CONNECT
  // -----------------------------------------------

  socket.on(
    "connect",
    () => {

      console.log(
        `\n[TEST SOCKET] Connected: ${socket.id}`
      );


      console.log(
        `[TEST SOCKET] Joining: ${emergencyId}`
      );


      socket.emit(
        "emergency:join",
        {
          emergencyId,

          role:
            "TEST_CLIENT",
        }
      );
    }
  );


  // -----------------------------------------------
  // JOINED
  // -----------------------------------------------

  socket.on(
    "emergency:joined",
    (data) => {

      console.log(
        "\n[JOINED]"
      );

      console.log(data);
    }
  );


  // -----------------------------------------------
  // ERROR
  // -----------------------------------------------

  socket.on(
    "emergency:error",
    (error) => {

      console.error(
        "\n[EMERGENCY ERROR]"
      );

      console.error(error);
    }
  );


  // -----------------------------------------------
  // LIVE TELEMETRY
  // -----------------------------------------------

  socket.on(
    "simulation:state",
    (data) => {

      const telemetry =
        data.telemetry;

      console.clear();


      console.log(
        "=========================================="
      );

      console.log(
        "       RESQWAY LIVE SOCKET TEST"
      );

      console.log(
        "=========================================="
      );


      console.log(
        "Emergency:",
        data.emergencyId
      );


      console.log(
        "Simulation Time:",
        telemetry.simulationTime,
        "sec"
      );


      console.log(
        "Status:",
        telemetry.ambulance.status
      );


      console.log(
        "Speed:",
        telemetry.ambulance.speed,
        "units/s"
      );


      console.log(
        "Position:",
        telemetry.ambulance.position
      );


      console.log(
        "Current Node:",
        telemetry.ambulance.currentNode
      );


      console.log(
        "Next Node:",
        telemetry.ambulance.nextNode
      );


      console.log(
        "Heading:",
        telemetry.ambulance.heading,
        "deg"
      );


      console.log(
        "Distance → User:",
        telemetry.journey.distanceToClient
      );


      console.log(
        "ETA → User:",
        telemetry.journey.etaToClient,
        "sec"
      );


      console.log(
        "Distance → Hospital:",
        telemetry.journey.distanceToHospital
      );


      console.log(
        "ETA → Hospital:",
        telemetry.journey.etaToHospital,
        "sec"
      );


      console.log(
        "Waiting Signal:",
        telemetry.ambulance.waitingForSignal
      );


      console.log(
        "Signal Wait:",
        telemetry.ambulance.signalWaitSeconds,
        "sec"
      );


      console.log(
        "\nCURRENT SIGNAL:"
      );

      console.log(
        telemetry.signals.current
      );


      console.log(
        "\nUPCOMING SIGNALS:"
      );

      console.table(
        telemetry.signals.upcoming
      );
    }
  );


  // -----------------------------------------------
  // CONNECTION ERROR
  // -----------------------------------------------

  socket.on(
    "connect_error",
    (error) => {

      console.error(
        "\n[SOCKET CONNECTION ERROR]"
      );

      console.error(
        error.message
      );
    }
  );


  // -----------------------------------------------
  // DISCONNECT
  // -----------------------------------------------

  socket.on(
    "disconnect",
    (reason) => {

      console.log(
        "\n[SOCKET] Disconnected:",
        reason
      );
    }
  );
}


// ==================================================
// RUN
// ==================================================

main().catch((error) => {

  console.error(
    "\n[TEST FAILED]"
  );

  console.error(
    error
  );

  process.exit(1);
});