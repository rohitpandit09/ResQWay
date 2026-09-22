import {
  getSignalSnapshot,
  getControlledSignalSnapshot,
} from "./src/simulation/signalEngine.js";


const normal =
  getSignalSnapshot(
    "C2",
    10
  );


console.log(
  "\nNORMAL SIGNAL:"
);

console.log(
  normal
);


// Simulated Green Corridor decision
const corridorState = {
  active: true,

  mode:
    "EMERGENCY_PRIORITY",

  signals: [
    {
      signalId:
        "ATCS-C2",

      nodeId:
        "C2",

      direction:
        "VERTICAL",

      active:
        true,

      priorityRemaining:
        7.5,
    },
  ],
};


const controlled =
  getControlledSignalSnapshot(
    "C2",
    10,
    corridorState
  );


console.log(
  "\nCONTROLLED SIGNAL:"
);

console.log(
  controlled
);