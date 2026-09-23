// Backend/src/ambulance/ambulanceEngine.js

import {
    ROADS,
    INTERSECTIONS
} from "../network/roadNetwork.js";

import {
    generateLaneGeometry
} from "../network/laneGeometry.js";

import {
    Ambulance,
    AMBULANCE_STATES
} from "./ambulance.js";

import {
    AmbulanceSignalController
} from "./ambulanceSignalController.js";

import {
    TRAFFIC_RULE_CONFIG
} from "../traffic/trafficRules.js";


// --------------------------------------------------
// AMBULANCE ENGINE
// --------------------------------------------------

export class AmbulanceEngine {

    constructor({
        signals = null
    } = {}) {

        this.lanes =
            generateLaneGeometry();

        this.ambulances =
            new Map();

        this.signals =
            signals;

        this.signalController =
            new AmbulanceSignalController({
                signals: this.signals
            });

    }


    // --------------------------------------------------
    // ADD AMBULANCE
    // --------------------------------------------------

    addAmbulance(ambulance) {

        if (!(ambulance instanceof Ambulance)) {

            throw new Error(
                "Only Ambulance instances can be added."
            );

        }

        if (this.ambulances.has(ambulance.id)) {

            throw new Error(
                `Ambulance ${ambulance.id} already exists.`
            );

        }

        this.ambulances.set(
            ambulance.id,
            ambulance
        );

        return ambulance;

    }


    // --------------------------------------------------
    // CREATE AMBULANCE
    // --------------------------------------------------

    createAmbulance({
        id,
        baseNode
    }) {

        if (!INTERSECTIONS[baseNode]) {

            throw new Error(
                `Invalid base node: ${baseNode}`
            );

        }

        const ambulance =
            new Ambulance({
                id,
                baseNode
            });

        this.addAmbulance(
            ambulance
        );

        return ambulance;

    }


    // --------------------------------------------------
    // GET AMBULANCE
    // --------------------------------------------------

    getAmbulance(id) {

        return (
            this.ambulances.get(id) ||
            null
        );

    }


    // --------------------------------------------------
    // GET ROAD CONNECTION
    // --------------------------------------------------

    getRoadConnection(
        fromNode,
        toNode
    ) {

        for (
            const road
            of Object.values(ROADS)
        ) {

            // ------------------------------------------
            // FORWARD
            // ------------------------------------------

            if (
                road.from === fromNode &&
                road.to === toNode
            ) {

                return {

                    road,

                    direction:
                        "FORWARD"

                };

            }


            // ------------------------------------------
            // BACKWARD
            // ------------------------------------------

            if (
                road.to === fromNode &&
                road.from === toNode
            ) {

                return {

                    road,

                    direction:
                        "BACKWARD"

                };

            }

        }

        return null;

    }


    // --------------------------------------------------
    // PREPARE NEXT ROAD
    // --------------------------------------------------

    prepareNextRoad(
        ambulance
    ) {

        if (!ambulance.nextNode) {

            ambulance.roadId =
                null;

            ambulance.laneId =
                null;

            ambulance.laneLength =
                null;

            return null;

        }

        const connection =
            this.getRoadConnection(

                ambulance.currentNode,

                ambulance.nextNode

            );

        if (!connection) {

            throw new Error(

                `No road found from ` +
                `${ambulance.currentNode} ` +
                `to ${ambulance.nextNode}.`

            );

        }

        const {
            road,
            direction
        } =
            connection;

        const laneId =
            `${road.id}-${direction}-1`;

        const lane =
            this.lanes[laneId];

        if (!lane) {

            throw new Error(
                `Lane ${laneId} not found.`
            );

        }

        ambulance.roadId =
            road.id;

        ambulance.laneId =
            laneId;

        ambulance.setLaneLength(
            lane.length
        );

        return lane;

    }


    // --------------------------------------------------
    // ROUTE VALIDATION
    // --------------------------------------------------

    validateRoute(
        route,
        expectedStart,
        expectedEnd
    ) {

        if (
            !Array.isArray(route) ||
            route.length < 2
        ) {

            throw new Error(
                "Ambulance route must contain at least two nodes."
            );

        }

        if (
            route[0] !==
            expectedStart
        ) {

            throw new Error(

                `Route must start at ${expectedStart}. ` +
                `Received ${route[0]}.`

            );

        }

        if (
            route.at(-1) !==
            expectedEnd
        ) {

            throw new Error(

                `Route must end at ${expectedEnd}. ` +
                `Received ${route.at(-1)}.`

            );

        }

        for (
            let i = 0;
            i < route.length - 1;
            i++
        ) {

            const from =
                route[i];

            const to =
                route[i + 1];

            if (
                !INTERSECTIONS[from] ||
                !INTERSECTIONS[to]
            ) {

                throw new Error(

                    `Invalid route nodes: ` +
                    `${from} → ${to}`

                );

            }

            if (
                !this.getRoadConnection(
                    from,
                    to
                )
            ) {

                throw new Error(

                    `No road connects ` +
                    `${from} → ${to}`

                );

            }

        }

    }


    // --------------------------------------------------
    // START ROUTE
    // --------------------------------------------------

    startRoute(
        ambulance,
        route
    ) {

        ambulance.route =
            [...route];

        ambulance.routeIndex =
            0;

        ambulance.currentNode =
            route[0];

        ambulance.nextNode =
            route[1];

        ambulance.position =
            0;

        ambulance.speed =
            0;

        ambulance.desiredSpeed =
            ambulance.targetSpeed;

        this.prepareNextRoad(
            ambulance
        );

        return ambulance;

    }


    // --------------------------------------------------
    // START CLIENT JOURNEY
    // --------------------------------------------------

    startClientJourney(
        ambulance,
        route
    ) {

        if (
            ambulance.state !==
            AMBULANCE_STATES.DISPATCHED
        ) {

            throw new Error(
                "Ambulance must be dispatched before starting."
            );

        }

        this.validateRoute(

            route,

            ambulance.currentNode,

            ambulance.clientNode

        );

        ambulance.startClientJourney(
            route
        );

        this.startRoute(
            ambulance,
            route
        );

        return ambulance;

    }


    // --------------------------------------------------
    // START HOSPITAL JOURNEY
    // --------------------------------------------------

    startHospitalJourney(
        ambulance,
        hospitalNode,
        route
    ) {

        if (
            ambulance.state !==
            AMBULANCE_STATES.PICKUP
        ) {

            throw new Error(
                "Patient must be picked up before hospital journey."
            );

        }

        if (!ambulance.patientPickedUp) {

            throw new Error(
                "Patient has not been picked up."
            );

        }

        this.validateRoute(

            route,

            ambulance.currentNode,

            hospitalNode

        );

        ambulance.startHospitalJourney({

            hospitalNode,

            route

        });

        this.startRoute(
            ambulance,
            route
        );

        return ambulance;

    }


    // --------------------------------------------------
    // GET SIGNAL DECISION
    // --------------------------------------------------

    getSignalDecision(
        ambulance
    ) {

        if (!this.signals) {

            return {

                action:
                    "PROCEED",

                signalState:
                    null

            };

        }

        return this.signalController.evaluate(
            ambulance
        );

    }


    // --------------------------------------------------
    // APPLY SIGNAL DECISION
    // --------------------------------------------------

    applySignalDecision(
        ambulance,
        decision,
        distanceToIntersection
    ) {

        // ------------------------------------------
        // NO SIGNAL / PROCEED
        // ------------------------------------------

        if (
            decision.action ===
            "PROCEED"
        ) {

            ambulance.setDesiredSpeed(
                ambulance.targetSpeed
            );

            return;

        }


        // ------------------------------------------
        // RED
        // ------------------------------------------

        if (
            decision.action ===
            "STOP"
        ) {

            /*
             * The signal decision itself is not enough.
             *
             * The ambulance should only react when
             * it enters the signal detection zone.
             */

            if (
                distanceToIntersection >
                TRAFFIC_RULE_CONFIG
                    .SIGNAL_DETECTION_DISTANCE
            ) {

                ambulance.setDesiredSpeed(
                    ambulance.targetSpeed
                );

                return;

            }


            /*
             * Inside the detection zone:
             *
             * 30m → begin slowing
             * 5m  → stop
             */

            if (
                distanceToIntersection >
                TRAFFIC_RULE_CONFIG
                    .STOP_LINE_DISTANCE
            ) {

                ambulance.setDesiredSpeed(
                    0
                );

                return;

            }


            ambulance.setDesiredSpeed(
                0
            );

            return;

        }


        // ------------------------------------------
        // YELLOW
        // ------------------------------------------

        if (
            decision.action ===
            "SLOW_DOWN"
        ) {

            if (
                distanceToIntersection >
                TRAFFIC_RULE_CONFIG
                    .SIGNAL_DETECTION_DISTANCE
            ) {

                ambulance.setDesiredSpeed(
                    ambulance.targetSpeed
                );

                return;

            }


            /*
             * Yellow:
             *
             * We don't instantly stop.
             * We reduce speed as the ambulance
             * approaches the intersection.
             */

            const distanceRatio =

                Math.max(

                    0,

                    Math.min(

                        1,

                        distanceToIntersection /
                        TRAFFIC_RULE_CONFIG
                            .SIGNAL_DETECTION_DISTANCE

                    )

                );


            const minimumSpeed =
                4;


            const desiredSpeed =

                minimumSpeed +

                (
                    ambulance.targetSpeed -
                    minimumSpeed
                ) *
                distanceRatio;


            ambulance.setDesiredSpeed(
                desiredSpeed
            );

        }

    }


    // --------------------------------------------------
    // ENFORCE RED STOP LINE
    // --------------------------------------------------

    enforceRedSignalStop(
        ambulance,
        decision,
        distanceToIntersection
    ) {

        if (
            decision.action !==
            "STOP"
        ) {

            return false;

        }


        /*
         * Red signal outside detection zone:
         * don't stop yet.
         */

        if (
            distanceToIntersection >
            TRAFFIC_RULE_CONFIG
                .SIGNAL_DETECTION_DISTANCE
        ) {

            return false;

        }


        /*
         * Not at stop line yet.
         * Let the speed physics slow the ambulance.
         */

        if (
            distanceToIntersection >
            TRAFFIC_RULE_CONFIG
                .STOP_LINE_DISTANCE
        ) {

            return false;

        }


        /*
         * Stop exactly at the simulated
         * stop line.
         */

        ambulance.position =

            Math.max(

                0,

                ambulance.laneLength -

                TRAFFIC_RULE_CONFIG
                    .STOP_LINE_DISTANCE

            );


        ambulance.speed =
            0;

        ambulance.setDesiredSpeed(
            0
        );


        return true;

    }


    // --------------------------------------------------
    // UPDATE AMBULANCE
    // --------------------------------------------------

    updateAmbulance(
        ambulance,
        deltaTime
    ) {

        if (!ambulance.active) {
            return;
        }


        const isTravelling =

            ambulance.state ===
                AMBULANCE_STATES.EN_ROUTE_TO_CLIENT ||

            ambulance.state ===
                AMBULANCE_STATES.EN_ROUTE_TO_HOSPITAL;


        if (!isTravelling) {
            return;
        }


        const lane =
            this.lanes[
                ambulance.laneId
            ];


        if (!lane) {

            throw new Error(

                `Invalid ambulance lane: ` +
                `${ambulance.laneId}`

            );

        }


        ambulance.setLaneLength(
            lane.length
        );


        // ------------------------------------------
        // DISTANCE TO INTERSECTION
        // ------------------------------------------

        const distanceToIntersection =
            ambulance.getDistanceToIntersection();


        // ------------------------------------------
        // SIGNAL DECISION
        // ------------------------------------------

        const decision =
            this.getSignalDecision(
                ambulance
            );


        // ------------------------------------------
        // APPLY SIGNAL DECISION
        // ------------------------------------------

        this.applySignalDecision(

            ambulance,

            decision,

            distanceToIntersection

        );


        // ------------------------------------------
        // RED STOP LINE
        // ------------------------------------------

        const stoppedAtRed =
            this.enforceRedSignalStop(

                ambulance,

                decision,

                distanceToIntersection

            );


        if (stoppedAtRed) {

            return;

        }


        // ------------------------------------------
        // MOVE
        // ------------------------------------------

        ambulance.updatePosition(
            deltaTime
        );


        // ------------------------------------------
        // INTERSECTION ARRIVAL
        // ------------------------------------------

        if (
            ambulance.position >=
            lane.length
        ) {

            this.handleIntersectionArrival(
                ambulance
            );

        }

    }


    // --------------------------------------------------
    // HANDLE INTERSECTION ARRIVAL
    // --------------------------------------------------

    handleIntersectionArrival(
        ambulance
    ) {

        const reachedNode =
            ambulance.nextNode;


        ambulance.routeIndex++;


        ambulance.currentNode =
            reachedNode;


        const isFinalNode =

            ambulance.routeIndex >=
            ambulance.route.length - 1;


        if (isFinalNode) {

            ambulance.nextNode =
                null;

            ambulance.roadId =
                null;

            ambulance.laneId =
                null;

            ambulance.laneLength =
                null;

            ambulance.position =
                0;

            ambulance.speed =
                0;

            ambulance.desiredSpeed =
                0;


            if (
                ambulance.state ===
                AMBULANCE_STATES.EN_ROUTE_TO_CLIENT
            ) {

                ambulance.arriveAtClient();

            }

            else if (
                ambulance.state ===
                AMBULANCE_STATES.EN_ROUTE_TO_HOSPITAL
            ) {

                ambulance.arriveAtHospital();

            }

            return;

        }


        ambulance.nextNode =
            ambulance.route[
                ambulance.routeIndex + 1
            ];


        ambulance.position =
            0;


        this.prepareNextRoad(
            ambulance
        );

    }


    // --------------------------------------------------
    // UPDATE ALL AMBULANCES
    // --------------------------------------------------

    update(deltaTime) {

        if (
            !Number.isFinite(deltaTime) ||
            deltaTime <= 0
        ) {

            throw new Error(
                "deltaTime must be a positive number."
            );

        }


        for (
            const ambulance
            of this.ambulances.values()
        ) {

            this.updateAmbulance(

                ambulance,

                deltaTime

            );

        }

    }


    // --------------------------------------------------
    // GET STATES
    // --------------------------------------------------

    getStates() {

        return Array.from(

            this.ambulances.values(),

            ambulance =>
                ambulance.getState()

        );

    }


    // --------------------------------------------------
    // GET ENGINE STATE
    // --------------------------------------------------

    getState() {

        return {

            ambulances:
                this.getStates(),

            count:
                this.ambulances.size

        };

    }

}