export const SIGNAL_STATES = {
    GREEN: "GREEN",
    YELLOW: "YELLOW",
    RED: "RED"
};


export const TRAFFIC_RULE_CONFIG = {

    // Distance from intersection at which
    // a vehicle starts considering the signal.
    SIGNAL_DETECTION_DISTANCE: 30,

    // Distance where a vehicle must stop
    // if the signal is not allowing movement.
    STOP_LINE_DISTANCE: 5,

    // Maximum comfortable acceleration.
    MAX_ACCELERATION: 2,

    // Maximum comfortable braking.
    MAX_DECELERATION: 4,

    // Safe spacing between vehicles in the same lane.
    SAFE_FOLLOWING_DISTANCE: 12,

    // Warning threshold before the safe gap is breached.
    FOLLOWING_SLOW_DISTANCE: 24
};


export function canVehicleProceed(signalState) {

    return signalState === SIGNAL_STATES.GREEN;
}


export function shouldVehicleStop(
    distanceToIntersection,
    signalState
) {

    if (
        distanceToIntersection <=
        TRAFFIC_RULE_CONFIG.STOP_LINE_DISTANCE
    ) {

        return signalState !== SIGNAL_STATES.GREEN;
    }

    return false;
}


export function shouldVehiclePrepareToStop(
    distanceToIntersection,
    signalState
) {

    if (signalState === SIGNAL_STATES.GREEN) {
        return false;
    }

    return (
        distanceToIntersection <=
        TRAFFIC_RULE_CONFIG.SIGNAL_DETECTION_DISTANCE
    );
}