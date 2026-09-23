// Backend/src/traffic/trafficVehicle.js

import {
    TRAFFIC_RULE_CONFIG
} from "./trafficRules.js";


// --------------------------------------------------
// VEHICLE TYPES
// --------------------------------------------------

export const VEHICLE_TYPES = {

    CAR: "CAR",

    BIKE: "BIKE",

    AUTO: "AUTO",

    BUS: "BUS",

    TRUCK: "TRUCK"

};


// --------------------------------------------------
// VEHICLE STATES
// --------------------------------------------------

export const VEHICLE_STATES = {

    MOVING: "MOVING",

    WAITING: "WAITING",

    STOPPED: "STOPPED"

};


// --------------------------------------------------
// TRAFFIC VEHICLE
// --------------------------------------------------

export class TrafficVehicle {

    constructor({

        id,

        type,

        roadId,

        laneId,

        currentNode,

        nextNode,

        route = []

    }) {

        this.id = id;

        this.type = type;

        this.roadId = roadId;

        this.laneId = laneId;

        this.currentNode = currentNode;

        this.nextNode = nextNode;

        this.route = route;


        // ------------------------------------------
        // ROUTE INDEX
        // ------------------------------------------

        // Example:
        //
        // route:
        // [INT-01, INT-02, INT-03]
        //
        // routeIndex = 0
        // INT-01 → INT-02
        //
        // routeIndex = 1
        // INT-02 → INT-03

        this.routeIndex = 0;


        // ------------------------------------------
        // POSITION
        // ------------------------------------------

        // Distance travelled along current lane.
        // Unit: metres

        this.position = 0;


        // ------------------------------------------
        // SPEED
        // ------------------------------------------

        // Actual current speed.
        // Unit: metres / second

        this.speed = 0;


        // ------------------------------------------
        // TARGET SPEED
        // ------------------------------------------

        // Normal cruising speed of this vehicle.
        //
        // This value should NOT be permanently changed
        // because of temporary traffic conditions.

        this.targetSpeed =
            this.getDefaultSpeed();


        // ------------------------------------------
        // DESIRED SPEED
        // ------------------------------------------

        // Temporary speed required by the current
        // traffic situation.
        //
        // Examples:
        //
        // Normal road:
        // targetSpeed = 9
        // desiredSpeed = 9
        //
        // Following vehicle:
        // targetSpeed = 9
        // desiredSpeed = 5
        //
        // Stopped:
        // targetSpeed = 9
        // desiredSpeed = 0

        this.desiredSpeed =
            this.targetSpeed;


        // ------------------------------------------
        // STATE
        // ------------------------------------------

        this.state =
            VEHICLE_STATES.STOPPED;


        // ------------------------------------------
        // SIGNAL STATE
        // ------------------------------------------

        this.waitingForSignal = false;


        // ------------------------------------------
        // ACTIVITY
        // ------------------------------------------

        this.active = true;


        // ------------------------------------------
        // CURRENT LANE LENGTH
        // ------------------------------------------

        this.laneLength = null;

    }


    // --------------------------------------------------
    // DEFAULT SPEED
    // --------------------------------------------------

    getDefaultSpeed() {

        switch (this.type) {

            case VEHICLE_TYPES.BIKE:

                return 10;


            case VEHICLE_TYPES.AUTO:

                return 8;


            case VEHICLE_TYPES.CAR:

                return 9;


            case VEHICLE_TYPES.BUS:

                return 7;


            case VEHICLE_TYPES.TRUCK:

                return 6;


            default:

                return 8;

        }

    }


    // --------------------------------------------------
    // START MOVING
    // --------------------------------------------------

    setMoving() {

        this.state =
            VEHICLE_STATES.MOVING;

        this.waitingForSignal =
            false;

    }


    // --------------------------------------------------
    // SET DESIRED SPEED
    // --------------------------------------------------

    setDesiredSpeed(speed) {

        if (!Number.isFinite(speed)) {

            speed =
                this.targetSpeed;

        }


        this.desiredSpeed =
            Math.max(

                0,

                Math.min(

                    speed,

                    this.targetSpeed

                )

            );

    }


    // --------------------------------------------------
    // RESET DESIRED SPEED
    // --------------------------------------------------

    resetDesiredSpeed() {

        this.desiredSpeed =
            this.targetSpeed;

    }


    // --------------------------------------------------
    // STOP FOR SIGNAL
    // --------------------------------------------------

    stopForSignal() {

        this.state =
            VEHICLE_STATES.WAITING;

        this.waitingForSignal =
            true;


        // Do NOT modify targetSpeed.
        //
        // The vehicle still wants to travel at its
        // normal cruising speed after the signal opens.

        this.desiredSpeed = 0;

        this.speed = 0;

    }


    // --------------------------------------------------
    // SLOW DOWN
    // --------------------------------------------------

    slowDown() {

        this.state =
            VEHICLE_STATES.MOVING;

        this.waitingForSignal =
            false;


        // Reduce the desired speed temporarily.
        //
        // targetSpeed remains unchanged.

        this.desiredSpeed =
            Math.max(

                0,

                this.speed - 1

            );

    }


    // --------------------------------------------------
    // APPLY REALISTIC SPEED CHANGE
    // --------------------------------------------------

    applyTargetSpeed(deltaTime) {

        if (!Number.isFinite(
            this.targetSpeed
        )) {

            this.targetSpeed =
                this.getDefaultSpeed();

        }


        if (!Number.isFinite(
            this.desiredSpeed
        )) {

            this.desiredSpeed =
                this.targetSpeed;

        }


        // Make sure desired speed never exceeds
        // the normal cruising speed.

        this.desiredSpeed =
            Math.max(

                0,

                Math.min(

                    this.desiredSpeed,

                    this.targetSpeed

                )

            );


        // ------------------------------------------
        // ACCELERATION
        // ------------------------------------------

        if (
            this.speed <
            this.desiredSpeed
        ) {

            this.speed =
                Math.min(

                    this.desiredSpeed,

                    this.speed +

                    TRAFFIC_RULE_CONFIG
                        .MAX_ACCELERATION *

                    deltaTime

                );

        }


        // ------------------------------------------
        // DECELERATION
        // ------------------------------------------

        else if (
            this.speed >
            this.desiredSpeed
        ) {

            this.speed =
                Math.max(

                    this.desiredSpeed,

                    this.speed -

                    TRAFFIC_RULE_CONFIG
                        .MAX_DECELERATION *

                    deltaTime

                );

        }


        // ------------------------------------------
        // SMALL SPEED CLEANUP
        // ------------------------------------------

        if (
            Math.abs(this.speed) <
            0.05
        ) {

            this.speed = 0;

        }

    }


    // --------------------------------------------------
    // DISTANCE TO INTERSECTION
    // --------------------------------------------------

    getDistanceToIntersection(lane) {

        if (!lane) {

            return null;

        }


        return Math.max(

            0,

            lane.length -
            this.position

        );

    }


    // --------------------------------------------------
    // UPDATE POSITION
    // --------------------------------------------------

    updatePosition(deltaTime) {

        if (!this.active) {

            return;

        }


        if (
            this.state !==
            VEHICLE_STATES.MOVING
        ) {

            return;

        }


        // Apply acceleration/deceleration
        // before moving.

        this.applyTargetSpeed(
            deltaTime
        );


        // Move using the actual speed.

        this.position +=
            this.speed *
            deltaTime;


        // ------------------------------------------
        // PREVENT OVERSHOOT
        // ------------------------------------------

        if (
            this.laneLength !== null
        ) {

            this.position =
                Math.min(

                    this.position,

                    this.laneLength

                );

        }

    }


    // --------------------------------------------------
    // SET LANE LENGTH
    // --------------------------------------------------

    setLaneLength(length) {

        this.laneLength =
            length;

    }


    // --------------------------------------------------
    // GET VEHICLE STATE
    // --------------------------------------------------

    getState() {

        return {

            id:
                this.id,

            type:
                this.type,

            roadId:
                this.roadId,

            laneId:
                this.laneId,

            currentNode:
                this.currentNode,

            nextNode:
                this.nextNode,

            route:
                this.route,

            routeIndex:
                this.routeIndex,

            position:
                this.position,

            speed:
                this.speed,

            targetSpeed:
                this.targetSpeed,

            desiredSpeed:
                this.desiredSpeed,

            state:
                this.state,

            waitingForSignal:
                this.waitingForSignal,

            active:
                this.active

        };

    }

}