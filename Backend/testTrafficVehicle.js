import {
    TrafficVehicle,
    VEHICLE_TYPES
} from "./src/traffic/trafficVehicle.js";


console.log("\n========== TRAFFIC VEHICLE TEST ==========\n");


const car = new TrafficVehicle({

    id: "CAR-001",

    type: VEHICLE_TYPES.CAR,

    roadId: "ROAD-01",

    laneId: "ROAD-01-FORWARD-1",

    currentNode: "INT-01",

    nextNode: "INT-02",

    route: [
        "INT-01",
        "INT-02",
        "INT-03"
    ]

});


console.log("Initial state:");
console.log(car.getState());


console.log("\nStarting vehicle...");

car.setMoving();


for (let second = 1; second <= 5; second++) {

    car.updatePosition(1);

    console.log(
        `T+${second}s | position=${car.position.toFixed(2)}m | speed=${car.speed}m/s | state=${car.state}`
    );
}


console.log("\nStopping at signal...");

car.stopForSignal();

console.log(car.getState());


console.log("\n==========================================\n");