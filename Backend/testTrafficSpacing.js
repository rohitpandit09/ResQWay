import {
    TrafficVehicle,
    VEHICLE_TYPES
} from "./src/traffic/trafficVehicle.js";

import {
    getVehicleAhead,
    evaluateVehicleSpacing
} from "./src/traffic/trafficSpacing.js";


console.log(
    "\n========== TRAFFIC SPACING TEST ==========\n"
);


// --------------------------------------------------
// CREATE LEAD VEHICLE
// --------------------------------------------------

const leadVehicle =
    new TrafficVehicle({

        id: "CAR-LEAD",

        type: VEHICLE_TYPES.CAR,

        roadId: "ROAD-01",

        laneId: "ROAD-01-FORWARD-1",

        currentNode: "INT-01",

        nextNode: "INT-02",

        route: [
            "INT-01",
            "INT-02"
        ]

    });


leadVehicle.position = 70;

leadVehicle.setMoving();


// --------------------------------------------------
// CREATE FOLLOWING VEHICLE
// --------------------------------------------------

const followingVehicle =
    new TrafficVehicle({

        id: "CAR-FOLLOW",

        type: VEHICLE_TYPES.CAR,

        roadId: "ROAD-01",

        laneId: "ROAD-01-FORWARD-1",

        currentNode: "INT-01",

        nextNode: "INT-02",

        route: [
            "INT-01",
            "INT-02"
        ]

    });


followingVehicle.position = 50;

followingVehicle.setMoving();


// --------------------------------------------------
// VEHICLES
// --------------------------------------------------

const vehicles = [

    leadVehicle,

    followingVehicle

];


// --------------------------------------------------
// FIND VEHICLE AHEAD
// --------------------------------------------------

const vehicleAhead =
    getVehicleAhead(
        followingVehicle,
        vehicles
    );


console.log(
    "Vehicle ahead:"
);

console.log(
    vehicleAhead?.id
);


// --------------------------------------------------
// DISTANCE TEST
// --------------------------------------------------

console.log(
    "\nDistance:"
);

console.log(
    vehicleAhead.position -
    followingVehicle.position,
    "metres"
);


// --------------------------------------------------
// EVALUATE
// --------------------------------------------------

const decision =
    evaluateVehicleSpacing(

        followingVehicle,

        vehicleAhead

    );


console.log(
    "\nSpacing decision:"
);

console.log(
    decision
);


// --------------------------------------------------
// EXTREME CLOSE TEST
// --------------------------------------------------

followingVehicle.position = 67;

followingVehicle.speed = 9;

followingVehicle.state = "MOVING";


const emergencyDecision =
    evaluateVehicleSpacing(

        followingVehicle,

        vehicleAhead

    );


console.log(
    "\nEmergency distance test:"
);

console.log(
    emergencyDecision
);


console.log(
    "\nVehicle state:"
);

console.log(
    followingVehicle.getState()
);


console.log(
    "\n==========================================\n"
);