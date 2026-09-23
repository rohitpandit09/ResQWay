// Backend/src/ambulance/testAmbulanceEngine.js

import {
    AmbulanceEngine
} from "./ambulanceEngine.js";

import {
    AMBULANCE_STATES
} from "./ambulance.js";


// --------------------------------------------------
// TEST HEADER
// --------------------------------------------------

console.log(
    "\n========== AMBULANCE ENGINE TEST ==========\n"
);


// --------------------------------------------------
// CREATE ENGINE
// --------------------------------------------------

const engine =
    new AmbulanceEngine();


// --------------------------------------------------
// CREATE AMBULANCE
// --------------------------------------------------

const ambulance =
    engine.createAmbulance({

        id: "AMB-001",

        baseNode: "INT-01"

    });


console.log(
    "Ambulance created:"
);

console.log(
    ambulance.getState()
);


// --------------------------------------------------
// CLIENT JOURNEY
// --------------------------------------------------

console.log(
    "\n========== CLIENT JOURNEY =========="
);


const clientRoute = [

    "INT-01",

    "INT-02",

    "INT-03",

    "INT-04"

];


ambulance.dispatch(
    "INT-04"
);


engine.startClientJourney(

    ambulance,

    clientRoute

);


console.log(
    "Client route:"
);

console.log(
    ambulance.route
);


// --------------------------------------------------
// SIMULATION
// --------------------------------------------------

const DELTA_TIME = 1;

const SIMULATION_SECONDS = 50;


for (
    let second = 1;
    second <= SIMULATION_SECONDS;
    second++
) {

    engine.update(
        DELTA_TIME
    );


    console.log(

        `T+${second}s | ` +
        `Node: ${ambulance.currentNode} | ` +
        `Next: ${ambulance.nextNode} | ` +
        `Road: ${ambulance.roadId} | ` +
        `Position: ${ambulance.position.toFixed(2)}m | ` +
        `Speed: ${ambulance.speed.toFixed(2)}m/s | ` +
        `State: ${ambulance.state}`

    );


    if (

        ambulance.state ===
        AMBULANCE_STATES.ARRIVED_AT_CLIENT

    ) {

        console.log(
            "\n🚑 Ambulance reached client."
        );

        break;

    }

}


// --------------------------------------------------
// CLIENT ARRIVAL CHECK
// --------------------------------------------------

if (

    ambulance.state !==
    AMBULANCE_STATES.ARRIVED_AT_CLIENT

) {

    throw new Error(
        "Ambulance did not reach the client."
    );

}


// --------------------------------------------------
// PICKUP
// --------------------------------------------------

console.log(
    "\n========== PATIENT PICKUP =========="
);


ambulance.pickupPatient();


console.log(
    ambulance.getState()
);


// --------------------------------------------------
// HOSPITAL JOURNEY
// --------------------------------------------------

console.log(
    "\n========== HOSPITAL JOURNEY =========="
);


const hospitalRoute = [

    "INT-04",

    "INT-03",

    "INT-02",

    "INT-01"

];


engine.startHospitalJourney(

    ambulance,

    "INT-01",

    hospitalRoute

);


for (
    let second = 1;
    second <= SIMULATION_SECONDS;
    second++
) {

    engine.update(
        DELTA_TIME
    );


    console.log(

        `Hospital T+${second}s | ` +
        `Node: ${ambulance.currentNode} | ` +
        `Next: ${ambulance.nextNode} | ` +
        `Road: ${ambulance.roadId} | ` +
        `Position: ${ambulance.position.toFixed(2)}m | ` +
        `Speed: ${ambulance.speed.toFixed(2)}m/s | ` +
        `State: ${ambulance.state}`

    );


    if (

        ambulance.state ===
        AMBULANCE_STATES.ARRIVED_AT_HOSPITAL

    ) {

        console.log(
            "\n🏥 Ambulance reached hospital."
        );

        break;

    }

}


// --------------------------------------------------
// HOSPITAL ARRIVAL CHECK
// --------------------------------------------------

if (

    ambulance.state !==
    AMBULANCE_STATES.ARRIVED_AT_HOSPITAL

) {

    throw new Error(
        "Ambulance did not reach the hospital."
    );

}


// --------------------------------------------------
// COMPLETE
// --------------------------------------------------

console.log(
    "\n========== COMPLETING TRIP =========="
);


ambulance.complete();


console.log(
    ambulance.getState()
);


// --------------------------------------------------
// FINAL CHECK
// --------------------------------------------------

if (

    ambulance.state !==
    AMBULANCE_STATES.COMPLETED

) {

    throw new Error(
        "Ambulance did not complete successfully."
    );

}


console.log(
    "\n========================================"
);

console.log(
    "🚑 Ambulance engine test passed."
);

console.log(
    "========================================\n"
);