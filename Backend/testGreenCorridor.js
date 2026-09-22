// Backend/testGreenCorridor.js

import {
  startSimulation,
  getSimulation,
  stopSimulation,
} from "./src/simulation/simulationManager.js";

import {
  updateGreenCorridor,
} from "./src/simulation/greenCorridor.js";


const emergencyId =
  "EMG-GREEN-CORRIDOR-TEST";


// ==================================================
// START SIMULATION
// ==================================================

startSimulation(
  emergencyId
);


// ==================================================
// MONITOR
// ==================================================

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

      clearInterval(
        monitor
      );

      process.exit(0);
    }


    const corridor =
      updateGreenCorridor(
        simulation.greenCorridor,
        simulation.ambulance,
        simulation.simulationTime
      );


    console.clear();


    console.log(
      "============================================"
    );

    console.log(
      "        RESQWAY GREEN CORRIDOR"
    );

    console.log(
      "============================================"
    );


    console.log(
      "Simulation:",
      simulation.simulationTime.toFixed(1),
      "sec"
    );


    console.log(
      "Ambulance:",
      simulation.ambulance.currentNode,
      "→",
      simulation.ambulance.nextNode
    );


    console.log(
      "Speed:",
      simulation.ambulance.speed.toFixed(2)
    );


    console.log(
      "Status:",
      simulation.ambulance.status
    );


    console.log(
      "\nCORRIDOR MODE:",
      corridor.mode
    );


    console.log(
      "ACTIVE SIGNAL:",
      corridor.activeSignalId
    );


    console.log(
      "\nSIGNAL PLAN:"
    );


    console.table(
      corridor.signals.map(
        (signal) => ({
          signal:
            signal.signalId,

          direction:
            signal.direction,

          distance:
            signal.distanceMeters,

          eta:
            signal.etaSeconds,

          normal:
            signal.normalState,

          mode:
            signal.mode,

          active:
            signal.active,

          priorityIn:
            signal.secondsUntilPriority,

          priorityRemaining:
            signal.priorityRemaining,
        })
      )
    );

  }, 500);


// ==================================================
// STOP AFTER 60 SEC
// ==================================================

setTimeout(() => {

  stopSimulation(
    emergencyId
  );

  clearInterval(
    monitor
  );

  process.exit(0);

}, 60000);