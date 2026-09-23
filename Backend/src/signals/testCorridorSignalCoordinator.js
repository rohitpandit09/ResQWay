// Backend/src/signals/testCorridorSignalCoordinator.js

import {
    SignalController
} from "./signalController.js";

import {
    SIGNAL_PHASES
} from "./signalPhases.js";

import {
    SignalPriorityController
} from "./signalPriorityController.js";

import {
    CorridorSignalCoordinator
} from "./corridorSignalCoordinator.js";

import {
    GREEN_CORRIDOR_STATUS
} from "../greenCorridor/greenCorridorEngine.js";


console.log(
    "\n========== CORRIDOR → SIGNAL INTEGRATION TEST ==========\n"
);


// --------------------------------------------------
// CREATE SIGNAL CONTROLLERS
// --------------------------------------------------

const signal02 =
    new SignalController(
        "INT-02"
    );

const signal03 =
    new SignalController(
        "INT-03"
    );

const signal04 =
    new SignalController(
        "INT-04"
    );


// --------------------------------------------------
// CREATE PRIORITY CONTROLLERS
// --------------------------------------------------

const priority02 =
    new SignalPriorityController(
        signal02
    );

const priority03 =
    new SignalPriorityController(
        signal03
    );

const priority04 =
    new SignalPriorityController(
        signal04
    );


// --------------------------------------------------
// CREATE COORDINATOR
// --------------------------------------------------

const coordinator =
    new CorridorSignalCoordinator({

        defaultPriorityGreenSeconds:
            12

    });


coordinator.registerPriorityController(
    "INT-02",
    priority02
);

coordinator.registerPriorityController(
    "INT-03",
    priority03
);

coordinator.registerPriorityController(
    "INT-04",
    priority04
);


// --------------------------------------------------
// INITIAL SIGNAL STATES
// --------------------------------------------------

signal02.phase =
    SIGNAL_PHASES.EAST_WEST_GREEN;

signal02.remainingSeconds =
    18;


signal03.phase =
    SIGNAL_PHASES.EAST_WEST_GREEN;

signal03.remainingSeconds =
    18;


signal04.phase =
    SIGNAL_PHASES.NORTH_SOUTH_GREEN;

signal04.remainingSeconds =
    18;


// --------------------------------------------------
// CORRIDOR SNAPSHOT
// --------------------------------------------------

const corridor = {

    ambulanceId:
        "AMB-INTEGRATION-001",

    activePriority:
        true,

    priorityIntersection:
        "INT-02",

    intersections: [

        {

            intersectionId:
                "INT-02",

            movement:
                "NORTH",

            eta:
                6,

            status:
                GREEN_CORRIDOR_STATUS
                    .EMERGENCY_PRIORITY

        },

        {

            intersectionId:
                "INT-03",

            movement:
                "EAST",

            eta:
                18,

            status:
                GREEN_CORRIDOR_STATUS
                    .PREPARE

        },

        {

            intersectionId:
                "INT-04",

            movement:
                "SOUTH",

            eta:
                30,

            status:
                GREEN_CORRIDOR_STATUS
                    .NORMAL

        }

    ]

};


// --------------------------------------------------
// TEST 1
// APPLY CORRIDOR
// --------------------------------------------------

console.log(
    "========== TEST 1: APPLY CORRIDOR =========="
);


const result =
    coordinator.applyCorridor(
        corridor
    );


console.log(
    result
);


if (
    !result.success
) {

    throw new Error(
        "Corridor application failed."
    );

}


console.log(
    "Active priority:",
    result.activePriority
);


// --------------------------------------------------
// TEST 2
// INT-02 MUST BECOME PRIORITY
// --------------------------------------------------

console.log(
    "\n========== TEST 2: INT-02 PRIORITY =========="
);


console.log(
    priority02.getState()
);


if (
    priority02.mode !==
    "ACTIVE"
) {

    throw new Error(
        "INT-02 should be ACTIVE."
    );

}


if (
    signal02.phase !==
    SIGNAL_PHASES.NORTH_SOUTH_GREEN
) {

    throw new Error(
        "INT-02 should be NORTH-SOUTH GREEN."
    );

}


if (
    signal02.remainingSeconds !==
    12
) {

    throw new Error(
        "INT-02 should have 12 seconds of priority green."
    );

}


console.log(
    "🚦 INT-02 → NORTH-SOUTH GREEN"
);

console.log(
    "⏱️ Remaining:",
    signal02.remainingSeconds,
    "seconds"
);

console.log(
    "✅ INT-02 priority activation passed."
);


// --------------------------------------------------
// TEST 3
// INT-03 MUST BE PREPARED
// --------------------------------------------------

console.log(
    "\n========== TEST 3: INT-03 PREPARE =========="
);


console.log(
    priority03.getState()
);


if (
    priority03.mode !==
    "PREPARE"
) {

    throw new Error(
        "INT-03 should be PREPARE."
    );

}


if (
    priority03.priorityMovement !==
    "EAST"
) {

    throw new Error(
        "INT-03 priority movement should be EAST."
    );

}


console.log(
    "🚦 INT-03 → PREPARED FOR EAST MOVEMENT"
);

console.log(
    "✅ INT-03 preparation passed."
);


// --------------------------------------------------
// TEST 4
// INT-04 REMAINS NORMAL
// --------------------------------------------------

console.log(
    "\n========== TEST 4: INT-04 NORMAL =========="
);


console.log(
    priority04.getState()
);


if (
    priority04.mode !==
    "NORMAL"
) {

    throw new Error(
        "INT-04 should remain NORMAL."
    );

}


console.log(
    "🚦 INT-04 → NORMAL"
);

console.log(
    "✅ INT-04 normal state passed."
);


// --------------------------------------------------
// TEST 5
// RELEASE INT-02
// --------------------------------------------------

console.log(
    "\n========== TEST 5: RELEASE INT-02 =========="
);


const releaseCorridor = {

    ambulanceId:
        "AMB-INTEGRATION-001",

    activePriority:
        false,

    priorityIntersection:
        null,

    intersections: [

        {

            intersectionId:
                "INT-02",

            movement:
                "NORTH",

            eta:
                0,

            status:
                GREEN_CORRIDOR_STATUS
                    .RELEASE

        },

        {

            intersectionId:
                "INT-03",

            movement:
                "EAST",

            eta:
                8,

            status:
                GREEN_CORRIDOR_STATUS
                    .EMERGENCY_PRIORITY

        },

        {

            intersectionId:
                "INT-04",

            movement:
                "SOUTH",

            eta:
                20,

            status:
                GREEN_CORRIDOR_STATUS
                    .PREPARE

        }

    ]

};


const releaseResult =
    coordinator.applyCorridor(
        releaseCorridor
    );


console.log(
    releaseResult
);


if (
    priority02.mode !==
    "NORMAL"
) {

    throw new Error(
        "INT-02 should return to NORMAL."
    );

}


if (
    priority03.mode !==
    "ACTIVE"
) {

    throw new Error(
        "INT-03 should become ACTIVE."
    );

}


if (
    signal03.phase !==
    SIGNAL_PHASES.EAST_WEST_GREEN
) {

    throw new Error(
        "INT-03 should activate EAST-WEST GREEN."
    );

}


if (
    priority04.mode !==
    "PREPARE"
) {

    throw new Error(
        "INT-04 should become PREPARE."
    );

}


console.log(
    "🚑 Corridor moved from INT-02 → INT-03"
);

console.log(
    "🚦 INT-02 → RELEASE"
);

console.log(
    "🚦 INT-03 → EAST-WEST GREEN"
);

console.log(
    "🚦 INT-04 → PREPARE"
);

console.log(
    "✅ Moving corridor integration passed."
);


// --------------------------------------------------
// TEST 6
// RELEASE ALL
// --------------------------------------------------

console.log(
    "\n========== TEST 6: RELEASE ALL =========="
);


const released =
    coordinator.releaseAllPriority();


console.log(
    released
);


if (
    priority03.mode !==
    "NORMAL"
) {

    throw new Error(
        "INT-03 should return to NORMAL."
    );

}


if (
    priority04.mode !==
    "NORMAL"
) {

    throw new Error(
        "INT-04 should return to NORMAL."
    );

}


if (
    coordinator.activeIntersection !==
    null
) {

    throw new Error(
        "No active priority should remain."
    );

}


console.log(
    "✅ Release-all test passed."
);


// --------------------------------------------------
// FINAL STATE
// --------------------------------------------------

console.log(
    "\n========== FINAL STATE =========="
);


console.log(
    coordinator.getState()
);


// --------------------------------------------------
// FINAL RESULT
// --------------------------------------------------

console.log(
    "\n=============================================="
);

console.log(
    "🚑🟢🚦 Corridor → Signal integration passed."
);

console.log(
    "==============================================\n"
);