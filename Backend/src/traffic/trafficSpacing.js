// Backend/src/traffic/trafficSpacing.js


// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

export const SPACING_CONFIG = {

    // Minimum distance that should normally
    // be maintained between vehicles.

    MIN_SAFE_DISTANCE: 8,


    // Distance at which the following vehicle
    // should start slowing down.

    FOLLOWING_DISTANCE: 20,


    // Extremely close distance.
    // Vehicle must stop.

    EMERGENCY_STOP_DISTANCE: 4

};


// --------------------------------------------------
// GET VEHICLES AHEAD
// --------------------------------------------------

export function getVehicleAhead(
    vehicle,
    vehicles
) {

    if (
        !vehicle ||
        !Array.isArray(vehicles)
    ) {

        return null;

    }


    const vehiclesAhead =
        vehicles.filter(other => {

            // Don't compare vehicle with itself.

            if (
                other.id ===
                vehicle.id
            ) {

                return false;

            }


            // Must be active.

            if (!other.active) {

                return false;

            }


            // Must be on the same lane.

            if (
                other.laneId !==
                vehicle.laneId
            ) {

                return false;

            }


            // Must be ahead.

            if (
                other.position <=
                vehicle.position
            ) {

                return false;

            }


            return true;

        });


    if (
        vehiclesAhead.length === 0
    ) {

        return null;

    }


    // Find the closest vehicle ahead.

    vehiclesAhead.sort(
        (a, b) =>
            a.position -
            b.position
    );


    return vehiclesAhead[0];

}


// --------------------------------------------------
// DISTANCE TO VEHICLE AHEAD
// --------------------------------------------------

export function getDistanceToVehicleAhead(
    vehicle,
    vehicleAhead
) {

    if (
        !vehicle ||
        !vehicleAhead
    ) {

        return null;

    }


    return (
        vehicleAhead.position -
        vehicle.position
    );

}


// --------------------------------------------------
// EVALUATE FOLLOWING BEHAVIOR
// --------------------------------------------------

export function evaluateVehicleSpacing(
    vehicle,
    vehicleAhead
) {

    // ----------------------------------------------
    // NO VEHICLE AHEAD
    // ----------------------------------------------

    if (!vehicleAhead) {

        return {

            action: "CLEAR",

            distance: null,

            desiredSpeed: null

        };

    }


    const distance =
        getDistanceToVehicleAhead(
            vehicle,
            vehicleAhead
        );


    // ----------------------------------------------
    // INVALID DISTANCE
    // ----------------------------------------------

    if (
        distance === null ||
        !Number.isFinite(distance)
    ) {

        return {

            action: "CLEAR",

            distance: null,

            desiredSpeed: null

        };

    }


    // ----------------------------------------------
    // EMERGENCY STOP
    // ----------------------------------------------

    if (
        distance <=
        SPACING_CONFIG.EMERGENCY_STOP_DISTANCE
    ) {

        return {

            action: "EMERGENCY_STOP",

            distance,

            desiredSpeed: 0

        };

    }


    // ----------------------------------------------
    // SAFE DISTANCE
    // ----------------------------------------------

    if (
        distance <=
        SPACING_CONFIG.MIN_SAFE_DISTANCE
    ) {

        return {

            action: "SLOW_DOWN",

            distance,

            desiredSpeed:
                Math.max(
                    0,
                    Math.min(
                        vehicle.targetSpeed,
                        vehicleAhead.speed
                    )
                )

        };

    }


    // ----------------------------------------------
    // FOLLOWING DISTANCE
    // ----------------------------------------------

    if (
        distance <=
        SPACING_CONFIG.FOLLOWING_DISTANCE
    ) {

        return {

            action: "FOLLOW",

            distance,

            desiredSpeed:
                Math.max(
                    0,
                    Math.min(
                        vehicle.targetSpeed,
                        vehicleAhead.speed
                    )
                )

        };

    }


    // ----------------------------------------------
    // CLEAR
    // ----------------------------------------------

    return {

        action: "CLEAR",

        distance,

        desiredSpeed: null

    };

}