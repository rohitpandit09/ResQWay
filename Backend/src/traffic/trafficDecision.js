import {
    shouldVehicleStop,
    shouldVehiclePrepareToStop,
    SIGNAL_STATES
} from "./trafficRules.js";


export function evaluateVehicleAtSignal(
    vehicle,
    lane,
    signalState
) {

    const distance =
        vehicle.getDistanceToIntersection(lane);


    if (distance === null) {

        return {
            action: "NO_ACTION",
            distance: null
        };
    }


    // ------------------------------------------
    // GREEN
    // ------------------------------------------

    if (signalState === SIGNAL_STATES.GREEN) {

        vehicle.setMoving();

        return {
            action: "PROCEED",
            distance
        };
    }


    // ------------------------------------------
    // YELLOW / RED
    // ------------------------------------------

    if (
        shouldVehicleStop(
            distance,
            signalState
        )
    ) {

        vehicle.stopForSignal();

        return {
            action: "STOP",
            distance
        };
    }


    // ------------------------------------------
    // APPROACHING SIGNAL
    // ------------------------------------------

    if (
        shouldVehiclePrepareToStop(
            distance,
            signalState
        )
    ) {

        vehicle.slowDown();

        return {
            action: "SLOW_DOWN",
            distance
        };
    }


    // ------------------------------------------
    // TOO FAR AWAY
    // ------------------------------------------

    vehicle.setMoving();

    return {
        action: "PROCEED",
        distance
    };
}