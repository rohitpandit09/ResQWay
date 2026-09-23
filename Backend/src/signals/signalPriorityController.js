// Backend/src/signals/signalPriorityController.js

import {
    SIGNAL_PHASES,
    DEFAULT_SIGNAL_TIMINGS
} from "./signalPhases.js";

import {
    SIGNAL_STATES
} from "../traffic/trafficRules.js";

import {
    getMovementDirection,
    isNorthSouthMovement,
    isEastWestMovement
} from "./movementDirection.js";


export const SIGNAL_PRIORITY_MODES = {

    NORMAL: "NORMAL",

    PREPARE: "PREPARE",

    ACTIVE: "ACTIVE",

    RELEASE: "RELEASE"

};


export class SignalPriorityController {

    constructor(signalController) {

        this.signalController =
            signalController;

        this.mode =
            SIGNAL_PRIORITY_MODES.NORMAL;

        this.priorityMovement =
            null;

        this.priorityIntersection =
            signalController?.intersectionId ||
            null;

        this.targetGreenSeconds =
            null;

        this.originalPhase =
            null;

    }


    // --------------------------------------------------
    // GET CURRENT SIGNAL STATE
    // --------------------------------------------------

    getCurrentState() {

        if (!this.signalController) {

            return SIGNAL_STATES.RED;

        }


        const phase =
            this.signalController.phase;


        if (
            phase ===
            SIGNAL_PHASES.NORTH_SOUTH_GREEN
        ) {

            return SIGNAL_STATES.GREEN;

        }


        if (
            phase ===
            SIGNAL_PHASES.NORTH_SOUTH_YELLOW
        ) {

            return SIGNAL_STATES.YELLOW;

        }


        if (
            phase ===
            SIGNAL_PHASES.EAST_WEST_GREEN
        ) {

            return SIGNAL_STATES.GREEN;

        }


        if (
            phase ===
            SIGNAL_PHASES.EAST_WEST_YELLOW
        ) {

            return SIGNAL_STATES.YELLOW;

        }


        return SIGNAL_STATES.RED;

    }


    // --------------------------------------------------
    // GET PHASE FOR MOVEMENT
    // --------------------------------------------------

    getPhaseForMovement(
        movement
    ) {

        if (
            isNorthSouthMovement(
                movement
            )
        ) {

            return {

                green:
                    SIGNAL_PHASES
                        .NORTH_SOUTH_GREEN,

                yellow:
                    SIGNAL_PHASES
                        .NORTH_SOUTH_YELLOW

            };

        }


        if (
            isEastWestMovement(
                movement
            )
        ) {

            return {

                green:
                    SIGNAL_PHASES
                        .EAST_WEST_GREEN,

                yellow:
                    SIGNAL_PHASES
                        .EAST_WEST_YELLOW

            };

        }


        return null;

    }


    // --------------------------------------------------
    // PREPARE PRIORITY
    // --------------------------------------------------

    preparePriority(
        movement,
        targetGreenSeconds = 12
    ) {

        if (!movement) {

            return {

                success: false,

                reason:
                    "MISSING_MOVEMENT"

            };

        }


        const phase =
            this.getPhaseForMovement(
                movement
            );


        if (!phase) {

            return {

                success: false,

                reason:
                    "INVALID_MOVEMENT"

            };

        }


        this.mode =
            SIGNAL_PRIORITY_MODES.PREPARE;

        this.priorityMovement =
            movement;

        this.targetGreenSeconds =
            Math.max(
                1,
                targetGreenSeconds
            );


        return {

            success: true,

            mode:
                this.mode,

            movement:
                this.priorityMovement,

            targetGreenSeconds:
                this.targetGreenSeconds,

            targetPhase:
                phase.green

        };

    }


    // --------------------------------------------------
    // ACTIVATE PRIORITY
    // --------------------------------------------------

    activatePriority() {

        if (
            !this.priorityMovement
        ) {

            return {

                success: false,

                reason:
                    "NO_PRIORITY_MOVEMENT"

            };

        }


        const phase =
            this.getPhaseForMovement(
                this.priorityMovement
            );


        if (!phase) {

            return {

                success: false,

                reason:
                    "INVALID_PRIORITY_MOVEMENT"

            };

        }


        this.originalPhase =
            this.signalController.phase;


        this.mode =
            SIGNAL_PRIORITY_MODES.ACTIVE;


        // --------------------------------------------------
        // REQUIRED MOVEMENT ALREADY GREEN
        // --------------------------------------------------

        if (
            this.signalController.phase ===
            phase.green
        ) {

            this.signalController.remainingSeconds =
                Math.max(

                    this.signalController
                        .remainingSeconds,

                    this.targetGreenSeconds

                );

        }


        // --------------------------------------------------
        // REQUIRED MOVEMENT IS NOT GREEN
        // --------------------------------------------------

        else {

            this.signalController.phase =
                phase.green;

            this.signalController.remainingSeconds =
                this.targetGreenSeconds;

        }


        return {

            success: true,

            mode:
                this.mode,

            movement:
                this.priorityMovement,

            phase:
                this.signalController.phase,

            remainingSeconds:
                this.signalController
                    .remainingSeconds

        };

    }


    // --------------------------------------------------
    // RELEASE PRIORITY
    // --------------------------------------------------

    releasePriority() {

        this.mode =
            SIGNAL_PRIORITY_MODES.RELEASE;


        this.priorityMovement =
            null;

        this.targetGreenSeconds =
            null;


        // Return to normal cycle.

        if (
            this.originalPhase
        ) {

            this.signalController.phase =
                this.originalPhase;


            this.signalController.remainingSeconds =
                DEFAULT_SIGNAL_TIMINGS[
                    this.originalPhase
                ];

        }


        this.originalPhase =
            null;


        this.mode =
            SIGNAL_PRIORITY_MODES.NORMAL;


        return {

            success: true,

            mode:
                this.mode,

            phase:
                this.signalController.phase,

            remainingSeconds:
                this.signalController
                    .remainingSeconds

        };

    }


    // --------------------------------------------------
    // UPDATE
    // --------------------------------------------------

    update() {

        if (
            this.mode !==
            SIGNAL_PRIORITY_MODES.ACTIVE
        ) {

            return;

        }


        if (
            this.signalController
                .remainingSeconds <= 0
        ) {

            this.releasePriority();

        }

    }


    // --------------------------------------------------
    // GET STATE
    // --------------------------------------------------

    getState() {

        return {

            intersectionId:
                this.priorityIntersection,

            mode:
                this.mode,

            priorityMovement:
                this.priorityMovement,

            targetGreenSeconds:
                this.targetGreenSeconds,

            signalPhase:
                this.signalController
                    ?.phase || null,

            remainingSeconds:
                this.signalController
                    ?.remainingSeconds ?? null

        };

    }

}