// Backend/src/eta/signalDelay.js

import {
    SIGNAL_PHASES
} from "../signals/signalPhases.js";

import {
    SIGNAL_STATES
} from "../traffic/trafficRules.js";

import {
    getMovementDirection,
    isNorthSouthMovement,
    isEastWestMovement
} from "../signals/movementDirection.js";


// --------------------------------------------------
// SIGNAL DELAY CONFIGURATION
// --------------------------------------------------

export const SIGNAL_DELAY_CONFIG = {

    // Small safety buffer when arriving
    // exactly as a phase changes.

    PHASE_BUFFER: 1

};


// --------------------------------------------------
// SIGNAL DELAY ENGINE
// --------------------------------------------------

export class SignalDelayEngine {

    constructor({
        signals
    }) {

        this.signals =
            signals;

    }


    // --------------------------------------------------
    // GET SIGNAL CONTROLLER
    // --------------------------------------------------

    getSignalController(
        intersectionId
    ) {

        if (!this.signals) {

            return null;

        }


        if (
            this.signals instanceof Map
        ) {

            return (
                this.signals.get(
                    intersectionId
                ) || null
            );

        }


        return (
            this.signals[
                intersectionId
            ] || null
        );

    }


    // --------------------------------------------------
    // GET MOVEMENT SIGNAL STATE
    // --------------------------------------------------

    getSignalState(
        intersectionId,
        fromNode,
        toNode
    ) {

        const controller =
            this.getSignalController(
                intersectionId
            );


        if (!controller) {

            return {

                state:
                    SIGNAL_STATES.RED,

                phase:
                    null,

                remainingSeconds:
                    null,

                movement:
                    null

            };

        }


        const movement =
            getMovementDirection(
                fromNode,
                toNode
            );


        let state =
            SIGNAL_STATES.RED;


        // ------------------------------------------
        // NORTH / SOUTH
        // ------------------------------------------

        if (
            isNorthSouthMovement(
                movement
            )
        ) {

            if (
                controller.phase ===
                SIGNAL_PHASES.NORTH_SOUTH_GREEN
            ) {

                state =
                    SIGNAL_STATES.GREEN;

            }

            else if (
                controller.phase ===
                SIGNAL_PHASES.NORTH_SOUTH_YELLOW
            ) {

                state =
                    SIGNAL_STATES.YELLOW;

            }

        }


        // ------------------------------------------
        // EAST / WEST
        // ------------------------------------------

        else if (
            isEastWestMovement(
                movement
            )
        ) {

            if (
                controller.phase ===
                SIGNAL_PHASES.EAST_WEST_GREEN
            ) {

                state =
                    SIGNAL_STATES.GREEN;

            }

            else if (
                controller.phase ===
                SIGNAL_PHASES.EAST_WEST_YELLOW
            ) {

                state =
                    SIGNAL_STATES.YELLOW;

            }

        }


        return {

            state,

            phase:
                controller.phase,

            remainingSeconds:
                controller.remainingSeconds,

            movement

        };

    }


    // --------------------------------------------------
    // CALCULATE WAIT UNTIL GREEN
    // --------------------------------------------------

    calculateWaitUntilGreen(
        intersectionId,
        fromNode,
        toNode
    ) {

        const signal =
            this.getSignalState(

                intersectionId,

                fromNode,

                toNode

            );


        // ------------------------------------------
        // NO CONTROLLER
        // ------------------------------------------

        if (
            signal.phase === null
        ) {

            return {

                delay:
                    0,

                state:
                    signal.state,

                reason:
                    "NO_SIGNAL_CONTROLLER"

            };

        }


        // ------------------------------------------
        // ALREADY GREEN
        // ------------------------------------------

        if (
            signal.state ===
            SIGNAL_STATES.GREEN
        ) {

            return {

                delay:
                    0,

                state:
                    signal.state,

                reason:
                    "SIGNAL_ALREADY_GREEN"

            };

        }


        // ------------------------------------------
        // YELLOW
        // ------------------------------------------

        if (
            signal.state ===
            SIGNAL_STATES.YELLOW
        ) {

            /*
             * Yellow is treated as a short transition.
             *
             * We wait until the next complete
             * compatible green phase.
             */

            return {

                delay:

                    signal.remainingSeconds +

                    SIGNAL_DELAY_CONFIG
                        .PHASE_BUFFER +

                    this.getOppositeGreenDuration(),

                state:
                    signal.state,

                reason:
                    "WAIT_FOR_NEXT_GREEN"

            };

        }


        // ------------------------------------------
        // RED
        // ------------------------------------------

        if (
            signal.state ===
            SIGNAL_STATES.RED
        ) {

            return {

                delay:

                    signal.remainingSeconds +

                    this.getOppositeYellowDuration() +

                    SIGNAL_DELAY_CONFIG
                        .PHASE_BUFFER,

                state:
                    signal.state,

                reason:
                    "WAIT_FOR_NEXT_GREEN"

            };

        }


        return {

            delay:
                0,

            state:
                signal.state,

            reason:
                "UNKNOWN_SIGNAL_STATE"

        };

    }


    // --------------------------------------------------
    // OPPOSITE GREEN DURATION
    // --------------------------------------------------

    getOppositeGreenDuration() {

        /*
         * Current signal configuration:
         *
         * N/S Green = 18
         * N/S Yellow = 3
         * E/W Green = 18
         * E/W Yellow = 3
         */

        return 18;

    }


    // --------------------------------------------------
    // OPPOSITE YELLOW DURATION
    // --------------------------------------------------

    getOppositeYellowDuration() {

        return 3;

    }


    // --------------------------------------------------
    // GET DELAY SNAPSHOT
    // --------------------------------------------------

    getDelaySnapshot(
        intersectionId,
        fromNode,
        toNode
    ) {

        const signal =
            this.getSignalState(

                intersectionId,

                fromNode,

                toNode

            );


        const wait =
            this.calculateWaitUntilGreen(

                intersectionId,

                fromNode,

                toNode

            );


        return {

            intersectionId,

            fromNode,

            toNode,

            movement:
                signal.movement,

            state:
                signal.state,

            phase:
                signal.phase,

            remainingSignalSeconds:
                signal.remainingSeconds,

            signalDelay:
                wait.delay,

            reason:
                wait.reason

        };

    }

}