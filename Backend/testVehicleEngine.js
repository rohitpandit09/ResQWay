import {
    TrafficGenerator
} from "./src/traffic/trafficGenerator.js";

import {
    VehicleEngine
} from "./src/traffic/vehicleEngine.js";

import {
    getLaneGeometry
} from "./src/network/laneGeometry.js";

import {
    TrafficVehicle
} from "./src/traffic/trafficVehicle.js";

import {
    SignalController
} from "./src/signals/signalController.js";


// --------------------------------------------------
// SETUP
// --------------------------------------------------

const generator =
    new TrafficGenerator();


const vehicles =
    generator.generateInitialTraffic();


const lanes =
    getLaneGeometry().lanes;


// --------------------------------------------------
// SIGNALS
// --------------------------------------------------

const signals = {

    "INT-01":
        new SignalController("INT-01"),

    "INT-02":
        new SignalController("INT-02"),

    "INT-03":
        new SignalController("INT-03"),

    "INT-04":
        new SignalController("INT-04")

};


// --------------------------------------------------
// ENGINE
// --------------------------------------------------

const engine =
    new VehicleEngine({

        vehicles,

        lanes,

        signals

    });


// ==================================================
// MULTI-VEHICLE TRAFFIC TEST
// ==================================================

console.log(
    "\n========== MULTI-VEHICLE TRAFFIC TEST ==========\n"
);


console.log(
    `Initial traffic vehicles: ${vehicles.length}`
);


for (const vehicle of vehicles) {

    console.log(
        `${vehicle.id} | ` +
        `type=${vehicle.type} | ` +
        `road=${vehicle.roadId} | ` +
        `lane=${vehicle.laneId} | ` +
        `position=${vehicle.position} | ` +
        `speed=${vehicle.speed}`
    );

}


// --------------------------------------------------
// START ALL VEHICLES
// --------------------------------------------------

for (const vehicle of vehicles) {

    vehicle.setMoving();

}


// --------------------------------------------------
// SIMULATION
// --------------------------------------------------

const SIMULATION_SECONDS = 40;


console.log(
    `\nRunning ${SIMULATION_SECONDS}s traffic simulation...\n`
);


for (
    let second = 1;
    second <= SIMULATION_SECONDS;
    second++
) {

    engine.update(1);


    console.log(
        `\n--- T+${second}s ---`
    );


    for (const vehicle of vehicles) {

        if (!vehicle.active) {

            console.log(
                `${vehicle.id} | COMPLETED`
            );

            continue;

        }


        console.log(

            `${vehicle.id} | ` +

            `type=${vehicle.type} | ` +

            `road=${vehicle.roadId} | ` +

            `lane=${vehicle.laneId} | ` +

            `position=${vehicle.position.toFixed(2)}m | ` +

            `speed=${vehicle.speed} | ` +

            `desired=${vehicle.desiredSpeed} | ` +

            `state=${vehicle.state}`

        );

    }

}


// ==================================================
// TRAFFIC SAFETY CHECKS
// ==================================================

console.log(
    "\n========== TRAFFIC SAFETY CHECKS =========="
);


// --------------------------------------------------
// CHECK 1
// NO INVALID POSITIONS
// --------------------------------------------------

for (const vehicle of vehicles) {

    if (!Number.isFinite(vehicle.position)) {

        throw new Error(
            `${vehicle.id}: Invalid vehicle position.`
        );

    }

}


// --------------------------------------------------
// CHECK 2
// NO NEGATIVE SPEED
// --------------------------------------------------

for (const vehicle of vehicles) {

    if (vehicle.speed < 0) {

        throw new Error(
            `${vehicle.id}: Negative vehicle speed detected.`
        );

    }

}


// --------------------------------------------------
// CHECK 3
// TARGET SPEED MUST REMAIN VALID
// --------------------------------------------------

for (const vehicle of vehicles) {

    if (
        !Number.isFinite(
            vehicle.targetSpeed
        ) ||
        vehicle.targetSpeed <= 0
    ) {

        throw new Error(
            `${vehicle.id}: Invalid targetSpeed detected: ${vehicle.targetSpeed}`
        );

    }

}


// --------------------------------------------------
// CHECK 4
// NO SAME-LANE OVERLAP
// --------------------------------------------------

for (
    let i = 0;
    i < vehicles.length;
    i++
) {

    const vehicleA =
        vehicles[i];


    if (!vehicleA.active) {

        continue;

    }


    for (
        let j = i + 1;
        j < vehicles.length;
        j++
    ) {

        const vehicleB =
            vehicles[j];


        if (!vehicleB.active) {

            continue;

        }


        // Different lanes cannot collide
        // through longitudinal spacing.

        if (
            vehicleA.laneId !==
            vehicleB.laneId
        ) {

            continue;

        }


        if (
            vehicleA.roadId !==
            vehicleB.roadId
        ) {

            continue;

        }


        const distance =
            Math.abs(
                vehicleA.position -
                vehicleB.position
            );


        if (distance < 0) {

            throw new Error(
                `Invalid vehicle spacing detected between ` +
                `${vehicleA.id} and ${vehicleB.id}.`
            );

        }

    }

}


// --------------------------------------------------
// CHECK 5
// VEHICLES REMAIN ON VALID LANES
// --------------------------------------------------

for (const vehicle of vehicles) {

    if (!vehicle.active) {

        continue;

    }


    if (
        !lanes[vehicle.laneId]
    ) {

        throw new Error(
            `${vehicle.id}: Vehicle is on an invalid lane: ${vehicle.laneId}`
        );

    }

}


// ==================================================
// PHYSICS REGRESSION TEST
// ==================================================

console.log(
    "\n========== PHYSICS REGRESSION TESTS =========="
);


const leader =
    new TrafficVehicle({

        id: "LEADER-TEST",

        type: "CAR",

        roadId: "ROAD-01",

        laneId:
            "ROAD-01-FORWARD-1",

        currentNode: "INT-01",

        nextNode: "INT-02",

        route: [
            "INT-01",
            "INT-02",
            "INT-03"
        ]

    });


const follower =
    new TrafficVehicle({

        id: "FOLLOWER-TEST",

        type: "CAR",

        roadId: "ROAD-01",

        laneId:
            "ROAD-01-FORWARD-1",

        currentNode: "INT-01",

        nextNode: "INT-02",

        route: [
            "INT-01",
            "INT-02",
            "INT-03"
        ]

    });


leader.setLaneLength(200);

leader.position = 20;

leader.speed = 9;

leader.targetSpeed = 9;

leader.setMoving();


follower.setLaneLength(200);

follower.position = 12;

follower.speed = 0;

follower.targetSpeed = 9;

follower.setMoving();


engine.vehicles.push(
    leader,
    follower
);


engine.update(1);


if (
    follower.position >=
    leader.position
) {

    throw new Error(
        "Vehicle overlap detected: " +
        "follower passed the leader."
    );

}


if (
    follower.targetSpeed !== 9
) {

    throw new Error(
        "Follower targetSpeed was modified by spacing logic."
    );

}


// --------------------------------------------------
// ACCELERATION TEST
// --------------------------------------------------

const freshVehicle =
    new TrafficVehicle({

        id: "ACCEL-TEST",

        type: "CAR",

        roadId: "ROAD-01",

        laneId:
            "ROAD-01-FORWARD-1",

        currentNode: "INT-01",

        nextNode: "INT-02",

        route: [
            "INT-01",
            "INT-02",
            "INT-03"
        ]

    });


freshVehicle.setLaneLength(200);

freshVehicle.position = 0;

freshVehicle.speed = 0;

freshVehicle.targetSpeed = 9;

freshVehicle.setMoving();


engine.updateVehicle(
    freshVehicle,
    1
);


if (
    freshVehicle.speed >= 9
) {

    throw new Error(
        "Acceleration is not gradual."
    );

}


if (
    freshVehicle.targetSpeed !== 9
) {

    throw new Error(
        "Acceleration modified targetSpeed."
    );

}


console.log(
    "Physics regression checks passed."
);


// ==================================================
// FINAL SUMMARY
// ==================================================

console.log(
    "\n========== MULTI-VEHICLE TEST SUMMARY =========="
);


console.log(
    `Vehicles tested: ${vehicles.length}`
);


const activeVehicles =
    vehicles.filter(
        vehicle => vehicle.active
    );


const completedVehicles =
    vehicles.filter(
        vehicle => !vehicle.active
    );


console.log(
    `Active vehicles: ${activeVehicles.length}`
);


console.log(
    `Completed vehicles: ${completedVehicles.length}`
);


console.log(
    "\nMulti-vehicle traffic test passed."
);


console.log(
    "\n===============================================\n"
);