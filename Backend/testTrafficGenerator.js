import {
    TrafficGenerator
} from "./src/traffic/trafficGenerator.js";


console.log("\n========== TRAFFIC GENERATOR TEST ==========\n");


const generator = new TrafficGenerator();


const vehicles =
    generator.generateInitialTraffic();


console.log(
    "Vehicles generated:",
    vehicles.length
);


for (const vehicle of vehicles) {

    console.log({
        id: vehicle.id,
        type: vehicle.type,
        roadId: vehicle.roadId,
        laneId: vehicle.laneId,
        currentNode: vehicle.currentNode,
        nextNode: vehicle.nextNode,
        speed: vehicle.targetSpeed,
        state: vehicle.state
    });
}


console.log("\nTotal vehicles:");

console.log(
    generator.getVehicles().length
);


console.log("\n============================================\n");