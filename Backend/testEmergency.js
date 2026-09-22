import {
  createEmergencySession,
  startEmergencySession,
  getEmergencySession,
} from "./src/emergency/emergencyService.js";


// -----------------------------------------------
// CREATE CALL
// -----------------------------------------------

const session =
  createEmergencySession({
    callerId: "USER-001",

    driverId: "DRIVER-001",

    callerNode: "C2",
  });


console.log(
  "\nCREATED SESSION:\n",
  session
);


// -----------------------------------------------
// START EMERGENCY
// -----------------------------------------------

startEmergencySession(
  session.emergencyId
);


// -----------------------------------------------
// CHECK SESSION
// -----------------------------------------------

const activeSession =
  getEmergencySession(
    session.emergencyId
  );


console.log(
  "\nACTIVE SESSION:\n",
  activeSession
);


// -----------------------------------------------
// KEEP PROCESS ALIVE
// -----------------------------------------------

setTimeout(() => {
  console.log(
    "\nTest finished."
  );

  process.exit(0);

}, 5000);