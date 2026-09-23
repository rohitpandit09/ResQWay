// Backend/src/signals/movementDirection.js

import { INTERSECTIONS } from "../network/roadNetwork.js";


// --------------------------------------------------
// MOVEMENT DIRECTIONS
// --------------------------------------------------

export const MOVEMENT_DIRECTIONS = {

    NORTH: "NORTH",

    SOUTH: "SOUTH",

    EAST: "EAST",

    WEST: "WEST"

};


// --------------------------------------------------
// GET MOVEMENT DIRECTION
// --------------------------------------------------

export function getMovementDirection(
    fromNode,
    toNode
) {

    const from =
        INTERSECTIONS[fromNode];

    const to =
        INTERSECTIONS[toNode];


    if (!from || !to) {

        return null;

    }


    const dx =
        to.position.x -
        from.position.x;


    const dz =
        to.position.z -
        from.position.z;


    // ----------------------------------------------
    // HORIZONTAL MOVEMENT
    // ----------------------------------------------

    if (Math.abs(dx) > Math.abs(dz)) {

        if (dx > 0) {

            return MOVEMENT_DIRECTIONS.EAST;

        }

        return MOVEMENT_DIRECTIONS.WEST;

    }


    // ----------------------------------------------
    // VERTICAL MOVEMENT
    // ----------------------------------------------

    if (dz < 0) {

        return MOVEMENT_DIRECTIONS.NORTH;

    }


    if (dz > 0) {

        return MOVEMENT_DIRECTIONS.SOUTH;

    }


    return null;

}


// --------------------------------------------------
// CHECK NORTH / SOUTH MOVEMENT
// --------------------------------------------------

export function isNorthSouthMovement(
    direction
) {

    return (

        direction ===
            MOVEMENT_DIRECTIONS.NORTH ||

        direction ===
            MOVEMENT_DIRECTIONS.SOUTH

    );

}


// --------------------------------------------------
// CHECK EAST / WEST MOVEMENT
// --------------------------------------------------

export function isEastWestMovement(
    direction
) {

    return (

        direction ===
            MOVEMENT_DIRECTIONS.EAST ||

        direction ===
            MOVEMENT_DIRECTIONS.WEST

    );

}