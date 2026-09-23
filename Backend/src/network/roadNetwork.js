// Backend/src/network/roadNetwork.js

/*
 * RESQWAY ROAD NETWORK
 *
 * This file defines the static road network used by the simulation.
 *
 * Backend is the source of truth.
 * The frontend will eventually receive this network/state
 * and only visualize it.
 */

// --------------------------------------------------
// DIRECTIONS
// --------------------------------------------------

export const DIRECTIONS = {
    NORTH: "N",
    EAST: "E",
    SOUTH: "S",
    WEST: "W"
};


// --------------------------------------------------
// INTERSECTIONS
// --------------------------------------------------

export const INTERSECTIONS = {

    "INT-01": {
        id: "INT-01",
        position: {
            x: 0,
            z: 0
        }
    },

    "INT-02": {
        id: "INT-02",
        position: {
            x: 0,
            z: -120
        }
    },

    "INT-03": {
        id: "INT-03",
        position: {
            x: 120,
            z: -120
        }
    },

    "INT-04": {
        id: "INT-04",
        position: {
            x: 120,
            z: 0
        }
    }

};


// --------------------------------------------------
// ROAD NETWORK
// --------------------------------------------------

/*
 * Each road connects two intersections.
 *
 * Every road has:
 *
 *   - 2 lanes in one direction
 *   - 2 lanes in the opposite direction
 *
 * Example:
 *
 * INT-01 ======== INT-02
 *
 *        ← ←
 *        → →
 */

export const ROADS = {

    "ROAD-01": {
        id: "ROAD-01",
        from: "INT-01",
        to: "INT-02",

        lanes: {
            forward: 2,
            backward: 2
        }
    },

    "ROAD-02": {
        id: "ROAD-02",
        from: "INT-02",
        to: "INT-03",

        lanes: {
            forward: 2,
            backward: 2
        }
    },

    "ROAD-03": {
        id: "ROAD-03",
        from: "INT-03",
        to: "INT-04",

        lanes: {
            forward: 2,
            backward: 2
        }
    },

    "ROAD-04": {
        id: "ROAD-04",
        from: "INT-04",
        to: "INT-01",

        lanes: {
            forward: 2,
            backward: 2
        }
    }

};


// --------------------------------------------------
// ROAD CONNECTIONS
// --------------------------------------------------

/*
 * This represents which intersections are connected.
 *
 * The simulation will later use this graph for:
 *
 *   - traffic routes
 *   - ambulance routes
 *   - ETA calculation
 *   - Green Corridor
 */

export const ROAD_GRAPH = {

    "INT-01": ["INT-02", "INT-04"],

    "INT-02": ["INT-01", "INT-03"],

    "INT-03": ["INT-02", "INT-04"],

    "INT-04": ["INT-03", "INT-01"]

};


// --------------------------------------------------
// LANE CONFIGURATION
// --------------------------------------------------

export const LANES_PER_DIRECTION = 2;

export const TOTAL_LANES_PER_ROAD =
    LANES_PER_DIRECTION * 2;


// --------------------------------------------------
// NETWORK HELPERS
// --------------------------------------------------

export function getIntersection(intersectionId) {

    return INTERSECTIONS[intersectionId] || null;

}


export function getRoad(roadId) {

    return ROADS[roadId] || null;

}


export function getConnectedIntersections(intersectionId) {

    return ROAD_GRAPH[intersectionId] || [];

}


export function getDistanceBetweenIntersections(
    fromIntersectionId,
    toIntersectionId
) {

    const from = getIntersection(fromIntersectionId);
    const to = getIntersection(toIntersectionId);

    if (!from || !to) {
        return null;
    }

    const dx = to.position.x - from.position.x;
    const dz = to.position.z - from.position.z;

    return Math.sqrt(
        dx * dx +
        dz * dz
    );
}


// --------------------------------------------------
// COMPLETE NETWORK
// --------------------------------------------------

export function getRoadNetwork() {

    return {
        directions: DIRECTIONS,
        intersections: INTERSECTIONS,
        roads: ROADS,
        graph: ROAD_GRAPH,
        lanesPerDirection: LANES_PER_DIRECTION
    };

}