// Backend/src/greenCorridor/greenCorridorEngine.js

export const GREEN_CORRIDOR_STATUS = {
    EMERGENCY_PRIORITY: "EMERGENCY_PRIORITY",
    PREPARE: "PREPARE",
    NORMAL: "NORMAL",
    RELEASE: "RELEASE"
};


export const GREEN_CORRIDOR_CONFIG = {

    // Ambulance reaches intersection very soon.
    EMERGENCY_PRIORITY_ETA: 8,

    // Ambulance is approaching the intersection.
    PREPARE_ETA: 20

};


export class GreenCorridorEngine {

    constructor(options = {}) {

        this.config = {

            ...GREEN_CORRIDOR_CONFIG,

            ...(options.config || {})

        };

    }


    // --------------------------------------------------
    // GET STATUS FROM ETA
    // --------------------------------------------------

    getStatusFromETA(eta) {

        if (
            eta === null ||
            eta === undefined ||
            !Number.isFinite(eta)
        ) {

            return GREEN_CORRIDOR_STATUS.NORMAL;

        }


        if (
            eta <=
            this.config.EMERGENCY_PRIORITY_ETA
        ) {

            return GREEN_CORRIDOR_STATUS
                .EMERGENCY_PRIORITY;

        }


        if (
            eta <=
            this.config.PREPARE_ETA
        ) {

            return GREEN_CORRIDOR_STATUS.PREPARE;

        }


        return GREEN_CORRIDOR_STATUS.NORMAL;

    }


    // --------------------------------------------------
    // GET MOVEMENT
    // --------------------------------------------------

    getMovement(item) {

        if (!item) {

            return null;

        }


        return item.movement || null;

    }


    // --------------------------------------------------
    // CREATE INTERSECTION DECISION
    // --------------------------------------------------

    createDecision(item) {

        if (!item) {

            return null;

        }


        const status =
            this.getStatusFromETA(
                item.effectiveETA
            );


        return {

            intersectionId:
                item.intersectionId,

            fromNode:
                item.fromNode,

            movement:
                this.getMovement(item),

            eta:
                item.effectiveETA,

            travelETA:
                item.travelETA,

            signalDelay:
                item.signalDelay,

            signalState:
                item.signalState,

            signalPhase:
                item.signalPhase,

            status,

            recommendedAction:
                this.getRecommendedAction(
                    status
                )

        };

    }


    // --------------------------------------------------
    // RECOMMENDED ACTION
    // --------------------------------------------------

    getRecommendedAction(status) {

        switch (status) {

            case GREEN_CORRIDOR_STATUS
                .EMERGENCY_PRIORITY:

                return "ACTIVATE_PRIORITY";


            case GREEN_CORRIDOR_STATUS.PREPARE:

                return "PREPARE_PRIORITY";


            case GREEN_CORRIDOR_STATUS.NORMAL:

                return "MAINTAIN_NORMAL";


            case GREEN_CORRIDOR_STATUS.RELEASE:

                return "RELEASE_PRIORITY";


            default:

                return "MAINTAIN_NORMAL";

        }

    }


    // --------------------------------------------------
    // GENERATE CORRIDOR
    // --------------------------------------------------

    generateCorridor(etaSnapshot) {

        if (
            !etaSnapshot ||
            !Array.isArray(
                etaSnapshot.intersections
            )
        ) {

            return {

                ambulanceId:
                    etaSnapshot?.ambulanceId ||
                    null,

                intersections: [],

                activePriority:
                    false,

                priorityIntersection:
                    null

            };

        }


        const intersections =
            etaSnapshot.intersections.map(

                item =>
                    this.createDecision(item)

            );


        const priorityIntersection =
            intersections.find(

                item =>
                    item.status ===
                    GREEN_CORRIDOR_STATUS
                        .EMERGENCY_PRIORITY

            ) || null;


        return {

            ambulanceId:
                etaSnapshot.ambulanceId,

            intersections,

            activePriority:
                priorityIntersection !== null,

            priorityIntersection:
                priorityIntersection
                    ?.intersectionId || null

        };

    }


    // --------------------------------------------------
    // GET PRIORITY INTERSECTION
    // --------------------------------------------------

    getPriorityIntersection(
        corridor
    ) {

        if (
            !corridor ||
            !Array.isArray(
                corridor.intersections
            )
        ) {

            return null;

        }


        return corridor.intersections.find(

            item =>
                item.status ===
                GREEN_CORRIDOR_STATUS
                    .EMERGENCY_PRIORITY

        ) || null;

    }


    // --------------------------------------------------
    // GET PREPARE INTERSECTIONS
    // --------------------------------------------------

    getPrepareIntersections(
        corridor
    ) {

        if (
            !corridor ||
            !Array.isArray(
                corridor.intersections
            )
        ) {

            return [];

        }


        return corridor.intersections.filter(

            item =>
                item.status ===
                GREEN_CORRIDOR_STATUS.PREPARE

        );

    }


    // --------------------------------------------------
    // UPDATE PASSED INTERSECTIONS
    // --------------------------------------------------

    markPassedIntersections(
        corridor,
        currentNode
    ) {

        if (
            !corridor ||
            !Array.isArray(
                corridor.intersections
            )
        ) {

            return corridor;

        }


        const currentIndex =
            corridor.intersections.findIndex(

                item =>
                    item.intersectionId ===
                    currentNode

            );


        if (
            currentIndex === -1
        ) {

            return corridor;

        }


        for (
            let i = 0;
            i < currentIndex;
            i++
        ) {

            corridor.intersections[i].status =
                GREEN_CORRIDOR_STATUS.RELEASE;


            corridor.intersections[i]
                .recommendedAction =
                this.getRecommendedAction(
                    GREEN_CORRIDOR_STATUS.RELEASE
                );

        }


        return corridor;

    }


    // --------------------------------------------------
    // SNAPSHOT
    // --------------------------------------------------

    getSnapshot(
        etaSnapshot,
        currentNode = null
    ) {

        const corridor =
            this.generateCorridor(
                etaSnapshot
            );


        this.markPassedIntersections(
            corridor,
            currentNode
        );


        const priorityIntersection =
            this.getPriorityIntersection(
                corridor
            );


        const prepareIntersections =
            this.getPrepareIntersections(
                corridor
            );


        return {

            ambulanceId:
                corridor.ambulanceId,

            activePriority:
                priorityIntersection !== null,

            priorityIntersection:
                priorityIntersection
                    ?.intersectionId || null,

            prepareIntersections:
                prepareIntersections.map(

                    item =>
                        item.intersectionId

                ),

            intersections:
                corridor.intersections

        };

    }

}