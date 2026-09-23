import {
    getRoadNetwork,
    getConnectedIntersections,
    getDistanceBetweenIntersections
} from "./src/network/roadNetwork.js";

console.log("\n========== RESQWAY ROAD NETWORK TEST ==========\n");

const network = getRoadNetwork();

console.log("Intersections:");
console.log(Object.keys(network.intersections));

console.log("\nRoads:");
console.log(Object.keys(network.roads));

console.log("\nLanes per direction:");
console.log(network.lanesPerDirection);

console.log("\nConnected to INT-01:");
console.log(
    getConnectedIntersections("INT-01")
);

console.log("\nDistance INT-01 → INT-02:");
console.log(
    getDistanceBetweenIntersections("INT-01", "INT-02")
);

console.log("\nDistance INT-01 → INT-04:");
console.log(
    getDistanceBetweenIntersections("INT-01", "INT-04")
);

console.log("\n================================================\n");