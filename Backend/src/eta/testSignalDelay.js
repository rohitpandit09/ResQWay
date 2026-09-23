// Backend/src/eta/testSignalDelay.js

import {
    SignalController
} from "../signals/signalController.js";

import {
    SIGNAL_PHASES
} from "../signals/signalPhases.js";

import {
    SignalDelayEngine
} from "./signalDelay.js";


// --------------------------------------------------
// TEST HEADER
// --------------------------------------------------

console.log(
    "\n========== SIGNAL DELAY ENGINE TEST ==========\n"
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
        new SignalController(intersectionId)
    );

}


// --------------------------------------------------
// CREATE DELAY ENGINE
// --------------------------------------------------

const delayEngine =
    new SignalDelayEngine({

        signals

    });


// --------------------------------------------------
// TEST INTERSECTION
// --------------------------------------------------

const intersectionId =
    "INT-02";


// Ambulance movement:
//
// INT-01 → INT-02
//
// This is NORTH movement.

const fromNode =
    "INT-01";

const toNode =
    "INT-02";


// --------------------------------------------------
// TEST 1
// GREEN
// --------------------------------------------------

console.log(
    "========== TEST 1: GREEN =========="
);


const signal =
    signals.get(
        intersectionId
    );


signal.phase =
    SIGNAL_PHASES.NORTH_SOUTH_GREEN;

signal.remainingSeconds =
    18;


let result =
    delayEngine.getDelaySnapshot(

        intersectionId,

        fromNode,

        toNode

    );


console.log(
    result
);


if (
    result.state !==
    "GREEN"
) {

    throw new Error(
        "Signal should be GREEN."
    );

}


if (
    result.signalDelay !==
    0
) {

    throw new Error(
        "Green signal should have zero delay."
    );

}


console.log(
    "✅ Green signal test passed."
);


// --------------------------------------------------
// TEST 2
// RED
// --------------------------------------------------

console.log(
    "\n========== TEST 2: RED =========="
);


signal.phase =
    SIGNAL_PHASES.EAST_WEST_GREEN;

signal.remainingSeconds =
    18;


result =
    delayEngine.getDelaySnapshot(

        intersectionId,

        fromNode,

        toNode

    );


console.log(
    result
);


if (
    result.state !==
    "RED"
) {

    throw new Error(
        "Signal should be RED."
    );

}


if (
    result.signalDelay <=
    0
) {

    throw new Error(
        "Red signal should have a positive delay."
    );

}


console.log(
    "Calculated red delay:",
    result.signalDelay,
    "seconds"
);


console.log(
    "✅ Red signal test passed."
);


// --------------------------------------------------
// TEST 3
// YELLOW
// --------------------------------------------------

console.log(
    "\n========== TEST 3: YELLOW =========="
);


signal.phase =
    SIGNAL_PHASES.NORTH_SOUTH_YELLOW;

signal.remainingSeconds =
    3;


result =
    delayEngine.getDelaySnapshot(

        intersectionId,

        fromNode,

        toNode

    );


console.log(
    result
);


if (
    result.state !==
    "YELLOW"
) {

    throw new Error(
        "Signal should be YELLOW."
    );

}


if (
    result.signalDelay <=
    0
) {

    throw new Error(
        "Yellow signal should have a positive transition delay."
    );

}


console.log(
    "Calculated yellow delay:",
    result.signalDelay,
    "seconds"
);


console.log(
    "✅ Yellow signal test passed."
);


// --------------------------------------------------
// TEST 4
// EAST-WEST MOVEMENT
// --------------------------------------------------

console.log(
    "\n========== TEST 4: EAST-WEST MOVEMENT =========="
);


// INT-02 → INT-03 = EAST

const eastFrom =
    "INT-02";

const eastTo =
    "INT-03";


signal.phase =
    SIGNAL_PHASES.EAST_WEST_GREEN;

signal.remainingSeconds =
    18;


result =
    delayEngine.getDelaySnapshot(

        intersectionId,

        eastFrom,

        eastTo

    );


console.log(
    result
);


if (
    result.state !==
    "GREEN"
) {

    throw new Error(
        "East movement should be GREEN during EAST-WEST GREEN."
    );

}


if (
    result.signalDelay !==
    0
) {

    throw new Error(
        "East movement should have zero delay."
    );

}


console.log(
    "✅ East-west movement test passed."
);


// --------------------------------------------------
// TEST 5
// MISSING SIGNAL
// --------------------------------------------------

console.log(
    "\n========== TEST 5: MISSING SIGNAL =========="
);


result =
    delayEngine.getDelaySnapshot(

        "INT-99",

        "INT-01",

        "INT-02"

    );


console.log(
    result
);


if (
    result.signalDelay !==
    0
) {

    throw new Error(
        "Missing signal controller should not add delay."
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
    "🚦⏱️ Signal delay engine test passed."
);

console.log(
    "==========================================\n"
);