import {
    getMovementDirection,
    isNorthSouthMovement,
    isEastWestMovement
} from "./src/signals/movementDirection.js";


console.log(
    "\n========== MOVEMENT DIRECTION TEST ==========\n"
);


const movements = [

    ["INT-01", "INT-02"],

    ["INT-02", "INT-01"],

    ["INT-02", "INT-03"],

    ["INT-03", "INT-02"],

    ["INT-03", "INT-04"],

    ["INT-04", "INT-03"],

    ["INT-04", "INT-01"],

    ["INT-01", "INT-04"]

];


for (
    const [from, to]
    of movements
) {

    const direction =
        getMovementDirection(
            from,
            to
        );


    console.log(
        `${from} → ${to} = ${direction}`
    );

}


console.log("\nMovement groups:\n");


console.log(
    "NORTH:",
    isNorthSouthMovement("NORTH")
);


console.log(
    "SOUTH:",
    isNorthSouthMovement("SOUTH")
);


console.log(
    "EAST:",
    isEastWestMovement("EAST")
);


console.log(
    "WEST:",
    isEastWestMovement("WEST")
);


console.log(
    "\n=============================================\n"
);