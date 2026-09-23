import {
    INTERSECTIONS,
    ROADS,
    LANES_PER_DIRECTION
} from "./roadNetwork.js";

const LANE_WIDTH = 4;

function getRoadDirection(from, to) {
    const dx = to.position.x - from.position.x;
    const dz = to.position.z - from.position.z;

    if (Math.abs(dx) > Math.abs(dz)) {
        return dx > 0 ? "EAST_WEST" : "WEST_EAST";
    }

    return dz > 0 ? "SOUTH_NORTH" : "NORTH_SOUTH";
}

function createLane(id, road, direction, laneIndex, start, end) {
    return {
        id,
        roadId: road.id,
        direction,
        laneIndex,
        start,
        end,
        length: Math.sqrt(
            Math.pow(end.x - start.x, 2) +
            Math.pow(end.z - start.z, 2)
        )
    };
}

export function generateLaneGeometry() {

    const lanes = {};

    for (const road of Object.values(ROADS)) {

        const from = INTERSECTIONS[road.from];
        const to = INTERSECTIONS[road.to];

        if (!from || !to) {
            continue;
        }

        const dx = to.position.x - from.position.x;
        const dz = to.position.z - from.position.z;

        const distance = Math.sqrt(dx * dx + dz * dz);

        const perpendicularX = -dz / distance;
        const perpendicularZ = dx / distance;

        // ------------------------------------------
        // FORWARD LANES
        // ------------------------------------------

        for (
            let laneIndex = 0;
            laneIndex < LANES_PER_DIRECTION;
            laneIndex++
        ) {

            const offset =
                (laneIndex + 0.5) * LANE_WIDTH;

            const start = {
                x: from.position.x +
                    perpendicularX * offset,

                z: from.position.z +
                    perpendicularZ * offset
            };

            const end = {
                x: to.position.x +
                    perpendicularX * offset,

                z: to.position.z +
                    perpendicularZ * offset
            };

            const laneId =
                `${road.id}-FORWARD-${laneIndex + 1}`;

            lanes[laneId] = createLane(
                laneId,
                road,
                "FORWARD",
                laneIndex + 1,
                start,
                end
            );
        }

        // ------------------------------------------
        // BACKWARD LANES
        // ------------------------------------------

        for (
            let laneIndex = 0;
            laneIndex < LANES_PER_DIRECTION;
            laneIndex++
        ) {

            const offset =
                (laneIndex + 0.5) * LANE_WIDTH;

            const start = {
                x: to.position.x -
                    perpendicularX * offset,

                z: to.position.z -
                    perpendicularZ * offset
            };

            const end = {
                x: from.position.x -
                    perpendicularX * offset,

                z: from.position.z -
                    perpendicularZ * offset
            };

            const laneId =
                `${road.id}-BACKWARD-${laneIndex + 1}`;

            lanes[laneId] = createLane(
                laneId,
                road,
                "BACKWARD",
                laneIndex + 1,
                start,
                end
            );
        }
    }

    return lanes;
}


export function getLaneGeometry() {

    return {
        laneWidth: LANE_WIDTH,
        lanes: generateLaneGeometry()
    };
}


export function getLane(laneId) {

    const lanes = generateLaneGeometry();

    return lanes[laneId] || null;
}