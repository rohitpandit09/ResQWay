// Backend/src/ambulance/testAmbulanceSignalIntegration.js

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

import {
    AMBULANCE_STATES
} from "./ambulance.js";


// --------------------------------------------------
// TEST HEADER
// --------------------------------------------------

console.log(
    "\n========== AMBULANCE + SIGNAL INTEGRATION TEST ==========\n"
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
// CREATE AMBULANCE ENGINE
// --------------------------------------------------

const ambulanceEngine =
    new AmbulanceEngine({
        signals
    });


// --------------------------------------------------
// CREATE AMBULANCE
// --------------------------------------------------

const ambulance =
    ambulanceEngine.createAmbulance({

        id: "AMB-INTEGRATION-001",

        baseNode: "INT-01"

    });


// --------------------------------------------------
// DISPATCH
// --------------------------------------------------

ambulance.dispatch(
    "INT-02"
);


// --------------------------------------------------
// START CLIENT JOURNEY
// --------------------------------------------------

ambulanceEngine.startClientJourney(

    ambulance,

    [
        "INT-01",
        "INT-02"
    ]

);


// --------------------------------------------------
// GET SIGNAL CONTROLLER
// --------------------------------------------------

const int02Signal =
    signals.get("INT-02");


// --------------------------------------------------
// FORCE RED FOR AMBULANCE
// --------------------------------------------------

/*
 * Ambulance movement:
 *
 * INT-01 → INT-02
 *
 * This is NORTH movement.
 *
 * Therefore EAST-WEST green means
 * NORTH movement is RED.
 */

int02Signal.phase =
    SIGNAL_PHASES.EAST_WEST_GREEN;

int02Signal.remainingSeconds =
    18;


console.log(
    "========== RED SIGNAL TEST =========="
);

console.log(
    "Signal phase:",
    int02Signal.phase
);


// --------------------------------------------------
// APPROACH INTERSECTION
// --------------------------------------------------

let redStopDetected = false;

let previousPosition = 0;


for (
    let second = 1;
    second <= 30;
    second++
) {

    ambulanceEngine.update(1);


    const position =
        ambulance.position;


    console.log(

        `T+${second}s | ` +
        `Position: ${position.toFixed(2)}m | ` +
        `Speed: ${ambulance.speed.toFixed(2)}m/s | ` +
        `Desired: ${ambulance.desiredSpeed.toFixed(2)}m/s | ` +
        `State: ${ambulance.state}`

    );


    /*
     * Once the ambulance reaches the
     * simulated stop line, it should
     * stop moving.
     */

    if (
        ambulance.speed === 0 &&
        position >= 110 &&
        position < 120
    ) {

        redStopDetected = true;

        console.log(
            "\n🛑 Ambulance stopped at red signal."
        );

        break;

    }


    previousPosition =
        position;

}


// --------------------------------------------------
// RED STOP ASSERTION
// --------------------------------------------------

if (!redStopDetected) {

    throw new Error(
        "Ambulance did not stop at the red signal."
    );

}


if (
    ambulance.currentNode !==
    "INT-01"
) {

    throw new Error(
        "Ambulance crossed the red signal."
    );

}


console.log(
    "✅ Red signal stop test passed."
);


// --------------------------------------------------
// GREEN SIGNAL
// --------------------------------------------------

console.log(
    "\n========== GREEN SIGNAL TEST =========="
);


int02Signal.phase =
    SIGNAL_PHASES.NORTH_SOUTH_GREEN;

int02Signal.remainingSeconds =
    18;


console.log(
    "Signal changed to:",
    int02Signal.phase
);


// --------------------------------------------------
// RESUME MOVEMENT
// --------------------------------------------------

let resumedMovement = false;

let reachedIntersection = false;


for (
    let second = 1;
    second <= 20;
    second++
) {

    ambulanceEngine.update(1);


    console.log(

        `GREEN T+${second}s | ` +
        `Node: ${ambulance.currentNode} | ` +
        `Next: ${ambulance.nextNode} | ` +
        `Position: ${ambulance.position.toFixed(2)}m | ` +
        `Speed: ${ambulance.speed.toFixed(2)}m/s | ` +
        `State: ${ambulance.state}`

    );


    if (
        ambulance.speed > 0
    ) {

        resumedMovement = true;

    }


    if (
        ambulance.state ===
        AMBULANCE_STATES.ARRIVED_AT_CLIENT
    ) {

        reachedIntersection = true;

        console.log(
            "\n🚑 Ambulance crossed the intersection."
        );

        break;

    }

}


// --------------------------------------------------
// GREEN ASSERTIONS
// --------------------------------------------------

if (!resumedMovement) {

    throw new Error(
        "Ambulance did not resume movement after green."
    );

}


console.log(
    "✅ Green signal resume test passed."
);


if (!reachedIntersection) {

    throw new Error(
        "Ambulance did not reach the client after green."
    );

}


console.log(
    "✅ Intersection crossing test passed."
);


// --------------------------------------------------
// FINAL RESULT
// --------------------------------------------------

console.log(
    "\n================================================"
);

console.log(
    "🚑🚦 Ambulance + signal integration test passed."
);

console.log(
    "================================================\n"
);