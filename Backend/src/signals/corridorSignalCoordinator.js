// Backend/src/signals/corridorSignalCoordinator.js

import {
    GREEN_CORRIDOR_STATUS
} from "../greenCorridor/greenCorridorEngine.js";

import {
    SIGNAL_PRIORITY_MODES
} from "./signalPriorityController.js";


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

    }


    // --------------------------------------------------
    // REGISTER PRIORITY CONTROLLER
    // --------------------------------------------------

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


    // --------------------------------------------------
    // GET PRIORITY CONTROLLER
    // --------------------------------------------------

    getPriorityController(
        intersectionId
    ) {

        return this.priorityControllers.get(
            intersectionId
        ) || null;

    }


    // --------------------------------------------------
    // APPLY CORRIDOR
    // --------------------------------------------------

    applyCorridor(
        corridorSnapshot
    ) {

        if (
            !corridorSnapshot ||
            !Array.isArray(
                corridorSnapshot.intersections
            )
        ) {

            return {

                success: false,

                reason:
                    "INVALID_CORRIDOR"

            };

        }


        const decisions = [];

        let activePriority =
            null;


        for (
            const intersection
            of corridorSnapshot.intersections
        ) {

            const controller =
                this.getPriorityController(
                    intersection.intersectionId
                );


            if (!controller) {

                decisions.push({

                    intersectionId:
                        intersection.intersectionId,

                    success: false,

                    reason:
                        "NO_PRIORITY_CONTROLLER"

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


                // ----------------------------------------------
                // ALREADY ACTIVE WITH SAME MOVEMENT
                // ----------------------------------------------

                if (
                    controller.mode ===
                    SIGNAL_PRIORITY_MODES.ACTIVE &&

                    controller.priorityMovement ===
                    requestedMovement
                ) {

                    decisions.push({

                        intersectionId:
                            intersection.intersectionId,

                        status:
                            intersection.status,

                        action:
                            "MAINTAIN_PRIORITY",

                        success: true,

                        controllerState:
                            controller.getState()

                    });


                    activePriority = {

                        intersectionId:
                            intersection.intersectionId,

                        movement:
                            requestedMovement

                    };


                    continue;

                }


                // ----------------------------------------------
                // ACTIVE BUT MOVEMENT CHANGED
                // ----------------------------------------------

                if (
                    controller.mode ===
                    SIGNAL_PRIORITY_MODES.ACTIVE &&

                    controller.priorityMovement !==
                    requestedMovement
                ) {

                    controller.releasePriority();

                }


                // ----------------------------------------------
                // PREPARE NEW MOVEMENT
                // ----------------------------------------------

                const prepareResult =
                    controller.preparePriority(

                        requestedMovement,

                        this.defaultPriorityGreenSeconds

                    );


                if (
                    !prepareResult.success
                ) {

                    decisions.push({

                        intersectionId:
                            intersection.intersectionId,

                        status:
                            intersection.status,

                        action:
                            "PREPARE_PRIORITY_FAILED",

                        success: false,

                        reason:
                            prepareResult.reason

                    });

                    continue;

                }


                // ----------------------------------------------
                // ACTIVATE
                // ----------------------------------------------

                const activateResult =
                    controller.activatePriority();


                decisions.push({

                    intersectionId:
                        intersection.intersectionId,

                    status:
                        intersection.status,

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

                        intersectionId:
                            intersection.intersectionId,

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


                // ----------------------------------------------
                // ACTIVE WITH SAME MOVEMENT
                // ----------------------------------------------

                if (
                    controller.mode ===
                    SIGNAL_PRIORITY_MODES.ACTIVE &&

                    controller.priorityMovement ===
                    requestedMovement
                ) {

                    decisions.push({

                        intersectionId:
                            intersection.intersectionId,

                        status:
                            intersection.status,

                        action:
                            "MAINTAIN_PRIORITY",

                        success: true,

                        controllerState:
                            controller.getState()

                    });

                    continue;

                }


                // ----------------------------------------------
                // PREPARE WITH SAME MOVEMENT
                // ----------------------------------------------

                if (
                    controller.mode ===
                    SIGNAL_PRIORITY_MODES.PREPARE &&

                    controller.priorityMovement ===
                    requestedMovement
                ) {

                    decisions.push({

                        intersectionId:
                            intersection.intersectionId,

                        status:
                            intersection.status,

                        action:
                            "MAINTAIN_PREPARE",

                        success: true,

                        controllerState:
                            controller.getState()

                    });

                    continue;

                }


                // ----------------------------------------------
                // OLD MOVEMENT
                // ----------------------------------------------

                if (
                    controller.mode !==
                    SIGNAL_PRIORITY_MODES.NORMAL
                ) {

                    controller.releasePriority();

                }


                // ----------------------------------------------
                // PREPARE NEW MOVEMENT
                // ----------------------------------------------

                const result =
                    controller.preparePriority(

                        requestedMovement,

                        this.defaultPriorityGreenSeconds

                    );


                decisions.push({

                    intersectionId:
                        intersection.intersectionId,

                    status:
                        intersection.status,

                    action:
                        "PREPARE_PRIORITY",

                    success:
                        result.success,

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

                    const result =
                        controller.releasePriority();


                    decisions.push({

                        intersectionId:
                            intersection.intersectionId,

                        status:
                            intersection.status,

                        action:
                            "RELEASE_PRIORITY",

                        success:
                            result.success,

                        controllerState:
                            controller.getState()

                    });

                }
                else {

                    decisions.push({

                        intersectionId:
                            intersection.intersectionId,

                        status:
                            intersection.status,

                        action:
                            "MAINTAIN_NORMAL",

                        success: true,

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

                /*
                 * Do not automatically release a priority
                 * controller here.
                 *
                 * The intersection may still be transitioning
                 * between corridor states.
                 */

                decisions.push({

                    intersectionId:
                        intersection.intersectionId,

                    status:
                        intersection.status,

                    action:
                        controller.mode ===
                        SIGNAL_PRIORITY_MODES.NORMAL

                        ? "MAINTAIN_NORMAL"

                        : "MAINTAIN_PRIORITY_STATE",

                    success: true,

                    controllerState:
                        controller.getState()

                });

            }

        }


        this.activeIntersection =
            activePriority;


        return {

            success: true,

            activePriority:
                activePriority,

            decisions

        };

    }


    // --------------------------------------------------
    // RELEASE ALL PRIORITY
    // --------------------------------------------------

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


        return released;

    }


    // --------------------------------------------------
    // GET STATE
    // --------------------------------------------------

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

            controllers

        };

    }

}