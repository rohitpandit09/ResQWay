import {
    TrafficVehicle,
    VEHICLE_TYPES
} from "./src/traffic/trafficVehicle.js";

import {
    evaluateVehicleAtSignal
} from "./src/traffic/trafficDecision.js";

import {
    getLane
} from "./src/network/laneGeometry.js";


console.log("\n========== TRAFFIC DECISION TEST ==========\n");


const vehicle = new TrafficVehicle({

    id: "CAR-001",

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


const lane = getLane(
    "ROAD-01-FORWARD-1"
);


vehicle.setLaneLength(lane.length);


vehicle.setMoving();


console.log("Lane length:", lane.length);


console.log("\n--- GREEN ---");

console.log(
    evaluateVehicleAtSignal(
        vehicle,
        lane,
        "GREEN"
    )
);


vehicle.position = 100;


console.log("\nVehicle position:", vehicle.position);

console.log(
    "Distance to intersection:",
    vehicle.getDistanceToIntersection(lane)
);


console.log("\n--- RED ---");

console.log(
    evaluateVehicleAtSignal(
        vehicle,
        lane,
        "RED"
    )
);


vehicle.position = 95;

vehicle.position = 115;

console.log("\nVehicle position:", vehicle.position);

console.log(
    "Distance to intersection:",
    vehicle.getDistanceToIntersection(lane)
);

console.log("\n--- RED, at stop line ---");

console.log(
    evaluateVehicleAtSignal(
        vehicle,
        lane,
        "RED"
    )
);

console.log("\nVehicle state:");

console.log(
    vehicle.getState()
);


console.log("\nVehicle position:", vehicle.position);

console.log(
    "Distance to intersection:",
    vehicle.getDistanceToIntersection(lane)
);


console.log("\n--- RED, approaching ---");

console.log(
    evaluateVehicleAtSignal(
        vehicle,
        lane,
        "RED"
    )
);


console.log("\nFinal vehicle state:");

console.log(
    vehicle.getState()
);


console.log("\n===========================================\n");