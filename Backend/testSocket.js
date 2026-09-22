// Backend/testSocket.js

import { io } from "socket.io-client";


// ==================================================
// CONFIG
// ==================================================

const SOCKET_URL =
  "http://localhost:3000";

const EMERGENCY_ID =
  process.argv[2];


// ==================================================
// VALIDATION
// ==================================================

if (!EMERGENCY_ID) {

  console.log(
    "Usage:"
  );

  console.log(
    "node testSocket.js EMG-XXXXXXXX"
  );

  process.exit(1);
}


// ==================================================
// CONNECT
// ==================================================

const socket =
  io(SOCKET_URL);


// ==================================================
// CONNECTION
// ==================================================

socket.on("connect", () => {

  console.log(
    `[TEST SOCKET] Connected: ${socket.id}`
  );


  console.log(
    `[TEST SOCKET] Joining emergency: ${EMERGENCY_ID}`
  );


  socket.emit(
    "emergency:join",
    {
      emergencyId:
        EMERGENCY_ID,

      role:
        "TEST_CLIENT",
    }
  );
});


// ==================================================
// JOINED
// ==================================================

socket.on(
  "emergency:joined",
  (data) => {

    console.log(
      "\n[JOINED]"
    );

    console.log(data);
  }
);


// ==================================================
// EMERGENCY ERROR
// ==================================================

socket.on(
  "emergency:error",
  (error) => {

    console.error(
      "\n[EMERGENCY ERROR]"
    );

    console.error(error);
  }
);


// ==================================================
// LIVE SIMULATION STATE
// ==================================================

socket.on(
  "simulation:state",
  (data) => {

    const telemetry =
      data.telemetry;


    console.clear();


    console.log(
      "========================================"
    );

    console.log(
      "       RESQWAY SOCKET TELEMETRY"
    );

    console.log(
      "========================================"
    );


    console.log(
      "Emergency:",
      data.emergencyId
    );


    console.log(
      "Simulation:",
      telemetry.simulationTime,
      "sec"
    );


    console.log(
      "Status:",
      telemetry.ambulance.status
    );


    console.log(
      "Speed:",
      telemetry.ambulance.speed
    );


    console.log(
      "Position:",
      telemetry.ambulance.position
    );


    console.log(
      "Current:",
      telemetry.ambulance.currentNode
    );


    console.log(
      "Next:",
      telemetry.ambulance.nextNode
    );


    console.log(
      "ETA User:",
      telemetry.journey.etaToClient
    );


    console.log(
      "ETA Hospital:",
      telemetry.journey.etaToHospital
    );


    console.log(
      "Waiting Signal:",
      telemetry.ambulance.waitingForSignal
    );


    console.log(
      "Signal:",
      telemetry.signals.current
    );
  }
);


// ==================================================
// SOCKET ERROR
// ==================================================

socket.on(
  "connect_error",
  (error) => {

    console.error(
      "[TEST SOCKET] Connection error:",
      error.message
    );
  }
);


// ==================================================
// DISCONNECT
// ==================================================

socket.on(
  "disconnect",
  (reason) => {

    console.log(
      "[TEST SOCKET] Disconnected:",
      reason
    );
  }
);