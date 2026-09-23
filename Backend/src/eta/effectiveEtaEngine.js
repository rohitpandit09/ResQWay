// Backend/src/eta/effectiveEtaEngine.js

import {
    ETAEngine
} from "./etaEngine.js";

import {
    SignalDelayEngine
} from "./signalDelay.js";


// --------------------------------------------------
// EFFECTIVE ETA ENGINE
// --------------------------------------------------

export class EffectiveETAEngine {

    constructor({
        signals
    }) {

        this.etaEngine =
            new ETAEngine();

        this.signalDelayEngine =
            new SignalDelayEngine({
                signals
            });

    }


    // --------------------------------------------------
    // CALCULATE TRAVEL ETA TO INTERSECTION
    // --------------------------------------------------

    calculateTravelETA(
        ambulance,
        intersectionIndex
    ) {

        if (
            !ambulance ||
            !Array.isArray(ambulance.route)
        ) {

            return null;

        }


        const route =
            ambulance.route;


        if (
            intersectionIndex <=
            ambulance.routeIndex ||

            intersectionIndex >=
            route.length
        ) {

            return null;

        }


        const speed =
            this.etaEngine.getEffectiveSpeed(
                ambulance
            );


        let totalETA = 0;


        // ------------------------------------------
        // CURRENT ROAD
        // ------------------------------------------

        /*
         * Current road:
         *
         * currentNode → nextNode
         *
         * Its remaining distance must ALWAYS
         * be included for every future
         * intersection.
         */

        totalETA +=
            this.etaEngine.calculateCurrentRoadETA(
                ambulance
            );


        // ------------------------------------------
        // FUTURE ROADS
        // ------------------------------------------

        /*
         * Example:
         *
         * route:
         *
         * INT-01
         * INT-02
         * INT-03
         * INT-04
         *
         * Ambulance:
         *
         * current = INT-01
         * next    = INT-02
         *
         * ETA INT-03:
         *
         * current remaining road
         * +
         * INT-02 → INT-03
         */

        for (
            let i =
                ambulance.routeIndex + 1;

            i < intersectionIndex;

            i++
        ) {

            const fromNode =
                route[i];

            const toNode =
                route[i + 1];


            const roadETA =
                this.etaEngine.calculateRoadETA(

                    fromNode,

                    toNode,

                    speed

                );


            if (!roadETA) {

                return null;

            }


            totalETA +=
                roadETA.eta;

        }


        return {

            travelETA:
                totalETA

        };

    }


    // --------------------------------------------------
    // CALCULATE INTERSECTION ETA
    // --------------------------------------------------

    calculateIntersectionETA(
        ambulance,
        intersectionIndex
    ) {

        if (
            !ambulance ||
            !Array.isArray(ambulance.route)
        ) {

            return null;

        }


        const route =
            ambulance.route;


        if (
            intersectionIndex <=
            ambulance.routeIndex ||

            intersectionIndex >=
            route.length
        ) {

            return null;

        }


        const intersectionId =
            route[intersectionIndex];


        const previousNode =
            route[
                intersectionIndex - 1
            ];


        // ------------------------------------------
        // TRAVEL ETA
        // ------------------------------------------

        const travelData =
            this.calculateTravelETA(

                ambulance,

                intersectionIndex

            );


        if (!travelData) {

            return null;

        }


        // ------------------------------------------
        // SIGNAL DELAY
        // ------------------------------------------

        const signalDelay =
            this.signalDelayEngine
                .getDelaySnapshot(

                    intersectionId,

                    previousNode,

                    intersectionId

                );


        // ------------------------------------------
        // EFFECTIVE ETA
        // ------------------------------------------

        const effectiveETA =

            travelData.travelETA +
            signalDelay.signalDelay;


        return {

            intersectionId,

            fromNode:
                previousNode,

            travelETA:
                travelData.travelETA,

            signalDelay:
                signalDelay.signalDelay,

            effectiveETA,

            signalState:
                signalDelay.state,

            signalPhase:
                signalDelay.phase,

            remainingSignalSeconds:
                signalDelay.remainingSignalSeconds,

            movement:
                signalDelay.movement,

            signalReason:
                signalDelay.reason

        };

    }


    // --------------------------------------------------
    // CALCULATE ALL UPCOMING ETAS
    // --------------------------------------------------

    calculateUpcomingETAs(
        ambulance
    ) {

        if (
            !ambulance ||
            !Array.isArray(ambulance.route)
        ) {

            return [];

        }


        const results = [];


        const firstIntersectionIndex =
            ambulance.routeIndex + 1;


        for (
            let i =
                firstIntersectionIndex;

            i <
                ambulance.route.length;

            i++
        ) {

            const result =
                this.calculateIntersectionETA(

                    ambulance,

                    i

                );


            if (!result) {

                continue;

            }


            results.push(
                result
            );

        }


        return results;

    }


    // --------------------------------------------------
    // GET PRIORITY ORDER
    // --------------------------------------------------

    getPriorityOrder(
        ambulance
    ) {

        const intersections =
            this.calculateUpcomingETAs(
                ambulance
            );


        /*
         * IMPORTANT:
         *
         * Keep intersections in physical route order.
         *
         * Do NOT sort by ETA.
         *
         * The ambulance must prepare:
         *
         * INT-02
         * then INT-03
         * then INT-04
         *
         * even if signal delays make the effective
         * ETA of a later intersection numerically
         * smaller.
         */

        return intersections;

    }


    // --------------------------------------------------
    // GET COMPLETE SNAPSHOT
    // --------------------------------------------------

    getSnapshot(
        ambulance
    ) {

        const intersections =
            this.getPriorityOrder(
                ambulance
            );


        const finalIntersection =

            intersections.length > 0

                ? intersections[
                    intersections.length - 1
                ]

                : null;


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

            totalEffectiveETA:
                finalIntersection
                    ? finalIntersection.effectiveETA
                    : 0,

            intersections

        };

    }

}