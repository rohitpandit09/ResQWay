// Backend/src/ambulance/testAmbulanceSignalController.js

import {
    AmbulanceEngine
} from "./ambulanceEngine.js";

import {
    AmbulanceSignalController
} from "./ambulanceSignalController.js";

import {
    SignalController
} from "../signals/signalController.js";

import {
    SIGNAL_PHASES
} from "../signals/signalPhases.js";


// --------------------------------------------------
// TEST HEADER
// --------------------------------------------------

console.log(
    "\n========== AMBULANCE SIGNAL TEST ==========\n"
);


// --------------------------------------------------
// CREATE SIGNAL CONTROLLERS
// --------------------------------------------------

const signals = new Map();

const intersectionIds = [
    "INT-01",
    "INT-02",
    "INT-03",
    "INT-04"
];


for (const intersectionId of intersectionIds) {

    signals.set(

        intersectionId,

        new SignalController(
            intersectionId
        )

    );

}


// --------------------------------------------------
// CREATE AMBULANCE ENGINE
// --------------------------------------------------

const ambulanceEngine =
    new AmbulanceEngine({signals});


// --------------------------------------------------
// CREATE AMBULANCE
// --------------------------------------------------

const ambulance =
    ambulanceEngine.createAmbulance({

        id: "AMB-SIGNAL-001",

        baseNode: "INT-01"

    });


// --------------------------------------------------
// DISPATCH
// --------------------------------------------------

ambulance.dispatch(
    "INT-02"
);


// --------------------------------------------------
// START ROUTE
// --------------------------------------------------

ambulanceEngine.startClientJourney(

    ambulance,

    [
        "INT-01",
        "INT-02"
    ]

);


// --------------------------------------------------
// CREATE SIGNAL CONTROLLER
// --------------------------------------------------

const ambulanceSignalController =
    new AmbulanceSignalController({

        signals

    });


// --------------------------------------------------
// TEST 1
// NORTH-SOUTH GREEN
// --------------------------------------------------

console.log(
    "========== TEST 1: NORTH-SOUTH GREEN =========="
);


const int02Signal =
    signals.get("INT-02");


int02Signal.phase =
    SIGNAL_PHASES.NORTH_SOUTH_GREEN;

int02Signal.remainingSeconds =
    18;


let decision =
    ambulanceSignalController.evaluate(
        ambulance
    );


console.log(
    decision
);


if (
    decision.action !==
    "PROCEED"
) {

    throw new Error(
        "Ambulance should proceed during NORTH-SOUTH GREEN."
    );

}


console.log(
    "✅ NORTH-SOUTH GREEN test passed."
);


// --------------------------------------------------
// TEST 2
// EAST-WEST GREEN
// --------------------------------------------------

console.log(
    "\n========== TEST 2: EAST-WEST GREEN =========="
);


int02Signal.phase =
    SIGNAL_PHASES.EAST_WEST_GREEN;

int02Signal.remainingSeconds =
    18;


decision =
    ambulanceSignalController.evaluate(
        ambulance
    );


console.log(
    decision
);


if (
    decision.action !==
    "STOP"
) {

    throw new Error(
        "Ambulance should stop during EAST-WEST GREEN."
    );

}


console.log(
    "✅ EAST-WEST GREEN test passed."
);


// --------------------------------------------------
// TEST 3
// NORTH-SOUTH YELLOW
// --------------------------------------------------

console.log(
    "\n========== TEST 3: NORTH-SOUTH YELLOW =========="
);


int02Signal.phase =
    SIGNAL_PHASES.NORTH_SOUTH_YELLOW;

int02Signal.remainingSeconds =
    3;


decision =
    ambulanceSignalController.evaluate(
        ambulance
    );


console.log(
    decision
);


if (
    decision.action !==
    "SLOW_DOWN"
) {

    throw new Error(
        "Ambulance should slow down during NORTH-SOUTH YELLOW."
    );

}


console.log(
    "✅ NORTH-SOUTH YELLOW test passed."
);


// --------------------------------------------------
// TEST 4
// INVALID SIGNAL CONTROLLER
// --------------------------------------------------

console.log(
    "\n========== TEST 4: SIGNAL LOOKUP =========="
);


const missingSignal =
    ambulanceSignalController.getSignalState(

        "INT-99",

        "INT-01",

        "INT-02"

    );


console.log(
    missingSignal
);


if (
    missingSignal.state !==
    "RED"
) {

    throw new Error(
        "Missing signal controller should default to RED."
    );

}


console.log(
    "✅ Missing signal safety test passed."
);


// --------------------------------------------------
// FINAL RESULT
// --------------------------------------------------

console.log(
    "\n=========================================="
);

console.log(
    "🚑 Ambulance signal controller test passed."
);

console.log(
    "==========================================\n"
);