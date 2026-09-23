import {
    SignalController
} from "./src/signals/signalController.js";

import {
    SIGNAL_PHASES
} from "./src/signals/signalPhases.js";

import {
    TrafficVehicle,
    VEHICLE_TYPES
} from "./src/traffic/trafficVehicle.js";

import {
    VehicleEngine
} from "./src/traffic/vehicleEngine.js";

import {
    generateLaneGeometry
} from "./src/network/laneGeometry.js";

import {
    getLaneForMovement
} from "./src/traffic/routeEngine.js";


// ==================================================
// SETUP
// ==================================================

const lanes =
    generateLaneGeometry();

const signalController =
    new SignalController("INT-02");


const lane =
    getLaneForMovement(
        "INT-01",
        "INT-02",
        1
    );


const vehicle =
    new TrafficVehicle({
        id: "TEST-CAR-001",
        type: VEHICLE_TYPES.CAR,
        roadId: "ROAD-01",
        laneId: lane.id,
        currentNode: "INT-01",
        nextNode: "INT-02",
        route: [
            "INT-01",
            "INT-02"
        ],
        routeIndex: 0
    });


const engine =
    new VehicleEngine({
        vehicles: [
            vehicle
        ],

        lanes,

        signals: {
            "INT-02": signalController
        }
    });


// ==================================================
// TEST 1
// GREEN FAR FROM SIGNAL
// ==================================================

console.log(
    "\n========== TEST 1: GREEN =========="
);


signalController.phase =
    SIGNAL_PHASES.NORTH_SOUTH_GREEN;

signalController.remainingSeconds =
    18;


vehicle.position = 50;
vehicle.speed = 0;
vehicle.state = "STOPPED";
vehicle.waitingForSignal = false;

vehicle.resetDesiredSpeed();


engine.update(1);


console.log(
    "Expected: Vehicle MOVING"
);

console.log(
    "Actual:",
    vehicle.getState()
);


// ==================================================
// TEST 2
// RED - APPROACHING SIGNAL
// ==================================================

console.log(
    "\n========== TEST 2: RED APPROACH =========="
);


signalController.phase =
    SIGNAL_PHASES.EAST_WEST_GREEN;

signalController.remainingSeconds =
    18;


vehicle.position = 90;
vehicle.speed = 9;
vehicle.state = "MOVING";
vehicle.waitingForSignal = false;

vehicle.resetDesiredSpeed();


engine.update(1);


console.log(
    "Expected: Vehicle slows down"
);

console.log(
    "Actual:",
    vehicle.getState()
);


// ==================================================
// TEST 3
// RED - AT STOP LINE
// ==================================================

console.log(
    "\n========== TEST 3: RED STOP LINE =========="
);


signalController.phase =
    SIGNAL_PHASES.EAST_WEST_GREEN;

signalController.remainingSeconds =
    18;


vehicle.position = 115;
vehicle.speed = 9;
vehicle.state = "MOVING";
vehicle.waitingForSignal = false;

vehicle.resetDesiredSpeed();


engine.update(1);


console.log(
    "Expected: Vehicle STOPPED at 115m"
);

console.log(
    "Actual:",
    vehicle.getState()
);


// ==================================================
// TEST 4
// GREEN AFTER RED
// ==================================================

console.log(
    "\n========== TEST 4: GREEN AFTER RED =========="
);


signalController.phase =
    SIGNAL_PHASES.NORTH_SOUTH_GREEN;

signalController.remainingSeconds =
    18;


vehicle.position = 115;
vehicle.speed = 0;
vehicle.state = "WAITING";
vehicle.waitingForSignal = true;

vehicle.resetDesiredSpeed();


engine.update(1);


console.log(
    "Expected: Vehicle starts moving"
);

console.log(
    "Actual:",
    vehicle.getState()
);


// ==================================================
// TEST 5
// YELLOW NEAR SIGNAL
// ==================================================

console.log(
    "\n========== TEST 5: YELLOW =========="
);


signalController.phase =
    SIGNAL_PHASES.NORTH_SOUTH_YELLOW;

signalController.remainingSeconds =
    3;


vehicle.position = 100;
vehicle.speed = 9;
vehicle.state = "MOVING";
vehicle.waitingForSignal = false;

vehicle.resetDesiredSpeed();


engine.update(1);


console.log(
    "Expected: Vehicle prepares/slows"
);

console.log(
    "Actual:",
    vehicle.getState()
);


// ==================================================
// COMPLETE
// ==================================================

console.log(
    "\n========== SIGNAL + VEHICLE TEST COMPLETE =========="
);