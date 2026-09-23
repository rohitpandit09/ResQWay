import {
    ROADS,
    ROAD_GRAPH
} from "../network/roadNetwork.js";

import {
    getLaneGeometry
} from "../network/laneGeometry.js";


// --------------------------------------------------
// FIND ROAD BETWEEN TWO INTERSECTIONS
// --------------------------------------------------

export function getRoadBetween(
    fromIntersectionId,
    toIntersectionId
) {

    const connected =
        ROAD_GRAPH[fromIntersectionId] || [];

    if (!connected.includes(toIntersectionId)) {
        return null;
    }


    for (const road of Object.values(ROADS)) {

        const forwardMatch =
            road.from === fromIntersectionId &&
            road.to === toIntersectionId;

        const backwardMatch =
            road.from === toIntersectionId &&
            road.to === fromIntersectionId;


        if (
            forwardMatch ||
            backwardMatch
        ) {

            return road;
        }
    }


    return null;
}


// --------------------------------------------------
// DETERMINE TRAVEL DIRECTION
// --------------------------------------------------

export function getTravelDirection(
    fromIntersectionId,
    toIntersectionId
) {

    const road =
        getRoadBetween(
            fromIntersectionId,
            toIntersectionId
        );


    if (!road) {
        return null;
    }


    if (
        road.from === fromIntersectionId &&
        road.to === toIntersectionId
    ) {

        return "FORWARD";
    }


    return "BACKWARD";
}


// --------------------------------------------------
// GET LANES FOR A ROAD MOVEMENT
// --------------------------------------------------

export function getLanesForMovement(
    fromIntersectionId,
    toIntersectionId
) {

    const road =
        getRoadBetween(
            fromIntersectionId,
            toIntersectionId
        );


    if (!road) {
        return [];
    }


    const direction =
        getTravelDirection(
            fromIntersectionId,
            toIntersectionId
        );


    const lanes =
        getLaneGeometry().lanes;


    return Object.values(lanes).filter(
        lane =>
            lane.roadId === road.id &&
            lane.direction === direction
    );
}


// --------------------------------------------------
// SELECT A LANE
// --------------------------------------------------

export function getLaneForMovement(
    fromIntersectionId,
    toIntersectionId,
    laneIndex = 1
) {

    const lanes =
        getLanesForMovement(
            fromIntersectionId,
            toIntersectionId
        );


    if (lanes.length === 0) {
        return null;
    }


    return (
        lanes.find(
            lane =>
                lane.laneIndex === laneIndex
        ) ||
        lanes[0]
    );
}


// --------------------------------------------------
// GET NEXT ROAD FROM ROUTE
// --------------------------------------------------

export function getNextRoadFromRoute(
    route,
    currentNodeIndex
) {

    if (
        !Array.isArray(route) ||
        route.length < 2
    ) {

        return null;
    }


    const from =
        route[currentNodeIndex];

    const to =
        route[currentNodeIndex + 1];


    if (!from || !to) {
        return null;
    }


    return getRoadBetween(
        from,
        to
    );
}


// --------------------------------------------------
// GET COMPLETE MOVEMENT INFORMATION
// --------------------------------------------------

export function getMovementInfo(
    fromIntersectionId,
    toIntersectionId,
    laneIndex = 1
) {

    const road =
        getRoadBetween(
            fromIntersectionId,
            toIntersectionId
        );


    if (!road) {
        return null;
    }


    const direction =
        getTravelDirection(
            fromIntersectionId,
            toIntersectionId
        );


    const lane =
        getLaneForMovement(
            fromIntersectionId,
            toIntersectionId,
            laneIndex
        );


    return {

        from: fromIntersectionId,

        to: toIntersectionId,

        roadId: road.id,

        direction,

        laneId: lane?.id || null,

        lane: lane || null

    };
}