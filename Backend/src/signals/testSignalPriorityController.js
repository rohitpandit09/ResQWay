// Backend/src/signals/testSignalPriorityController.js

import {
    SignalController
} from "./signalController.js";

import {
    SIGNAL_PHASES
} from "./signalPhases.js";

import {
    SignalPriorityController,
    SIGNAL_PRIORITY_MODES
} from "./signalPriorityController.js";


console.log(
    "\n========== SIGNAL PRIORITY CONTROLLER TEST ==========\n"
);


// --------------------------------------------------
// CREATE SIGNAL
// --------------------------------------------------

const signal =
    new SignalController(
        "INT-02"
    );


// --------------------------------------------------
// CREATE PRIORITY CONTROLLER
// --------------------------------------------------

const priorityController =
    new SignalPriorityController(
        signal
    );


// --------------------------------------------------
// TEST 1
// NORMAL
// --------------------------------------------------

console.log(
    "========== TEST 1: NORMAL =========="
);


console.log(
    priorityController.getState()
);


if (
    priorityController.mode !==
    SIGNAL_PRIORITY_MODES.NORMAL
) {

    throw new Error(
        "Initial mode should be NORMAL."
    );

}


console.log(
    "✅ Normal mode test passed."
);


// --------------------------------------------------
// TEST 2
// PREPARE NORTH
// --------------------------------------------------

console.log(
    "\n========== TEST 2: PREPARE NORTH =========="
);


const prepareResult =
    priorityController.preparePriority(
        "NORTH",
        12
    );


console.log(
    prepareResult
);


if (
    !prepareResult.success
) {

    throw new Error(
        "Priority preparation failed."
    );

}


if (
    priorityController.mode !==
    SIGNAL_PRIORITY_MODES.PREPARE
) {

    throw new Error(
        "Controller should be in PREPARE mode."
    );

}


if (
    priorityController.priorityMovement !==
    "NORTH"
) {

    throw new Error(
        "Priority movement should be NORTH."
    );

}


console.log(
    "✅ Prepare priority test passed."
);


// --------------------------------------------------
// TEST 3
// ACTIVATE NORTH PRIORITY
// --------------------------------------------------

console.log(
    "\n========== TEST 3: ACTIVATE NORTH PRIORITY =========="
);


// Current signal starts NORTH-SOUTH GREEN.

signal.phase =
    SIGNAL_PHASES
        .NORTH_SOUTH_GREEN;

signal.remainingSeconds =
    5;


const activateResult =
    priorityController
        .activatePriority();


console.log(
    activateResult
);


if (
    !activateResult.success
) {

    throw new Error(
        "Priority activation failed."
    );

}


if (
    signal.phase !==
    SIGNAL_PHASES
        .NORTH_SOUTH_GREEN
) {

    throw new Error(
        "North movement should remain NORTH-SOUTH GREEN."
    );

}


if (
    signal.remainingSeconds !==
    12
) {

    throw new Error(
        "Priority green should be extended to 12 seconds."
    );

}


if (
    priorityController.mode !==
    SIGNAL_PRIORITY_MODES.ACTIVE
) {

    throw new Error(
        "Controller should be ACTIVE."
    );

}


console.log(
    "🚦 NORTH-SOUTH GREEN"
);

console.log(
    "⏱️ Priority green:",
    signal.remainingSeconds,
    "seconds"
);

console.log(
    "✅ North priority activation passed."
);


// --------------------------------------------------
// TEST 4
// EAST-WEST PRIORITY
// --------------------------------------------------

console.log(
    "\n========== TEST 4: EAST-WEST PRIORITY =========="
);


// Start with north-south green.

signal.phase =
    SIGNAL_PHASES
        .NORTH_SOUTH_GREEN;

signal.remainingSeconds =
    10;


// Release previous priority.

priorityController.releasePriority();


// Prepare east-west.

const eastPrepare =
    priorityController.preparePriority(
        "EAST",
        15
    );


if (
    !eastPrepare.success
) {

    throw new Error(
        "East priority preparation failed."
    );

}


const eastActivate =
    priorityController
        .activatePriority();


console.log(
    eastActivate
);


if (
    signal.phase !==
    SIGNAL_PHASES
        .EAST_WEST_GREEN
) {

    throw new Error(
        "East movement should activate EAST-WEST GREEN."
    );

}


if (
    signal.remainingSeconds !==
    15
) {

    throw new Error(
        "East priority should receive 15 seconds."
    );

}


console.log(
    "🚦 EAST-WEST GREEN"
);

console.log(
    "⏱️ Priority green:",
    signal.remainingSeconds,
    "seconds"
);

console.log(
    "✅ East-west priority activation passed."
);


// --------------------------------------------------
// TEST 5
// RELEASE
// --------------------------------------------------

console.log(
    "\n========== TEST 5: RELEASE PRIORITY =========="
);


const releaseResult =
    priorityController
        .releasePriority();


console.log(
    releaseResult
);


if (
    !releaseResult.success
) {

    throw new Error(
        "Priority release failed."
    );

}


if (
    priorityController.mode !==
    SIGNAL_PRIORITY_MODES.NORMAL
) {

    throw new Error(
        "Controller should return to NORMAL mode."
    );

}


if (
    priorityController.priorityMovement !==
    null
) {

    throw new Error(
        "Priority movement should be cleared."
    );

}


console.log(
    "✅ Priority release test passed."
);


// --------------------------------------------------
// TEST 6
// INVALID MOVEMENT
// --------------------------------------------------

console.log(
    "\n========== TEST 6: INVALID MOVEMENT =========="
);


const invalidResult =
    priorityController.preparePriority(
        "INVALID_DIRECTION",
        10
    );


console.log(
    invalidResult
);


if (
    invalidResult.success
) {

    throw new Error(
        "Invalid movement should not be accepted."
    );

}


console.log(
    "✅ Invalid movement safety test passed."
);


// --------------------------------------------------
// FINAL
// --------------------------------------------------

console.log(
    "\n=============================================="
);

console.log(
    "🚦🟢 Signal Priority Controller test passed."
);

console.log(
    "==============================================\n"
);