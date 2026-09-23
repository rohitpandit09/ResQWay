// Backend/src/ambulance/ambulance.js

// --------------------------------------------------
// AMBULANCE STATES
// --------------------------------------------------

export const AMBULANCE_STATES = {

    IDLE: "IDLE",

    DISPATCHED: "DISPATCHED",

    EN_ROUTE_TO_CLIENT: "EN_ROUTE_TO_CLIENT",

    ARRIVED_AT_CLIENT: "ARRIVED_AT_CLIENT",

    PICKUP: "PICKUP",

    EN_ROUTE_TO_HOSPITAL: "EN_ROUTE_TO_HOSPITAL",

    ARRIVED_AT_HOSPITAL: "ARRIVED_AT_HOSPITAL",

    COMPLETED: "COMPLETED"

};


// --------------------------------------------------
// AMBULANCE
// --------------------------------------------------

export class Ambulance {

    constructor({

        id,

        baseNode = null

    }) {

        // ------------------------------------------
        // IDENTITY
        // ------------------------------------------

        this.id = id;


        // ------------------------------------------
        // BASE
        // ------------------------------------------

        this.baseNode = baseNode;


        // ------------------------------------------
        // CURRENT POSITION
        // ------------------------------------------

        this.currentNode = baseNode;

        this.nextNode = null;

        this.roadId = null;

        this.laneId = null;


        // ------------------------------------------
        // ROUTE
        // ------------------------------------------

        this.route = [];

        this.routeIndex = 0;


        // ------------------------------------------
        // POSITION
        // ------------------------------------------

        // Distance travelled along current lane.
        // Unit: metres.

        this.position = 0;


        // ------------------------------------------
        // SPEED
        // ------------------------------------------

        // Actual speed.
        // Unit: metres / second.

        this.speed = 0;


        // ------------------------------------------
        // TARGET SPEED
        // ------------------------------------------

        // Emergency cruising speed.

        this.targetSpeed = 14;


        // ------------------------------------------
        // DESIRED SPEED
        // ------------------------------------------

        // Temporary speed controlled by
        // traffic / signal / emergency logic.

        this.desiredSpeed = this.targetSpeed;


        // ------------------------------------------
        // STATE
        // ------------------------------------------

        this.state = AMBULANCE_STATES.IDLE;


        // ------------------------------------------
        // ACTIVE
        // ------------------------------------------

        this.active = true;


        // ------------------------------------------
        // LANE LENGTH
        // ------------------------------------------

        this.laneLength = null;


        // ------------------------------------------
        // CLIENT
        // ------------------------------------------

        this.clientNode = null;


        // ------------------------------------------
        // HOSPITAL
        // ------------------------------------------

        this.hospitalNode = null;


        // ------------------------------------------
        // PICKUP STATUS
        // ------------------------------------------

        this.patientPickedUp = false;

    }


    // --------------------------------------------------
    // DISPATCH
    // --------------------------------------------------

    dispatch(clientNode) {

        if (!clientNode) {

            throw new Error(
                "Client node is required for ambulance dispatch."
            );

        }


        this.clientNode = clientNode;

        this.state =
            AMBULANCE_STATES.DISPATCHED;

    }


    // --------------------------------------------------
    // START JOURNEY TO CLIENT
    // --------------------------------------------------

    startClientJourney(route = []) {

        this.route = [...route];

        this.routeIndex = 0;

        this.position = 0;

        this.speed = 0;

        this.desiredSpeed =
            this.targetSpeed;

        this.state =
            AMBULANCE_STATES.EN_ROUTE_TO_CLIENT;

        this.active = true;

    }


    // --------------------------------------------------
    // ARRIVED AT CLIENT
    // --------------------------------------------------

    arriveAtClient() {

        this.position = 0;

        this.speed = 0;

        this.desiredSpeed = 0;

        this.state =
            AMBULANCE_STATES.ARRIVED_AT_CLIENT;

    }


    // --------------------------------------------------
    // PICKUP PATIENT
    // --------------------------------------------------

    pickupPatient() {

        this.patientPickedUp = true;

        this.speed = 0;

        this.desiredSpeed = 0;

        this.state =
            AMBULANCE_STATES.PICKUP;

    }


    // --------------------------------------------------
    // START JOURNEY TO HOSPITAL
    // --------------------------------------------------

    startHospitalJourney({

        hospitalNode,

        route = []

    }) {

        if (!hospitalNode) {

            throw new Error(
                "Hospital node is required."
            );

        }


        this.hospitalNode =
            hospitalNode;


        this.route = [...route];

        this.routeIndex = 0;

        this.position = 0;

        this.speed = 0;

        this.desiredSpeed =
            this.targetSpeed;


        this.state =
            AMBULANCE_STATES.EN_ROUTE_TO_HOSPITAL;


        this.active = true;

    }


    // --------------------------------------------------
    // ARRIVED AT HOSPITAL
    // --------------------------------------------------

    arriveAtHospital() {

        this.position = 0;

        this.speed = 0;

        this.desiredSpeed = 0;

        this.state =
            AMBULANCE_STATES.ARRIVED_AT_HOSPITAL;

    }


    // --------------------------------------------------
    // COMPLETE TRIP
    // --------------------------------------------------

    complete() {

        this.speed = 0;

        this.desiredSpeed = 0;

        this.state =
            AMBULANCE_STATES.COMPLETED;

        this.active = false;

    }


    // --------------------------------------------------
    // SET MOVING
    // --------------------------------------------------

    setMoving() {

        if (
            this.state !==
            AMBULANCE_STATES.EN_ROUTE_TO_CLIENT &&
            this.state !==
            AMBULANCE_STATES.EN_ROUTE_TO_HOSPITAL
        ) {

            return;

        }


        this.desiredSpeed =
            this.targetSpeed;

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
    // APPLY SPEED PHYSICS
    // --------------------------------------------------

    applySpeed(deltaTime) {

        if (
            !Number.isFinite(deltaTime) ||
            deltaTime <= 0
        ) {

            return;

        }


        const MAX_ACCELERATION = 3;

        const MAX_DECELERATION = 6;


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
                    MAX_ACCELERATION *
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
                    MAX_DECELERATION *
                    deltaTime

                );

        }


        // ------------------------------------------
        // CLEANUP
        // ------------------------------------------

        if (
            Math.abs(this.speed) <
            0.05
        ) {

            this.speed = 0;

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
    // UPDATE POSITION
    // --------------------------------------------------

    updatePosition(deltaTime) {

        if (!this.active) {

            return;

        }


        if (
            this.state !==
            AMBULANCE_STATES.EN_ROUTE_TO_CLIENT &&
            this.state !==
            AMBULANCE_STATES.EN_ROUTE_TO_HOSPITAL
        ) {

            return;

        }


        this.applySpeed(deltaTime);


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
    // GET DISTANCE TO NEXT INTERSECTION
    // --------------------------------------------------

    getDistanceToIntersection() {

        if (
            this.laneLength === null
        ) {

            return null;

        }


        return Math.max(

            0,

            this.laneLength -
            this.position

        );

    }


    // --------------------------------------------------
    // GET AMBULANCE STATE
    // --------------------------------------------------

    getState() {

        return {

            id:
                this.id,

            baseNode:
                this.baseNode,

            currentNode:
                this.currentNode,

            nextNode:
                this.nextNode,

            roadId:
                this.roadId,

            laneId:
                this.laneId,

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

            active:
                this.active,

            clientNode:
                this.clientNode,

            hospitalNode:
                this.hospitalNode,

            patientPickedUp:
                this.patientPickedUp

        };

    }

}