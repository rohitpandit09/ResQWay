// Backend/src/greenCorridor/testGreenCorridor.js

import {
    GreenCorridorEngine,
    GREEN_CORRIDOR_STATUS
} from "./greenCorridorEngine.js";


console.log(
    "\n========== GREEN CORRIDOR ENGINE TEST ==========\n"
);


// --------------------------------------------------
// CREATE ENGINE
// --------------------------------------------------

const engine =
    new GreenCorridorEngine();


// --------------------------------------------------
// MOCK EFFECTIVE ETA SNAPSHOT
// --------------------------------------------------

const etaSnapshot = {

    ambulanceId:
        "AMB-GC-001",

    currentNode:
        "INT-01",

    nextNode:
        "INT-02",

    totalEffectiveETA:
        30,

    intersections: [

        {
            intersectionId:
                "INT-02",

            fromNode:
                "INT-01",

            travelETA:
                6,

            signalDelay:
                0,

            effectiveETA:
                6,

            signalState:
                "GREEN",

            signalPhase:
                "NORTH_SOUTH_GREEN",

            movement:
                "NORTH"

        },

        {

            intersectionId:
                "INT-03",

            fromNode:
                "INT-02",

            travelETA:
                18,

            signalDelay:
                0,

            effectiveETA:
                18,

            signalState:
                "GREEN",

            signalPhase:
                "EAST_WEST_GREEN",

            movement:
                "EAST"

        },

        {

            intersectionId:
                "INT-04",

            fromNode:
                "INT-03",

            travelETA:
                30,

            signalDelay:
                0,

            effectiveETA:
                30,

            signalState:
                "GREEN",

            signalPhase:
                "NORTH_SOUTH_GREEN",

            movement:
                "SOUTH"

        }

    ]

};


// --------------------------------------------------
// TEST 1
// ETA CLASSIFICATION
// --------------------------------------------------

console.log(
    "========== TEST 1: ETA CLASSIFICATION =========="
);


const emergencyStatus =
    engine.getStatusFromETA(5);


const prepareStatus =
    engine.getStatusFromETA(15);


const normalStatus =
    engine.getStatusFromETA(30);


console.log(
    "5s  →",
    emergencyStatus
);

console.log(
    "15s →",
    prepareStatus
);

console.log(
    "30s →",
    normalStatus
);


if (
    emergencyStatus !==
    GREEN_CORRIDOR_STATUS
        .EMERGENCY_PRIORITY
) {

    throw new Error(
        "5 second ETA should be EMERGENCY_PRIORITY."
    );

}


if (
    prepareStatus !==
    GREEN_CORRIDOR_STATUS
        .PREPARE
) {

    throw new Error(
        "15 second ETA should be PREPARE."
    );

}


if (
    normalStatus !==
    GREEN_CORRIDOR_STATUS
        .NORMAL
) {

    throw new Error(
        "30 second ETA should be NORMAL."
    );

}


console.log(
    "✅ ETA classification test passed."
);


// --------------------------------------------------
// TEST 2
// GENERATE CORRIDOR
// --------------------------------------------------

console.log(
    "\n========== TEST 2: GENERATE CORRIDOR =========="
);


const corridor =
    engine.generateCorridor(
        etaSnapshot
    );


console.log(
    corridor
);


if (
    corridor.ambulanceId !==
    "AMB-GC-001"
) {

    throw new Error(
        "Ambulance ID is incorrect."
    );

}


if (
    corridor.intersections.length !==
    3
) {

    throw new Error(
        "Expected 3 corridor intersections."
    );

}


console.log(
    "Corridor route:"
);


for (
    const item
    of corridor.intersections
) {

    console.log(

        `${item.intersectionId} | ` +
        `ETA: ${item.eta}s | ` +
        `Movement: ${item.movement} | ` +
        `Status: ${item.status} | ` +
        `Action: ${item.recommendedAction}`

    );

}


console.log(
    "✅ Corridor generation test passed."
);


// --------------------------------------------------
// TEST 3
// MOVING CORRIDOR
// --------------------------------------------------

console.log(
    "\n========== TEST 3: MOVING CORRIDOR =========="
);


// Create a more realistic snapshot
// where ambulance is very close to INT-02.

const movingEtaSnapshot = {

    ...etaSnapshot,

    intersections: [

        {

            ...etaSnapshot.intersections[0],

            effectiveETA:
                6

        },

        {

            ...etaSnapshot.intersections[1],

            effectiveETA:
                18

        },

        {

            ...etaSnapshot.intersections[2],

            effectiveETA:
                30

        }

    ]

};


const movingCorridor =
    engine.getSnapshot(

        movingEtaSnapshot,

        "INT-01"

    );


console.log(
    "\n🚑 Before INT-02:"
);


for (
    const item
    of movingCorridor.intersections
) {

    console.log(

        `${item.intersectionId} → ${item.status}`

    );

}


if (
    movingCorridor
        .intersections[0]
        .status !==
    GREEN_CORRIDOR_STATUS
        .EMERGENCY_PRIORITY
) {

    throw new Error(
        "INT-02 should have emergency priority."
    );

}


if (
    movingCorridor
        .intersections[1]
        .status !==
    GREEN_CORRIDOR_STATUS
        .PREPARE
) {

    throw new Error(
        "INT-03 should be PREPARE."
    );

}


if (
    movingCorridor
        .intersections[2]
        .status !==
    GREEN_CORRIDOR_STATUS
        .NORMAL
) {

    throw new Error(
        "INT-04 should be NORMAL."
    );

}


console.log(
    "✅ Initial moving corridor test passed."
);


// --------------------------------------------------
// TEST 4
// AMBULANCE PASSES INT-02
// --------------------------------------------------

console.log(
    "\n========== TEST 4: AMBULANCE PASSES INT-02 =========="
);


const afterInt02 =
    engine.getSnapshot(

        movingEtaSnapshot,

        "INT-03"

    );


console.log(
    "\n🚑 Ambulance has passed INT-02:"
);


for (
    const item
    of afterInt02.intersections
) {

    console.log(

        `${item.intersectionId} → ${item.status}`

    );

}


if (
    afterInt02
        .intersections[0]
        .status !==
    GREEN_CORRIDOR_STATUS
        .RELEASE
) {

    throw new Error(
        "INT-02 should be RELEASE after ambulance passes it."
    );

}


console.log(
    "✅ Passed-intersection release test passed."
);


// --------------------------------------------------
// TEST 5
// PRIORITY INTERSECTION
// --------------------------------------------------

console.log(
    "\n========== TEST 5: PRIORITY INTERSECTION =========="
);


const priority =
    engine.getPriorityIntersection(
        movingCorridor
    );


console.log(
    priority
);


if (
    !priority ||
    priority.intersectionId !==
    "INT-02"
) {

    throw new Error(
        "INT-02 should be the active priority intersection."
    );

}


console.log(
    "✅ Priority intersection test passed."
);


// --------------------------------------------------
// TEST 6
// PREPARE INTERSECTIONS
// --------------------------------------------------

console.log(
    "\n========== TEST 6: PREPARE INTERSECTIONS =========="
);


const prepare =
    engine.getPrepareIntersections(
        movingCorridor
    );


console.log(
    prepare.map(
        item =>
            item.intersectionId
    )
);


if (
    prepare.length !==
    1
) {

    throw new Error(
        "Expected exactly one PREPARE intersection."
    );

}


if (
    prepare[0].intersectionId !==
    "INT-03"
) {

    throw new Error(
        "INT-03 should be the PREPARE intersection."
    );

}


console.log(
    "✅ Prepare intersection test passed."
);


// --------------------------------------------------
// FINAL RESULT
// --------------------------------------------------

console.log(
    "\n=============================================="
);

console.log(
    "🟢🚑 Green Corridor Engine test passed."
);

console.log(
    "==============================================\n"
);