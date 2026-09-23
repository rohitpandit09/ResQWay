import {
    TrafficGenerator
} from "./src/traffic/trafficGenerator.js";

import {
    getMovementDirection
} from "./src/signals/movementDirection.js";

import {
    VehicleEngine
} from "./src/traffic/vehicleEngine.js";

import {
    getLaneGeometry
} from "./src/network/laneGeometry.js";

import {
    SignalController
} from "./src/signals/signalController.js";


// --------------------------------------------------
// SETUP
// --------------------------------------------------

const generator =
    new TrafficGenerator();

const vehicles =
    generator.generateInitialTraffic();

const lanes =
    getLaneGeometry().lanes;


// --------------------------------------------------
// SIGNALS
// --------------------------------------------------

const signals = {

    "INT-01":
        new SignalController("INT-01"),

    "INT-02":
        new SignalController("INT-02"),

    "INT-03":
        new SignalController("INT-03"),

    "INT-04":
        new SignalController("INT-04")

};


// --------------------------------------------------
// ENGINE
// --------------------------------------------------

const engine =
    new VehicleEngine({

        vehicles,

        lanes,

        signals

    });


// --------------------------------------------------
// HELPER
// --------------------------------------------------

function printVehicleState(vehicle) {

    console.log({

        id: vehicle.id,

        movement:
            `${vehicle.currentNode} → ${vehicle.nextNode}`,

        road:
            vehicle.roadId,

        position:
            vehicle.position,

        speed:
            vehicle.speed,

        state:
            vehicle.state,

        waitingForSignal:
            vehicle.waitingForSignal

    });

}


// --------------------------------------------------
// FIND TEST VEHICLES
// --------------------------------------------------

const northVehicle =
    vehicles.find(

        vehicle =>

            vehicle.currentNode === "INT-01" &&

            vehicle.nextNode === "INT-02"

    );


const eastVehicle =
    vehicles.find(

        vehicle =>

            vehicle.currentNode === "INT-02" &&

            vehicle.nextNode === "INT-03"

    );


// --------------------------------------------------
// TEST 1
// NORTH/SOUTH GREEN
// --------------------------------------------------

console.log(
    "\n========== TEST 1: NORTH/SOUTH GREEN ==========\n"
);


// INT-02 starts with NORTH/SOUTH GREEN.

console.log(
    "Signal at INT-02:"
);

console.log(
    signals["INT-02"].getState()
);


// EAST vehicle should NOT be allowed
// to move toward INT-03.

console.log(
    "\nEast-bound vehicle BEFORE update:"
);

printVehicleState(eastVehicle);


// Put east vehicle close to the intersection
// so signal decision becomes meaningful.

eastVehicle.position = 100;

eastVehicle.setMoving();

console.log(
    "\nDetected movement direction:"
);

console.log(
    getMovementDirection(
        eastVehicle.currentNode,
        eastVehicle.nextNode
    )
);

console.log(
    "\nDetected signal state:"
);

console.log(
    engine.getVehicleSignalState(
        eastVehicle,
        signals["INT-02"]
    )
);


engine.update(1);


console.log(
    "\nEast-bound vehicle AFTER update:"
);

printVehicleState(eastVehicle);


// --------------------------------------------------
// TEST 2
// EAST/WEST GREEN
// --------------------------------------------------

console.log(
    "\n========== TEST 2: EAST/WEST GREEN ==========\n"
);


// Manually change INT-02 signal.

signals["INT-02"].phase =
    "EAST_WEST_GREEN";

signals["INT-02"].remainingSeconds =
    18;


console.log(
    "Signal at INT-02:"
);

console.log(
    signals["INT-02"].getState()
);


// Reset vehicle.

eastVehicle.position = 100;

eastVehicle.speed = 0;

eastVehicle.state = "STOPPED";

eastVehicle.waitingForSignal = false;


// Update.

engine.update(1);


console.log(
    "\nEast-bound vehicle AFTER EAST/WEST GREEN:"
);

printVehicleState(eastVehicle);


// --------------------------------------------------
// RESULTS
// --------------------------------------------------

console.log(
    "\n===============================================\n"
);