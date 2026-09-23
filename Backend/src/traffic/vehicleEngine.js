// Backend/src/traffic/vehicleEngine.js

import { evaluateVehicleAtSignal } from "./trafficDecision.js";

import {
    SIGNAL_STATES,
    TRAFFIC_RULE_CONFIG
} from "./trafficRules.js";

import {
    getMovementDirection,
    isNorthSouthMovement,
    isEastWestMovement
} from "../signals/movementDirection.js";

import {
    getVehicleAhead,
    evaluateVehicleSpacing
} from "./trafficSpacing.js";

import {
    getLaneForMovement,
    getMovementInfo
} from "./routeEngine.js";


export class VehicleEngine {

    constructor({
        vehicles = [],
        lanes = {},
        signals = {}
    }) {

        this.vehicles = vehicles;

        this.lanes = lanes;

        this.signals = signals;

    }


    // --------------------------------------------------
    // UPDATE ALL VEHICLES
    // --------------------------------------------------

    update(deltaTime) {

        for (const vehicle of this.vehicles) {

            this.updateVehicle(
                vehicle,
                deltaTime
            );

        }

    }


    // --------------------------------------------------
    // UPDATE SINGLE VEHICLE
    // --------------------------------------------------

    updateVehicle(vehicle, deltaTime) {

        if (!vehicle.active) {

            return;

        }


        // ----------------------------------------------
        // GET CURRENT LANE
        // ----------------------------------------------

        const lane =
            this.lanes[vehicle.laneId];


        if (!lane) {

            return;

        }


        vehicle.setLaneLength(
            lane.length
        );


        // ----------------------------------------------
        // RESET TEMPORARY SPEED
        // ----------------------------------------------

        /*
            targetSpeed
                = permanent/default cruising speed

            desiredSpeed
                = temporary speed for this update

            speed
                = actual physical speed
        */

        vehicle.resetDesiredSpeed();


        // ----------------------------------------------
        // SIGNAL DECISION
        // ----------------------------------------------

        const signal =
            this.signals[vehicle.nextNode];


        if (signal) {

            const signalState =
                this.getVehicleSignalState(
                    vehicle,
                    signal
                );


            evaluateVehicleAtSignal(
                vehicle,
                lane,
                signalState
            );


            // ------------------------------------------
            // STOP LINE PROTECTION
            // ------------------------------------------

            const stopLinePosition =
                lane.length -
                TRAFFIC_RULE_CONFIG.STOP_LINE_DISTANCE;


            if (
                vehicle.waitingForSignal &&
                vehicle.desiredSpeed === 0 &&
                vehicle.position >= stopLinePosition
            ) {

                vehicle.position =
                    stopLinePosition;

                vehicle.speed = 0;

                return;

            }

        }


        // ----------------------------------------------
        // VEHICLE AHEAD
        // ----------------------------------------------

        const vehicleAhead =
            getVehicleAhead(
                vehicle,
                this.vehicles
            );


        // ----------------------------------------------
        // SPACING DECISION
        // ----------------------------------------------

        const spacingDecision =
            evaluateVehicleSpacing(
                vehicle,
                vehicleAhead
            );


        // ----------------------------------------------
        // APPLY SPACING DECISION
        // ----------------------------------------------

        switch (spacingDecision.action) {

            case "EMERGENCY_STOP":

                vehicle.setDesiredSpeed(0);

                vehicle.state = "WAITING";

                vehicle.waitingForSignal = false;

                break;


            case "STOP":

                vehicle.setDesiredSpeed(0);

                vehicle.state = "WAITING";

                vehicle.waitingForSignal = false;

                break;


            case "SLOW_DOWN":

                if (
                    Number.isFinite(
                        spacingDecision.desiredSpeed
                    )
                ) {

                    vehicle.setDesiredSpeed(
                        Math.min(
                            vehicle.desiredSpeed,
                            spacingDecision.desiredSpeed
                        )
                    );

                }

                break;


            case "FOLLOW":

                if (
                    Number.isFinite(
                        spacingDecision.desiredSpeed
                    )
                ) {

                    vehicle.setDesiredSpeed(
                        Math.min(
                            vehicle.desiredSpeed,
                            spacingDecision.desiredSpeed
                        )
                    );

                }

                break;


            case "CLEAR":

            default:

                // Keep the speed selected by
                // signal logic.

                break;

        }


        // ----------------------------------------------
        // APPLY PHYSICS
        // ----------------------------------------------

        vehicle.applyTargetSpeed(
            deltaTime
        );


        // ----------------------------------------------
        // MOVE VEHICLE
        // ----------------------------------------------

        vehicle.updatePosition(
            deltaTime
        );


        // ----------------------------------------------
        // CHECK INTERSECTION
        // ----------------------------------------------

        if (
            vehicle.position >= lane.length
        ) {

            this.handleIntersectionArrival(
                vehicle
            );

        }

    }


    // --------------------------------------------------
    // LOOK AHEAD FOR SAME-LANE VEHICLES
    // --------------------------------------------------

    getNearestVehicleAhead(vehicle) {

        if (
            !vehicle ||
            !vehicle.laneId
        ) {

            return null;

        }


        let nearest = null;

        let nearestGap = Infinity;


        for (const other of this.vehicles) {

            if (
                other.id === vehicle.id ||
                !other.active ||
                other.laneId !== vehicle.laneId ||
                other.roadId !== vehicle.roadId
            ) {

                continue;

            }


            if (
                other.position <=
                vehicle.position
            ) {

                continue;

            }


            const gap =
                other.position -
                vehicle.position;


            if (
                gap < nearestGap
            ) {

                nearest =
                    other;

                nearestGap =
                    gap;

            }

        }


        return nearest;

    }


    // --------------------------------------------------
    // GET SIGNAL STATE
    // --------------------------------------------------

    getVehicleSignalState(
        vehicle,
        signal
    ) {

        const phase =
            signal.phase;


        // ----------------------------------------------
        // DETERMINE MOVEMENT
        // ----------------------------------------------

        const movementDirection =
            getMovementDirection(
                vehicle.currentNode,
                vehicle.nextNode
            );


        // ----------------------------------------------
        // INVALID MOVEMENT
        // ----------------------------------------------

        if (!movementDirection) {

            return SIGNAL_STATES.RED;

        }


        // ==================================================
        // NORTH / SOUTH MOVEMENT
        // ==================================================

        if (
            isNorthSouthMovement(
                movementDirection
            )
        ) {

            switch (phase) {

                case "NORTH_SOUTH_GREEN":

                    return SIGNAL_STATES.GREEN;


                case "NORTH_SOUTH_YELLOW":

                    return SIGNAL_STATES.YELLOW;


                case "EAST_WEST_GREEN":

                    return SIGNAL_STATES.RED;


                case "EAST_WEST_YELLOW":

                    return SIGNAL_STATES.RED;


                default:

                    return SIGNAL_STATES.RED;

            }

        }


        // ==================================================
        // EAST / WEST MOVEMENT
        // ==================================================

        if (
            isEastWestMovement(
                movementDirection
            )
        ) {

            switch (phase) {

                case "NORTH_SOUTH_GREEN":

                    return SIGNAL_STATES.RED;


                case "NORTH_SOUTH_YELLOW":

                    return SIGNAL_STATES.RED;


                case "EAST_WEST_GREEN":

                    return SIGNAL_STATES.GREEN;


                case "EAST_WEST_YELLOW":

                    return SIGNAL_STATES.YELLOW;


                default:

                    return SIGNAL_STATES.RED;

            }

        }


        // ----------------------------------------------
        // SAFETY DEFAULT
        // ----------------------------------------------

        return SIGNAL_STATES.RED;

    }


    // --------------------------------------------------
    // HANDLE INTERSECTION ARRIVAL
    // --------------------------------------------------

    handleIntersectionArrival(vehicle) {

        const route =
            vehicle.route;


        // ----------------------------------------------
        // VALIDATE ROUTE
        // ----------------------------------------------

        if (
            !Array.isArray(route) ||
            route.length < 2
        ) {

            this.completeVehicle(
                vehicle
            );

            return;

        }


        // ----------------------------------------------
        // CURRENT ROUTE INDEX
        // ----------------------------------------------

        const currentIndex =
            vehicle.routeIndex;


        // ----------------------------------------------
        // LAST ROAD
        // ----------------------------------------------

        if (
            currentIndex >=
            route.length - 2
        ) {

            this.completeVehicle(
                vehicle
            );

            return;

        }


        // ----------------------------------------------
        // NEXT ROUTE SEGMENT
        // ----------------------------------------------

        const nextIndex =
            currentIndex + 1;


        const newCurrentNode =
            route[nextIndex];


        const newNextNode =
            route[nextIndex + 1];


        // ----------------------------------------------
        // GET NEXT MOVEMENT
        // ----------------------------------------------

        const movement =
            getMovementInfo(
                newCurrentNode,
                newNextNode,
                1
            );


        if (!movement) {

            console.error(
                `Unable to find movement: ${newCurrentNode} → ${newNextNode}`
            );

            this.completeVehicle(
                vehicle
            );

            return;

        }


        // ----------------------------------------------
        // UPDATE ROUTE
        // ----------------------------------------------

        vehicle.routeIndex =
            nextIndex;


        // ----------------------------------------------
        // UPDATE NODES
        // ----------------------------------------------

        vehicle.currentNode =
            newCurrentNode;


        vehicle.nextNode =
            newNextNode;


        // ----------------------------------------------
        // UPDATE ROAD
        // ----------------------------------------------

        vehicle.roadId =
            movement.roadId;


        // ----------------------------------------------
        // UPDATE LANE
        // ----------------------------------------------

        const nextLane =
            getLaneForMovement(
                newCurrentNode,
                newNextNode,
                1
            );


        if (!nextLane) {

            console.error(
                `Unable to find lane: ${newCurrentNode} → ${newNextNode}`
            );

            this.completeVehicle(
                vehicle
            );

            return;

        }


        vehicle.laneId =
            nextLane.id;


        // ----------------------------------------------
        // RESET POSITION
        // ----------------------------------------------

        vehicle.position = 0;


        // ----------------------------------------------
        // RESET SPEED
        // ----------------------------------------------

        vehicle.speed = 0;


        // ----------------------------------------------
        // RESET TEMPORARY SPEED
        // ----------------------------------------------

        vehicle.resetDesiredSpeed();


        // ----------------------------------------------
        // RESET STATE
        // ----------------------------------------------

        vehicle.state =
            "STOPPED";


        vehicle.waitingForSignal =
            false;


        // ----------------------------------------------
        // DEBUG
        // ----------------------------------------------

        console.log(
            `🚗 ${vehicle.id} transitioned: ` +
            `${vehicle.currentNode} → ` +
            `${vehicle.nextNode} ` +
            `| ${vehicle.roadId} ` +
            `| ${vehicle.laneId}`
        );

    }


    // --------------------------------------------------
    // COMPLETE VEHICLE
    // --------------------------------------------------

    completeVehicle(vehicle) {

        vehicle.active = false;

        vehicle.state =
            "COMPLETED";

        vehicle.speed = 0;

        vehicle.waitingForSignal =
            false;

        vehicle.resetDesiredSpeed();

    }


    // --------------------------------------------------
    // GET VEHICLE STATES
    // --------------------------------------------------

    getStates() {

        return this.vehicles.map(
            vehicle =>
                vehicle.getState()
        );

    }

}