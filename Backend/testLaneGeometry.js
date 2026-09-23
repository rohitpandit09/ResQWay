import {
    getLaneGeometry,
    getLane
} from "./src/network/laneGeometry.js";

console.log("\n========== LANE GEOMETRY TEST ==========\n");

const geometry = getLaneGeometry();

console.log("Total lanes:", Object.keys(geometry.lanes).length);

console.log("\nROAD-01 lanes:");

for (const lane of Object.values(geometry.lanes)) {

    if (lane.roadId === "ROAD-01") {

        console.log({
            id: lane.id,
            direction: lane.direction,
            laneIndex: lane.laneIndex,
            start: lane.start,
            end: lane.end,
            length: lane.length
        });
    }
}

console.log("\nSingle lane lookup:");

console.log(
    getLane("ROAD-01-FORWARD-1")
);

console.log("\n=========================================\n");