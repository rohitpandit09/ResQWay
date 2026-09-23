// Backend/src/ambulance/ambulanceSignalController.js

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
// AMBULANCE SIGNAL CONTROLLER
// --------------------------------------------------

export class AmbulanceSignalController {

    constructor({
        signals
    }) {

        this.signals = signals;

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

        if (this.signals instanceof Map) {

            return (
                this.signals.get(intersectionId) ||
                null
            );

        }

        return (
            this.signals[intersectionId] ||
            null
        );

    }


    // --------------------------------------------------
    // GET SIGNAL STATE
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
                    null

            };

        }


        const phase =
            controller.phase;


        const movement =
            getMovementDirection(
                fromNode,
                toNode
            );


        let state =
            SIGNAL_STATES.RED;


        // ------------------------------------------
        // NORTH / SOUTH MOVEMENT
        // ------------------------------------------

        if (
            isNorthSouthMovement(
                movement
            )
        ) {

            if (
                phase ===
                SIGNAL_PHASES.NORTH_SOUTH_GREEN
            ) {

                state =
                    SIGNAL_STATES.GREEN;

            }

            else if (
                phase ===
                SIGNAL_PHASES.NORTH_SOUTH_YELLOW
            ) {

                state =
                    SIGNAL_STATES.YELLOW;

            }

        }


        // ------------------------------------------
        // EAST / WEST MOVEMENT
        // ------------------------------------------

        else if (
            isEastWestMovement(
                movement
            )
        ) {

            if (
                phase ===
                SIGNAL_PHASES.EAST_WEST_GREEN
            ) {

                state =
                    SIGNAL_STATES.GREEN;

            }

            else if (
                phase ===
                SIGNAL_PHASES.EAST_WEST_YELLOW
            ) {

                state =
                    SIGNAL_STATES.YELLOW;

            }

        }


        return {

            state,

            phase,

            remainingSeconds:
                controller.remainingSeconds,

            movement

        };

    }


    // --------------------------------------------------
    // EVALUATE AMBULANCE
    // --------------------------------------------------

    evaluate(
        ambulance
    ) {

        if (!ambulance) {

            return {

                action:
                    "NO_ACTION",

                signalState:
                    null

            };

        }


        if (!ambulance.nextNode) {

            return {

                action:
                    "NO_ACTION",

                signalState:
                    null

            };

        }


        const intersectionId =
            ambulance.nextNode;


        const signal =
            this.getSignalState(

                intersectionId,

                ambulance.currentNode,

                ambulance.nextNode

            );


        // ------------------------------------------
        // GREEN
        // ------------------------------------------

        if (
            signal.state ===
            SIGNAL_STATES.GREEN
        ) {

            return {

                action:
                    "PROCEED",

                signalState:
                    signal

            };

        }


        // ------------------------------------------
        // YELLOW
        // ------------------------------------------

        if (
            signal.state ===
            SIGNAL_STATES.YELLOW
        ) {

            return {

                action:
                    "SLOW_DOWN",

                signalState:
                    signal

            };

        }


        // ------------------------------------------
        // RED
        // ------------------------------------------

        return {

            action:
                "STOP",

            signalState:
                signal

        };

    }

}