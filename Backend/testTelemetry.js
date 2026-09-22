import {
  startSimulation,
  getSimulation,
  stopSimulation,
} from "./src/simulation/simulationManager.js";

import {
  buildTelemetry,
} from "./src/simulation/telemetryEngine.js";


const emergencyId =
  "EMG-TELEMETRY-001";


startSimulation(
  emergencyId
);


const monitor =
  setInterval(() => {
    const simulation =
      getSimulation(
        emergencyId
      );


    if (!simulation) {
      console.log(
        "Simulation ended."
      );

      clearInterval(monitor);

      process.exit(0);
    }


    const telemetry =
      buildTelemetry(
        simulation
      );


    console.clear();

    console.log(
      "========================================"
    );

    console.log(
      "       RESQWAY LIVE TELEMETRY"
    );

    console.log(
      "========================================"
    );

    console.log(
      "Simulation Time:",
      telemetry.simulationTime
    );

    console.log(
      "Status:",
      telemetry.ambulance.status
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
      "Speed:",
      telemetry.ambulance.speed,
      "units/s"
    );

    console.log(
      "Heading:",
      telemetry.ambulance.heading,
      "deg"
    );

    console.log(
      "Distance to User:",
      telemetry.journey.distanceToClient
    );

    console.log(
      "ETA to User:",
      telemetry.journey.etaToClient,
      "sec"
    );

    console.log(
      "Distance to Hospital:",
      telemetry.journey.distanceToHospital
    );

    console.log(
      "ETA to Hospital:",
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

  }, 500);


setTimeout(() => {
  stopSimulation(
    emergencyId
  );

  clearInterval(
    monitor
  );

  process.exit(0);

}, 60000);