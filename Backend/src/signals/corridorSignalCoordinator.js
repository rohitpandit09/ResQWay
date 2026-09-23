// Backend/src/signals/corridorSignalCoordinator.js

import {
    GREEN_CORRIDOR_STATUS
} from "../greenCorridor/greenCorridorEngine.js";

import {
    SIGNAL_PRIORITY_MODES
} from "./signalPriorityController.js";


// ==================================================
// CORRIDOR SIGNAL COORDINATOR
// ==================================================

export class CorridorSignalCoordinator {

    constructor(options = {}) {

        this.greenCorridorEngine =
            options.greenCorridorEngine || null;

        this.priorityControllers =
            options.priorityControllers ||
            new Map();

        this.defaultPriorityGreenSeconds =
            options.defaultPriorityGreenSeconds ||
            12;

        this.activeIntersection =
            null;

        this.lastControlState =
            null;

    }


    // ==================================================
    // REGISTER PRIORITY CONTROLLER
    // ==================================================

    registerPriorityController(
        intersectionId,
        controller
    ) {

        if (
            !intersectionId ||
            !controller
        ) {

            throw new Error(
                "Intersection ID and priority controller are required."
            );

        }

        this.priorityControllers.set(
            intersectionId,
            controller
        );

    }


    // ==================================================
    // GET PRIORITY CONTROLLER
    // ==================================================

    getPriorityController(
        intersectionId
    ) {

        return this.priorityControllers.get(
            intersectionId
        ) || null;

    }


    // ==================================================
    // APPLY CORRIDOR
    // ==================================================

    applyCorridor(
        corridorSnapshot
    ) {

        if (
            !corridorSnapshot ||
            !Array.isArray(
                corridorSnapshot.intersections
            )
        ) {

            this.lastControlState = {

                success:
                    false,

                reason:
                    "INVALID_CORRIDOR",

                activePriority:
                    null,

                decisions:
                    []

            };

            return this.lastControlState;

        }


        const decisions = [];

        let activePriority =
            null;


        // ==================================================
        // PROCESS UPCOMING INTERSECTIONS
        // ==================================================

        for (
            const intersection
            of corridorSnapshot.intersections
        ) {

            const intersectionId =
                intersection.intersectionId;


            const controller =
                this.getPriorityController(
                    intersectionId
                );


            if (!controller) {

                decisions.push({

                    intersectionId,

                    status:
                        intersection.status,

                    movement:
                        intersection.movement ||
                        null,

                    action:
                        "NO_PRIORITY_CONTROLLER",

                    success:
                        false,

                    controllerState:
                        null

                });

                continue;

            }


            // ==================================================
            // EMERGENCY PRIORITY
            // ==================================================

            if (
                intersection.status ===
                GREEN_CORRIDOR_STATUS
                    .EMERGENCY_PRIORITY
            ) {

                const requestedMovement =
                    intersection.movement;


                // --------------------------------------------------
                // ALREADY ACTIVE
                // --------------------------------------------------

                if (
                    controller.mode ===
                    SIGNAL_PRIORITY_MODES.ACTIVE &&

                    controller.priorityMovement ===
                    requestedMovement
                ) {

                    /*
                     * IMPORTANT:
                     *
                     * Do NOT just report MAINTAIN_PRIORITY.
                     *
                     * Actually tell the controller to
                     * maintain the emergency green.
                     */

                    const maintainResult =
                        typeof controller.maintainPriority ===
                        "function"

                            ? controller.maintainPriority()

                            : {
                                success:
                                    true,

                                action:
                                    "MAINTAIN_PRIORITY"
                            };


                    decisions.push({

                        intersectionId,

                        status:
                            intersection.status,

                        movement:
                            requestedMovement,

                        action:
                            maintainResult.action ||
                            "MAINTAIN_PRIORITY",

                        success:
                            maintainResult.success,

                        controllerState:
                            controller.getState()

                    });


                    activePriority = {

                        intersectionId,

                        movement:
                            requestedMovement

                    };


                    continue;

                }


                // --------------------------------------------------
                // ACTIVE BUT DIFFERENT MOVEMENT
                // --------------------------------------------------

                if (
                    controller.mode ===
                    SIGNAL_PRIORITY_MODES.ACTIVE &&

                    controller.priorityMovement !==
                    requestedMovement
                ) {

                    controller.releasePriority();

                }


                // --------------------------------------------------
                // PREPARE
                // --------------------------------------------------

                const prepareResult =
                    controller.preparePriority(

                        requestedMovement,

                        this.defaultPriorityGreenSeconds

                    );


                if (
                    !prepareResult.success
                ) {

                    decisions.push({

                        intersectionId,

                        status:
                            intersection.status,

                        movement:
                            requestedMovement,

                        action:
                            "PREPARE_PRIORITY_FAILED",

                        success:
                            false,

                        reason:
                            prepareResult.reason,

                        controllerState:
                            controller.getState()

                    });

                    continue;

                }


                // --------------------------------------------------
                // ACTIVATE
                // --------------------------------------------------

                const activateResult =
                    controller.activatePriority();


                decisions.push({

                    intersectionId,

                    status:
                        intersection.status,

                    movement:
                        requestedMovement,

                    action:
                        "ACTIVATE_PRIORITY",

                    success:
                        activateResult.success,

                    controllerState:
                        controller.getState()

                });


                if (
                    activateResult.success
                ) {

                    activePriority = {

                        intersectionId,

                        movement:
                            requestedMovement

                    };

                }


                continue;

            }


            // ==================================================
            // PREPARE
            // ==================================================

            if (
                intersection.status ===
                GREEN_CORRIDOR_STATUS.PREPARE
            ) {

                const requestedMovement =
                    intersection.movement;


                // --------------------------------------------------
                // ALREADY ACTIVE
                // --------------------------------------------------

                if (
                    controller.mode ===
                    SIGNAL_PRIORITY_MODES.ACTIVE &&

                    controller.priorityMovement ===
                    requestedMovement
                ) {

                    const maintainResult =
                        typeof controller.maintainPriority ===
                        "function"

                            ? controller.maintainPriority()

                            : {
                                success:
                                    true,

                                action:
                                    "MAINTAIN_PRIORITY"
                            };


                    decisions.push({

                        intersectionId,

                        status:
                            intersection.status,

                        movement:
                            requestedMovement,

                        action:
                            maintainResult.action ||
                            "MAINTAIN_PRIORITY",

                        success:
                            maintainResult.success,

                        controllerState:
                            controller.getState()

                    });


                    activePriority = {

                        intersectionId,

                        movement:
                            requestedMovement

                    };


                    continue;

                }


                // --------------------------------------------------
                // ALREADY PREPARED
                // --------------------------------------------------

                if (
                    controller.mode ===
                    SIGNAL_PRIORITY_MODES.PREPARE &&

                    controller.priorityMovement ===
                    requestedMovement
                ) {

                    decisions.push({

                        intersectionId,

                        status:
                            intersection.status,

                        movement:
                            requestedMovement,

                        action:
                            "MAINTAIN_PREPARE",

                        success:
                            true,

                        controllerState:
                            controller.getState()

                    });

                    continue;

                }


                // --------------------------------------------------
                // REMOVE OLD PRIORITY
                // --------------------------------------------------

                if (
                    controller.mode !==
                    SIGNAL_PRIORITY_MODES.NORMAL
                ) {

                    controller.releasePriority();

                }


                // --------------------------------------------------
                // PREPARE NEW MOVEMENT
                // --------------------------------------------------

                const prepareResult =
                    controller.preparePriority(

                        requestedMovement,

                        this.defaultPriorityGreenSeconds

                    );


                decisions.push({

                    intersectionId,

                    status:
                        intersection.status,

                    movement:
                        requestedMovement,

                    action:
                        "PREPARE_PRIORITY",

                    success:
                        prepareResult.success,

                    controllerState:
                        controller.getState()

                });


                continue;

            }


            // ==================================================
            // RELEASE
            // ==================================================

            if (
                intersection.status ===
                GREEN_CORRIDOR_STATUS.RELEASE
            ) {

                if (
                    controller.mode !==
                    SIGNAL_PRIORITY_MODES.NORMAL
                ) {

                    const releaseResult =
                        controller.releasePriority();


                    decisions.push({

                        intersectionId,

                        status:
                            intersection.status,

                        movement:
                            intersection.movement ||
                            null,

                        action:
                            "RELEASE_PRIORITY",

                        success:
                            releaseResult.success,

                        controllerState:
                            controller.getState()

                    });

                }

                else {

                    decisions.push({

                        intersectionId,

                        status:
                            intersection.status,

                        movement:
                            intersection.movement ||
                            null,

                        action:
                            "MAINTAIN_NORMAL",

                        success:
                            true,

                        controllerState:
                            controller.getState()

                    });

                }


                continue;

            }


            // ==================================================
            // NORMAL
            // ==================================================

            if (
                intersection.status ===
                GREEN_CORRIDOR_STATUS.NORMAL
            ) {

                decisions.push({

                    intersectionId,

                    status:
                        intersection.status,

                    movement:
                        intersection.movement ||
                        null,

                    action:
                        controller.mode ===
                        SIGNAL_PRIORITY_MODES.NORMAL

                            ? "MAINTAIN_NORMAL"

                            : "MAINTAIN_PRIORITY_STATE",

                    success:
                        true,

                    controllerState:
                        controller.getState()

                });

            }

        }


        // ==================================================
        // ACTIVE INTERSECTION
        // ==================================================

        this.activeIntersection =
            activePriority;


        // ==================================================
        // BUILD CONTROL SUMMARY
        // ==================================================

        const priorityDecision =
            decisions.find(
                decision =>

                    decision.action ===
                    "ACTIVATE_PRIORITY" ||

                    decision.action ===
                    "MAINTAIN_PRIORITY" ||

                    decision.action ===
                    "EXTEND_PRIORITY_GREEN" ||

                    decision.action ===
                    "RESTORE_PRIORITY_GREEN"
            );


        const prepareDecision =
            decisions.find(
                decision =>

                    decision.action ===
                    "PREPARE_PRIORITY" ||

                    decision.action ===
                    "MAINTAIN_PREPARE"
            );


        const releaseDecision =
            decisions.find(
                decision =>

                    decision.action ===
                    "RELEASE_PRIORITY"
            );


        let controlMode =
            "NORMAL";


        if (
            priorityDecision
        ) {

            controlMode =
                "EMERGENCY_PRIORITY";

        }

        else if (
            prepareDecision
        ) {

            controlMode =
                "PREPARE";

        }

        else if (
            releaseDecision
        ) {

            controlMode =
                "RELEASE";

        }


        // ==================================================
        // FINAL CONTROL STATE
        // ==================================================

        this.lastControlState = {

            success:
                true,

            controlMode,

            activePriority,

            decisions,

            summary: {

                intersectionId:
                    priorityDecision?.intersectionId ||
                    prepareDecision?.intersectionId ||
                    releaseDecision?.intersectionId ||
                    null,

                movement:
                    priorityDecision?.movement ||
                    prepareDecision?.movement ||
                    releaseDecision?.movement ||
                    null,

                action:
                    priorityDecision?.action ||
                    prepareDecision?.action ||
                    releaseDecision?.action ||
                    "NO_ACTION"

            }

        };


        return this.lastControlState;

    }


    // ==================================================
    // RELEASE ALL PRIORITY
    // ==================================================

    releaseAllPriority() {

        const released = [];


        for (
            const [
                intersectionId,
                controller
            ]
            of this.priorityControllers
        ) {

            if (
                controller.mode ===
                SIGNAL_PRIORITY_MODES.ACTIVE ||

                controller.mode ===
                SIGNAL_PRIORITY_MODES.PREPARE
            ) {

                const result =
                    controller.releasePriority();


                released.push({

                    intersectionId,

                    success:
                        result.success

                });

            }

        }


        this.activeIntersection =
            null;


        this.lastControlState = {

            success:
                true,

            controlMode:
                "RELEASE",

            activePriority:
                null,

            decisions:
                released,

            summary: {

                intersectionId:
                    null,

                movement:
                    null,

                action:
                    "RELEASE_ALL"

            }

        };


        return released;

    }


    // ==================================================
    // GET STATE
    // ==================================================

    getState() {

        const controllers = [];


        for (
            const [
                intersectionId,
                controller
            ]
            of this.priorityControllers
        ) {

            controllers.push({

                intersectionId,

                state:
                    controller.getState()

            });

        }


        return {

            activeIntersection:
                this.activeIntersection,

            control:
                this.lastControlState,

            controllers

        };

    }

}