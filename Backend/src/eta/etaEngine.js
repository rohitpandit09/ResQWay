// Backend/src/eta/etaEngine.js

import {
    ROADS,
    INTERSECTIONS
} from "../network/roadNetwork.js";

import {
    generateLaneGeometry
} from "../network/laneGeometry.js";


// --------------------------------------------------
// ETA CONFIGURATION
// --------------------------------------------------

export const ETA_CONFIG = {

    // Minimum speed used when calculating ETA.
    // Prevents division by zero.

    MIN_SPEED: 1,

    // Default speed if ambulance speed is zero.

    DEFAULT_SPEED: 14

};


// --------------------------------------------------
// ETA ENGINE
// --------------------------------------------------

export class ETAEngine {

    constructor() {

        // ------------------------------------------
        // LANE GEOMETRY
        // ------------------------------------------

        this.lanes =
            generateLaneGeometry();

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

            // --------------------------------------
            // FORWARD
            // --------------------------------------

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


            // --------------------------------------
            // BACKWARD
            // --------------------------------------

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
    // GET LANE
    // --------------------------------------------------

    getLane(
        fromNode,
        toNode
    ) {

        const connection =
            this.getRoadConnection(

                fromNode,

                toNode

            );


        if (!connection) {

            return null;

        }


        const laneId =

            `${connection.road.id}` +
            `-${connection.direction}` +
            `-1`;


        return {

            lane:
                this.lanes[laneId],

            road:
                connection.road,

            direction:
                connection.direction,

            laneId

        };

    }


    // --------------------------------------------------
    // GET CURRENT ROAD REMAINING DISTANCE
    // --------------------------------------------------

    getCurrentRoadRemainingDistance(
        ambulance
    ) {

        if (
            !ambulance ||
            !ambulance.laneId
        ) {

            return 0;

        }


        const lane =
            this.lanes[
                ambulance.laneId
            ];


        if (!lane) {

            return 0;

        }


        return Math.max(

            0,

            lane.length -
            ambulance.position

        );

    }


    // --------------------------------------------------
    // GET EFFECTIVE SPEED
    // --------------------------------------------------

    getEffectiveSpeed(
        ambulance
    ) {

        if (
            ambulance &&
            Number.isFinite(
                ambulance.speed
            ) &&
            ambulance.speed > 0
        ) {

            return Math.max(

                ETA_CONFIG.MIN_SPEED,

                ambulance.speed

            );

        }


        if (
            ambulance &&
            Number.isFinite(
                ambulance.targetSpeed
            ) &&
            ambulance.targetSpeed > 0
        ) {

            return Math.max(

                ETA_CONFIG.MIN_SPEED,

                ambulance.targetSpeed

            );

        }


        return ETA_CONFIG.DEFAULT_SPEED;

    }


    // --------------------------------------------------
    // CALCULATE CURRENT ROAD ETA
    // --------------------------------------------------

    calculateCurrentRoadETA(
        ambulance
    ) {

        const distance =
            this.getCurrentRoadRemainingDistance(
                ambulance
            );


        const speed =
            this.getEffectiveSpeed(
                ambulance
            );


        return distance / speed;

    }


    // --------------------------------------------------
    // CALCULATE REMAINING ROAD ETA
    // --------------------------------------------------

    calculateRoadETA(
        fromNode,
        toNode,
        speed
    ) {

        const laneData =
            this.getLane(

                fromNode,

                toNode

            );


        if (
            !laneData ||
            !laneData.lane
        ) {

            return null;

        }


        const distance =
            laneData.lane.length;


        const effectiveSpeed =
            Math.max(

                ETA_CONFIG.MIN_SPEED,

                speed

            );


        return {

            distance,

            speed:
                effectiveSpeed,

            eta:
                distance /
                effectiveSpeed,

            roadId:
                laneData.road.id,

            laneId:
                laneData.laneId,

            direction:
                laneData.direction

        };

    }


    // --------------------------------------------------
    // CALCULATE ETA TO NEXT INTERSECTION
    // --------------------------------------------------

    calculateNextIntersectionETA(
        ambulance
    ) {

        if (
            !ambulance ||
            !ambulance.nextNode
        ) {

            return null;

        }


        const currentRoadETA =
            this.calculateCurrentRoadETA(
                ambulance
            );


        return {

            intersectionId:
                ambulance.nextNode,

            eta:
                currentRoadETA,

            distance:
                this.getCurrentRoadRemainingDistance(
                    ambulance
                )

        };

    }


    // --------------------------------------------------
    // CALCULATE UPCOMING INTERSECTION ETAS
    // --------------------------------------------------

    calculateUpcomingIntersectionETAs(
        ambulance
    ) {

        if (
            !ambulance ||
            !Array.isArray(
                ambulance.route
            )
        ) {

            return [];

        }


        if (
            ambulance.route.length === 0
        ) {

            return [];

        }


        const results = [];


        // ------------------------------------------
        // CURRENT SPEED
        // ------------------------------------------

        const speed =
            this.getEffectiveSpeed(
                ambulance
            );


        // ------------------------------------------
        // CURRENT ROAD
        // ------------------------------------------

        let cumulativeETA =
            this.calculateCurrentRoadETA(
                ambulance
            );


        // ------------------------------------------
        // NEXT INTERSECTION
        // ------------------------------------------

        if (
            ambulance.nextNode
        ) {

            results.push({

                intersectionId:
                    ambulance.nextNode,

                eta:
                    cumulativeETA,

                distance:
                    this.getCurrentRoadRemainingDistance(
                        ambulance
                    ),

                current:
                    true

            });

        }


        // ------------------------------------------
        // FUTURE ROADS
        // ------------------------------------------

        /*
         * routeIndex points to the current
         * intersection in the route.
         *
         * Example:
         *
         * route:
         * [INT-01, INT-02, INT-03, INT-04]
         *
         * routeIndex:
         * 0
         *
         * current:
         * INT-01
         *
         * next:
         * INT-02
         */

        for (
            let i =
                ambulance.routeIndex + 1;

            i <
                ambulance.route.length - 1;

            i++
        ) {

            const fromNode =
                ambulance.route[i];

            const toNode =
                ambulance.route[i + 1];


            const roadETA =
                this.calculateRoadETA(

                    fromNode,

                    toNode,

                    speed

                );


            if (!roadETA) {

                continue;

            }


            cumulativeETA +=
                roadETA.eta;


            results.push({

                intersectionId:
                    toNode,

                eta:
                    cumulativeETA,

                distance:
                    roadETA.distance,

                current:
                    false,

                roadId:
                    roadETA.roadId,

                laneId:
                    roadETA.laneId

            });

        }


        return results;

    }


    // --------------------------------------------------
    // CALCULATE COMPLETE ROUTE ETA
    // --------------------------------------------------

    calculateRouteETA(
        ambulance
    ) {

        const intersections =
            this.calculateUpcomingIntersectionETAs(
                ambulance
            );


        if (
            intersections.length === 0
        ) {

            return {

                totalETA:
                    0,

                intersections: []

            };

        }


        const finalIntersection =
            intersections[
                intersections.length - 1
            ];


        return {

            totalETA:
                finalIntersection.eta,

            intersections

        };

    }


    // --------------------------------------------------
    // GET ETA SNAPSHOT
    // --------------------------------------------------

    getSnapshot(
        ambulance
    ) {

        const routeETA =
            this.calculateRouteETA(
                ambulance
            );


        return {

            ambulanceId:
                ambulance.id,

            state:
                ambulance.state,

            currentNode:
                ambulance.currentNode,

            nextNode:
                ambulance.nextNode,

            position:
                ambulance.position,

            speed:
                ambulance.speed,

            totalETA:
                routeETA.totalETA,

            intersections:
                routeETA.intersections

        };

    }

}