// Backend/src/eta/testEffectiveEta.js

import {
    SignalController
} from "../signals/signalController.js";

import {
    SIGNAL_PHASES
} from "../signals/signalPhases.js";

import {
    Ambulance
} from "../ambulance/ambulance.js";

import {
    EffectiveETAEngine
} from "./effectiveEtaEngine.js";


// --------------------------------------------------
// TEST HEADER
// --------------------------------------------------

console.log(
    "\n========== EFFECTIVE ETA ENGINE TEST ==========\n"
);


// --------------------------------------------------
// CREATE SIGNALS
// --------------------------------------------------

const signals =
    new Map();


const intersectionIds = [

    "INT-01",
    "INT-02",
    "INT-03",
    "INT-04"

];


for (
    const intersectionId
    of intersectionIds
) {

    signals.set(

        intersectionId,

        new SignalController(
            intersectionId
        )

    );

}


// --------------------------------------------------
// CREATE ENGINE
// --------------------------------------------------

const effectiveETAEngine =
    new EffectiveETAEngine({

        signals

    });


// --------------------------------------------------
// CREATE AMBULANCE
// --------------------------------------------------

const ambulance =
    new Ambulance({

        id:
            "AMB-EFFECTIVE-001",

        baseNode:
            "INT-01"

    });


// --------------------------------------------------
// CONFIGURE ROUTE
// --------------------------------------------------

ambulance.route = [

    "INT-01",
    "INT-02",
    "INT-03",
    "INT-04"

];

ambulance.routeIndex =
    0;

ambulance.currentNode =
    "INT-01";

ambulance.nextNode =
    "INT-02";

ambulance.position =
    60;

ambulance.speed =
    10;

ambulance.targetSpeed =
    14;

ambulance.roadId =
    "ROAD-01";

ambulance.laneId =
    "ROAD-01-FORWARD-1";


const lane =
    effectiveETAEngine
        .etaEngine
        .lanes[
            ambulance.laneId
        ];


ambulance.setLaneLength(
    lane.length
);


// --------------------------------------------------
// TEST 1
// GREEN
// --------------------------------------------------

console.log(
    "========== TEST 1: GREEN =========="
);


const int02Signal =
    signals.get(
        "INT-02"
    );


int02Signal.phase =
    SIGNAL_PHASES.NORTH_SOUTH_GREEN;

int02Signal.remainingSeconds =
    18;


let result =
    effectiveETAEngine
        .calculateIntersectionETA(

            ambulance,

            1

        );


console.log(
    result
);


if (
    result.intersectionId !==
    "INT-02"
) {

    throw new Error(
        "INT-02 was not calculated correctly."
    );

}


if (
    result.travelETA !==
    6
) {

    throw new Error(
        "Travel ETA should be 6 seconds."
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


if (
    result.effectiveETA !==
    6
) {

    throw new Error(
        "Effective ETA should equal travel ETA on green."
    );

}


console.log(
    "✅ Green effective ETA test passed."
);


// --------------------------------------------------
// TEST 2
// RED
// --------------------------------------------------

console.log(
    "\n========== TEST 2: RED =========="
);


int02Signal.phase =
    SIGNAL_PHASES.EAST_WEST_GREEN;

int02Signal.remainingSeconds =
    18;


result =
    effectiveETAEngine
        .calculateIntersectionETA(

            ambulance,

            1

        );


console.log(
    result
);


if (
    result.signalDelay <=
    0
) {

    throw new Error(
        "Red signal must add delay."
    );

}


if (
    result.effectiveETA <=
    result.travelETA
) {

    throw new Error(
        "Effective ETA must be greater than travel ETA on red."
    );

}


console.log(
    "Travel ETA:",
    result.travelETA,
    "seconds"
);

console.log(
    "Signal delay:",
    result.signalDelay,
    "seconds"
);

console.log(
    "Effective ETA:",
    result.effectiveETA,
    "seconds"
);


console.log(
    "✅ Red effective ETA test passed."
);


// --------------------------------------------------
// TEST 3
// ALL UPCOMING INTERSECTIONS
// --------------------------------------------------

console.log(
    "\n========== TEST 3: UPCOMING INTERSECTIONS =========="
);


// INT-02 = RED

int02Signal.phase =
    SIGNAL_PHASES.EAST_WEST_GREEN;

int02Signal.remainingSeconds =
    18;


// INT-03 = GREEN

const int03Signal =
    signals.get(
        "INT-03"
    );


int03Signal.phase =
    SIGNAL_PHASES.EAST_WEST_GREEN;

int03Signal.remainingSeconds =
    18;


// INT-04 = GREEN

const int04Signal =
    signals.get(
        "INT-04"
    );


int04Signal.phase =
    SIGNAL_PHASES.NORTH_SOUTH_GREEN;

int04Signal.remainingSeconds =
    18;


const upcoming =
    effectiveETAEngine
        .calculateUpcomingETAs(
            ambulance
        );


console.log(
    upcoming
);


if (
    upcoming.length !==
    3
) {

    throw new Error(
        "Expected 3 upcoming intersections."
    );

}


// --------------------------------------------------
// EXPECTED ROUTE ORDER
// --------------------------------------------------

const expectedOrder = [

    "INT-02",
    "INT-03",
    "INT-04"

];


for (
    let i = 0;
    i < expectedOrder.length;
    i++
) {

    if (
        upcoming[i].intersectionId !==
        expectedOrder[i]
    ) {

        throw new Error(

            `Route order incorrect at index ${i}. ` +
            `Expected ${expectedOrder[i]}, ` +
            `received ${upcoming[i].intersectionId}.`

        );

    }

}


console.log(
    "ETA values:"
);


for (
    const item
    of upcoming
) {

    console.log(

        `${item.intersectionId} | ` +

        `Travel: ${item.travelETA.toFixed(2)}s | ` +

        `Signal: ${item.signalDelay.toFixed(2)}s | ` +

        `Effective: ${item.effectiveETA.toFixed(2)}s`

    );

}


console.log(
    "✅ Upcoming effective ETA test passed."
);


// --------------------------------------------------
// TEST 4
// ROUTE ORDER
// --------------------------------------------------

console.log(
    "\n========== TEST 4: ROUTE ORDER =========="
);


const priorityOrder =
    effectiveETAEngine
        .getPriorityOrder(
            ambulance
        );


console.log(
    priorityOrder.map(

        item => ({

            intersection:
                item.intersectionId,

            effectiveETA:
                item.effectiveETA

        })

    )
);


const expectedPriorityOrder = [

    "INT-02",
    "INT-03",
    "INT-04"

];


if (
    priorityOrder.length !==
    expectedPriorityOrder.length
) {

    throw new Error(
        "Priority route contains incorrect number of intersections."
    );

}


for (
    let i = 0;
    i < expectedPriorityOrder.length;
    i++
) {

    if (
        priorityOrder[i].intersectionId !==
        expectedPriorityOrder[i]
    ) {

        throw new Error(

            `Priority route order incorrect. ` +
            `Expected ${expectedPriorityOrder[i]}, ` +
            `received ${priorityOrder[i].intersectionId}.`

        );

    }

}


console.log(
    "✅ Route priority order test passed."
);


// --------------------------------------------------
// TEST 5
// ETA VALUES
// --------------------------------------------------

console.log(
    "\n========== TEST 5: ETA VALUES =========="
);


const expectedTravelETAs = [

    6,
    18,
    30

];


const expectedEffectiveETAs = [

    28,
    18,
    30

];


for (
    let i = 0;
    i < upcoming.length;
    i++
) {

    const actualTravelETA =
        upcoming[i].travelETA;


    const actualEffectiveETA =
        upcoming[i].effectiveETA;


    if (
        Math.abs(
            actualTravelETA -
            expectedTravelETAs[i]
        ) > 0.001
    ) {

        throw new Error(

            `${upcoming[i].intersectionId} ` +
            `travel ETA incorrect. ` +
            `Expected ${expectedTravelETAs[i]}, ` +
            `received ${actualTravelETA}.`

        );

    }


    if (
        Math.abs(
            actualEffectiveETA -
            expectedEffectiveETAs[i]
        ) > 0.001
    ) {

        throw new Error(

            `${upcoming[i].intersectionId} ` +
            `effective ETA incorrect. ` +
            `Expected ${expectedEffectiveETAs[i]}, ` +
            `received ${actualEffectiveETA}.`

        );

    }

}


console.log(
    "✅ ETA value validation passed."
);


// --------------------------------------------------
// TEST 6
// COMPLETE SNAPSHOT
// --------------------------------------------------

console.log(
    "\n========== TEST 6: SNAPSHOT =========="
);


const snapshot =
    effectiveETAEngine
        .getSnapshot(
            ambulance
        );


console.log(
    snapshot
);


if (
    snapshot.ambulanceId !==
    "AMB-EFFECTIVE-001"
) {

    throw new Error(
        "Snapshot ambulance ID is incorrect."
    );

}


if (
    snapshot.intersections.length !==
    3
) {

    throw new Error(
        "Snapshot intersection count is incorrect."
    );

}


if (
    snapshot.intersections[0]
        .intersectionId !==
    "INT-02"
) {

    throw new Error(
        "Snapshot route order is incorrect."
    );

}


if (
    snapshot.totalEffectiveETA !==
    30
) {

    throw new Error(
        "Total effective ETA should be 30 seconds."
    );

}


console.log(
    "✅ Effective ETA snapshot test passed."
);


// --------------------------------------------------
// FINAL RESULT
// --------------------------------------------------

console.log(
    "\n=============================================="
);

console.log(
    "⏱️🚦🚑 Effective ETA engine test passed."
);

console.log(
    "==============================================\n"
);