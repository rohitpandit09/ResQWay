// Backend/src/eta/testEtaEngine.js

import {
    ETAEngine
} from "./etaEngine.js";

import {
    Ambulance
} from "../ambulance/ambulance.js";


// --------------------------------------------------
// TEST HEADER
// --------------------------------------------------

console.log(
    "\n========== ETA ENGINE TEST ==========\n"
);


// --------------------------------------------------
// CREATE ETA ENGINE
// --------------------------------------------------

const etaEngine =
    new ETAEngine();


// --------------------------------------------------
// CREATE AMBULANCE
// --------------------------------------------------

const ambulance =
    new Ambulance({

        id: "AMB-ETA-001",

        baseNode: "INT-01"

    });


// --------------------------------------------------
// CONFIGURE AMBULANCE ROUTE
// --------------------------------------------------

ambulance.route = [

    "INT-01",
    "INT-02",
    "INT-03",
    "INT-04"

];

ambulance.routeIndex = 0;

ambulance.currentNode =
    "INT-01";

ambulance.nextNode =
    "INT-02";


// --------------------------------------------------
// CURRENT ROAD
// --------------------------------------------------

ambulance.roadId =
    "ROAD-01";

ambulance.laneId =
    "ROAD-01-FORWARD-1";

ambulance.position =
    60;

ambulance.speed =
    10;

ambulance.targetSpeed =
    14;


// --------------------------------------------------
// GET LANE
// --------------------------------------------------

const lane =
    etaEngine.lanes[
        ambulance.laneId
    ];


if (!lane) {

    throw new Error(
        "Test lane was not found."
    );

}


ambulance.setLaneLength(
    lane.length
);


console.log(
    "========== AMBULANCE STATE =========="
);

console.log({

    position:
        ambulance.position,

    laneLength:
        lane.length,

    speed:
        ambulance.speed,

    currentNode:
        ambulance.currentNode,

    nextNode:
        ambulance.nextNode,

    route:
        ambulance.route

});


// --------------------------------------------------
// TEST 1
// CURRENT ROAD DISTANCE
// --------------------------------------------------

console.log(
    "\n========== TEST 1: CURRENT ROAD DISTANCE =========="
);


const remainingDistance =
    etaEngine.getCurrentRoadRemainingDistance(
        ambulance
    );


console.log(
    "Remaining distance:",
    remainingDistance,
    "metres"
);


const expectedDistance =
    lane.length -
    ambulance.position;


if (
    Math.abs(
        remainingDistance -
        expectedDistance
    ) > 0.001
) {

    throw new Error(
        "Current road distance calculation is incorrect."
    );

}


console.log(
    "✅ Current road distance test passed."
);


// --------------------------------------------------
// TEST 2
// EFFECTIVE SPEED
// --------------------------------------------------

console.log(
    "\n========== TEST 2: EFFECTIVE SPEED =========="
);


const effectiveSpeed =
    etaEngine.getEffectiveSpeed(
        ambulance
    );


console.log(
    "Effective speed:",
    effectiveSpeed,
    "m/s"
);


if (
    effectiveSpeed !== 10
) {

    throw new Error(
        "Effective speed calculation is incorrect."
    );

}


console.log(
    "✅ Effective speed test passed."
);


// --------------------------------------------------
// TEST 3
// CURRENT ROAD ETA
// --------------------------------------------------

console.log(
    "\n========== TEST 3: CURRENT ROAD ETA =========="
);


const currentRoadETA =
    etaEngine.calculateCurrentRoadETA(
        ambulance
    );


console.log(
    "Current road ETA:",
    currentRoadETA.toFixed(2),
    "seconds"
);


const expectedCurrentETA =
    remainingDistance /
    effectiveSpeed;


if (
    Math.abs(
        currentRoadETA -
        expectedCurrentETA
    ) > 0.001
) {

    throw new Error(
        "Current road ETA calculation is incorrect."
    );

}


console.log(
    "✅ Current road ETA test passed."
);


// --------------------------------------------------
// TEST 4
// NEXT INTERSECTION ETA
// --------------------------------------------------

console.log(
    "\n========== TEST 4: NEXT INTERSECTION ETA =========="
);


const nextIntersection =
    etaEngine.calculateNextIntersectionETA(
        ambulance
    );


console.log(
    nextIntersection
);


if (
    nextIntersection.intersectionId !==
    "INT-02"
) {

    throw new Error(
        "Next intersection is incorrect."
    );

}


if (
    Math.abs(
        nextIntersection.eta -
        expectedCurrentETA
    ) > 0.001
) {

    throw new Error(
        "Next intersection ETA is incorrect."
    );

}


console.log(
    "✅ Next intersection ETA test passed."
);


// --------------------------------------------------
// TEST 5
// UPCOMING INTERSECTIONS
// --------------------------------------------------

console.log(
    "\n========== TEST 5: UPCOMING INTERSECTIONS =========="
);


const upcoming =
    etaEngine.calculateUpcomingIntersectionETAs(
        ambulance
    );


console.log(
    upcoming
);


if (
    upcoming.length !== 3
) {

    throw new Error(
        `Expected 3 upcoming intersections. Received ${upcoming.length}.`
    );

}


if (
    upcoming[0].intersectionId !==
    "INT-02"
) {

    throw new Error(
        "First upcoming intersection is incorrect."
    );

}


if (
    upcoming[1].intersectionId !==
    "INT-03"
) {

    throw new Error(
        "Second upcoming intersection is incorrect."
    );

}


if (
    upcoming[2].intersectionId !==
    "INT-04"
) {

    throw new Error(
        "Third upcoming intersection is incorrect."
    );

}


console.log(
    "✅ Upcoming intersection test passed."
);


// --------------------------------------------------
// TEST 6
// ETA ORDER
// --------------------------------------------------

console.log(
    "\n========== TEST 6: ETA ORDER =========="
);


for (
    let i = 1;
    i < upcoming.length;
    i++
) {

    if (
        upcoming[i].eta <=
        upcoming[i - 1].eta
    ) {

        throw new Error(
            "ETA values are not increasing correctly."
        );

    }

}


console.log(
    "ETA sequence:"
);


for (
    const item
    of upcoming
) {

    console.log(

        `${item.intersectionId} → ` +
        `${item.eta.toFixed(2)} seconds`

    );

}


console.log(
    "✅ ETA ordering test passed."
);


// --------------------------------------------------
// TEST 7
// COMPLETE ROUTE ETA
// --------------------------------------------------

console.log(
    "\n========== TEST 7: COMPLETE ROUTE ETA =========="
);


const routeETA =
    etaEngine.calculateRouteETA(
        ambulance
    );


console.log(
    routeETA
);


if (
    routeETA.totalETA <= 0
) {

    throw new Error(
        "Total route ETA must be greater than zero."
    );

}


if (
    routeETA.intersections.length !== 3
) {

    throw new Error(
        "Complete route ETA contains incorrect intersection count."
    );

}


console.log(
    "Total route ETA:",
    routeETA.totalETA.toFixed(2),
    "seconds"
);


console.log(
    "✅ Complete route ETA test passed."
);


// --------------------------------------------------
// TEST 8
// SNAPSHOT
// --------------------------------------------------

console.log(
    "\n========== TEST 8: ETA SNAPSHOT =========="
);


const snapshot =
    etaEngine.getSnapshot(
        ambulance
    );


console.log(
    snapshot
);


if (
    snapshot.ambulanceId !==
    "AMB-ETA-001"
) {

    throw new Error(
        "ETA snapshot ambulance ID is incorrect."
    );

}


if (
    snapshot.nextNode !==
    "INT-02"
) {

    throw new Error(
        "ETA snapshot next node is incorrect."
    );

}


if (
    !Array.isArray(
        snapshot.intersections
    )
) {

    throw new Error(
        "ETA snapshot intersections are invalid."
    );

}


console.log(
    "✅ ETA snapshot test passed."
);


// --------------------------------------------------
// FINAL RESULT
// --------------------------------------------------

console.log(
    "\n========================================"
);

console.log(
    "⏱️🚑 ETA engine test passed."
);

console.log(
    "========================================\n"
);