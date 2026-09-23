import {
    getRoadBetween,
    getTravelDirection,
    getLanesForMovement,
    getLaneForMovement,
    getMovementInfo
} from "./src/traffic/routeEngine.js";


console.log("\n========== ROUTE ENGINE TEST ==========\n");


console.log("INT-01 → INT-02");

console.log(
    getRoadBetween(
        "INT-01",
        "INT-02"
    )
);


console.log("\nDirection:");

console.log(
    getTravelDirection(
        "INT-01",
        "INT-02"
    )
);


console.log("\nINT-02 → INT-01");

console.log(
    getRoadBetween(
        "INT-02",
        "INT-01"
    )
);


console.log("\nDirection:");

console.log(
    getTravelDirection(
        "INT-02",
        "INT-01"
    )
);


console.log("\nLanes INT-01 → INT-02:");

console.log(
    getLanesForMovement(
        "INT-01",
        "INT-02"
    )
);


console.log("\nSelected lane:");

console.log(
    getLaneForMovement(
        "INT-01",
        "INT-02",
        1
    )
);


console.log("\nComplete movement info:");

console.log(
    getMovementInfo(
        "INT-02",
        "INT-03",
        2
    )
);


console.log("\nInvalid connection:");

console.log(
    getRoadBetween(
        "INT-01",
        "INT-03"
    )
);


console.log("\n=======================================\n");