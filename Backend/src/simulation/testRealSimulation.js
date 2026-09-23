// Backend/src/simulation/testRealSimulation.js

import {
    TrafficGenerator
} from "../traffic/trafficGenerator.js";

import {
    VehicleEngine
} from "../traffic/vehicleEngine.js";

import {
    getLaneGeometry
} from "../network/laneGeometry.js";

import {
    SignalController
} from "../signals/signalController.js";

import {
    SignalPriorityController
} from "../signals/signalPriorityController.js";

import {
    CorridorSignalCoordinator
} from "../signals/corridorSignalCoordinator.js";

import {
    GreenCorridorEngine
} from "../greenCorridor/greenCorridorEngine.js";

import {
    AmbulanceEngine
} from "../ambulance/ambulanceEngine.js";

import {
    EffectiveETAEngine
} from "../eta/effectiveEtaEngine.js";

import {
    SimulationEngine
} from "./simulationEngine.js";


// ==================================================
// SETUP
// ==================================================

console.log(
    "\n=================================================="
);

console.log(
    "        RESQWAY REAL BACKEND SIMULATION"
);

console.log(
    "==================================================\n"
);


// --------------------------------------------------
// LANES
// --------------------------------------------------

const lanes =
    getLaneGeometry().lanes;


// --------------------------------------------------
// TRAFFIC
// --------------------------------------------------

const trafficGenerator =
    new TrafficGenerator();


const vehicles =
    trafficGenerator.generateInitialTraffic();


console.log(
    `🚗 Traffic vehicles created: ${vehicles.length}`
);


// --------------------------------------------------
// SIGNALS
// --------------------------------------------------

/*
 * Keep one set of SignalController objects.
 *
 * VehicleEngine uses the object form:
 *
 * signals["INT-01"]
 *
 * SimulationEngine uses a Map.
 *
 * Both point to the SAME controllers.
 */

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


const signalMap =
    new Map(
        Object.entries(signals)
    );


console.log(
    `🚦 Signals created: ${signalMap.size}`
);


// --------------------------------------------------
// VEHICLE ENGINE
// --------------------------------------------------

const vehicleEngine =
    new VehicleEngine({

        vehicles,

        lanes,

        signals

    });


// --------------------------------------------------
// AMBULANCE ENGINE
// --------------------------------------------------

const ambulanceEngine =
    new AmbulanceEngine({

        signals

    });


// --------------------------------------------------
// CREATE AMBULANCE
// --------------------------------------------------

const ambulance =
    ambulanceEngine.createAmbulance({

        id:
            "AMB-001",

        baseNode:
            "INT-01"

    });


console.log(
    `🚑 Ambulance created: ${ambulance.id}`
);


// --------------------------------------------------
// DISPATCH
// --------------------------------------------------

ambulanceEngine
    .getAmbulance("AMB-001")
    .dispatch("INT-04");


const clientRoute = [

    "INT-01",

    "INT-02",

    "INT-03",

    "INT-04"

];


ambulanceEngine.startClientJourney(

    ambulance,

    clientRoute

);


console.log(
    "\n🚑 Client journey started:"
);

console.log(
    clientRoute.join(" → ")
);


// ==================================================
// ETA
// ==================================================

const effectiveETAEngine =
    new EffectiveETAEngine({

        signals:
            signalMap

    });


// ==================================================
// GREEN CORRIDOR
// ==================================================

const greenCorridorEngine =
    new GreenCorridorEngine();


// ==================================================
// SIGNAL PRIORITY CONTROLLERS
// ==================================================

const priorityControllers =
    new Map();


for (
    const [
        intersectionId,
        signalController
    ]
    of signalMap
) {

    const priorityController =
        new SignalPriorityController(
            signalController
        );


    priorityControllers.set(
        intersectionId,
        priorityController
    );

}


// ==================================================
// CORRIDOR COORDINATOR
// ==================================================

const corridorSignalCoordinator =
    new CorridorSignalCoordinator({

        greenCorridorEngine,

        priorityControllers,

        defaultPriorityGreenSeconds:
            12

    });


console.log(
    `🎯 Priority controllers created: ${priorityControllers.size}`
);


// ==================================================
// SIMULATION ENGINE
// ==================================================

const simulationEngine =
    new SimulationEngine({

        vehicleEngine,

        ambulanceEngine,

        signals:
            signalMap,

        effectiveETAEngine,

        greenCorridorEngine,

        corridorSignalCoordinator,

        activeAmbulanceId:
            "AMB-001",

        timeScale:
            1,

        defaultDeltaTime:
            1

    });


// ==================================================
// START
// ==================================================

const startResult =
    simulationEngine.start();


if (
    !startResult.success
) {

    throw new Error(
        "Failed to start simulation."
    );

}


console.log(
    "\n▶️ Simulation started.\n"
);


// ==================================================
// HELPER
// ==================================================

function printSnapshot(
    snapshot,
    second
) {

    const ambulance =
        snapshot.ambulance;


    console.log(
        `\n---------------- T+${second}s ----------------`
    );


    // --------------------------------------------------
    // SIMULATION
    // --------------------------------------------------

    console.log(
        `Simulation time: ${snapshot.simulationTime}s`
    );


    console.log(
        `Tick: ${snapshot.tickCount}`
    );


    console.log(
        `Status: ${snapshot.status}`
    );


    // --------------------------------------------------
    // AMBULANCE
    // --------------------------------------------------

    if (ambulance) {

        console.log(
            `\n🚑 Ambulance`
        );


        console.log(
            `ID: ${ambulance.id}`
        );


        console.log(
            `State: ${ambulance.state}`
        );


        console.log(
            `Route: ${
                ambulance.route
                    ?.join(" → ") || "NONE"
            }`
        );


        console.log(
            `Current node: ${ambulance.currentNode}`
        );


        console.log(
            `Next node: ${ambulance.nextNode}`
        );


        console.log(
            `Road: ${ambulance.roadId}`
        );


        console.log(
            `Position: ${
                Number.isFinite(
                    ambulance.position
                )
                    ? ambulance.position.toFixed(2)
                    : "N/A"
            }m`
        );


        console.log(
            `Speed: ${
                Number.isFinite(
                    ambulance.speed
                )
                    ? ambulance.speed.toFixed(2)
                    : "N/A"
            } m/s`
        );

    }


    // --------------------------------------------------
    // ETA
    // --------------------------------------------------

    if (
        snapshot.eta
    ) {

        console.log(
            `\n📏 ETA`
        );


        console.log(
            `Total effective ETA: ${
                snapshot.eta.totalEffectiveETA
                    .toFixed(2)
            }s`
        );


        for (
            const intersection
            of snapshot.eta.intersections
        ) {

            console.log(

                `  ${intersection.intersectionId} | ` +

                `travel=${intersection.travelETA.toFixed(2)}s | ` +

                `signalDelay=${intersection.signalDelay.toFixed(2)}s | ` +

                `effective=${intersection.effectiveETA.toFixed(2)}s | ` +

                `movement=${intersection.movement} | ` +

                `signal=${intersection.signalState}`

            );

        }

    }
    else {

        console.log(
            "\n📏 ETA: unavailable"
        );

    }


    // --------------------------------------------------
    // GREEN CORRIDOR
    // --------------------------------------------------

    if (
        snapshot.greenCorridor
    ) {

        const corridor =
            snapshot.greenCorridor;


        console.log(
            `\n🟢 GREEN CORRIDOR`
        );


        console.log(
            `Active priority: ${
                corridor.activePriority
            }`
        );


        console.log(
            `Priority intersection: ${
                corridor.priorityIntersection ||
                "NONE"
            }`
        );


        console.log(
            `Prepare intersections: ${
                corridor.prepareIntersections
                    ?.join(", ") ||
                "NONE"
            }`
        );


        for (
            const intersection
            of corridor.intersections
        ) {

            console.log(

                `  ${intersection.intersectionId} | ` +

                `status=${intersection.status} | ` +

                `action=${intersection.recommendedAction}`

            );

        }

    }
    else {

        console.log(
            "\n🟢 GREEN CORRIDOR: unavailable"
        );

    }


    // --------------------------------------------------
    // SIGNAL PRIORITY
    // --------------------------------------------------

    if (
        snapshot.signalControl
    ) {

        console.log(
            `\n🎯 SIGNAL CONTROL`
        );


        console.log(
            `Active priority:`,
            snapshot.signalControl.activePriority
        );


        for (
            const decision
            of snapshot.signalControl.decisions
        ) {

            console.log(

                `  ${decision.intersectionId} | ` +

                `action=${decision.action || "NONE"} | ` +

                `success=${decision.success}`

            );

        }

    }


    // --------------------------------------------------
    // NORMAL SIGNALS
    // --------------------------------------------------

    console.log(
        `\n🚦 SIGNALS`
    );


    for (
        const signal
        of snapshot.signals
    ) {

        console.log(

            `  ${signal.intersectionId} | ` +

            `phase=${signal.phase} | ` +

            `remaining=${signal.remainingSeconds.toFixed(2)}s`

        );

    }

}


// ==================================================
// CLIENT JOURNEY SIMULATION
// ==================================================

const CLIENT_SIMULATION_SECONDS =
    40;


console.log(
    `\n🚑 Running client journey for ${CLIENT_SIMULATION_SECONDS}s...\n`
);


let clientArrived =
    false;


for (
    let second = 1;
    second <= CLIENT_SIMULATION_SECONDS;
    second++
) {

    const snapshot =
        simulationEngine.update(1);


    printSnapshot(
        snapshot,
        second
    );


    const ambulanceState =
        snapshot.ambulance;


    if (
        ambulanceState &&
        ambulanceState.state ===
        "ARRIVED_AT_CLIENT"
    ) {

        clientArrived =
            true;


        console.log(
            "\n🟢 Ambulance reached client."
        );


        break;

    }

}


// ==================================================
// CLIENT ARRIVAL CHECK
// ==================================================

if (!clientArrived) {

    throw new Error(
        "Ambulance did not reach client during the simulation."
    );

}


console.log(
    "\n========== CLIENT JOURNEY PASSED =========="
);


// ==================================================
// PICKUP
// ==================================================

console.log(
    "\n👤 Picking up patient..."
);


const pickupAmbulance =
    ambulanceEngine
        .getAmbulance("AMB-001");


pickupAmbulance.pickupPatient();


if (
    pickupAmbulance.state !==
    "PICKUP"
) {

    throw new Error(
        "Ambulance failed to enter PICKUP state."
    );

}


console.log(
    "✅ Patient pickup completed."
);


// ==================================================
// HOSPITAL JOURNEY
// ==================================================

const hospitalRoute = [

    "INT-04",

    "INT-03",

    "INT-02",

    "INT-01"

];


ambulanceEngine.startHospitalJourney(

    pickupAmbulance,

    "INT-01",

    hospitalRoute

);


console.log(
    "\n🏥 Hospital journey started:"
);

console.log(
    hospitalRoute.join(" → ")
);


// ==================================================
// HOSPITAL SIMULATION
// ==================================================

const HOSPITAL_SIMULATION_SECONDS =
    80;


console.log(
    `\n🚑 Running hospital journey for ${HOSPITAL_SIMULATION_SECONDS}s...\n`
);


let hospitalArrived =
    false;


for (
    let second = 1;
    second <= HOSPITAL_SIMULATION_SECONDS;
    second++
) {

    const snapshot =
        simulationEngine.update(1);


    printSnapshot(

        snapshot,

        CLIENT_SIMULATION_SECONDS +
        second

    );


    const ambulanceState =
        snapshot.ambulance;


    if (
        ambulanceState &&
        ambulanceState.state ===
        "ARRIVED_AT_HOSPITAL"
    ) {

        hospitalArrived =
            true;


        console.log(
            "\n🏥 Ambulance reached hospital."
        );


        break;

    }

}


// ==================================================
// HOSPITAL ARRIVAL CHECK
// ==================================================

if (!hospitalArrived) {

    throw new Error(
        "Ambulance did not reach hospital during the simulation."
    );

}


console.log(
    "\n========== HOSPITAL JOURNEY PASSED =========="
);


// ==================================================
// COMPLETE
// ==================================================

const finalAmbulance =
    ambulanceEngine
        .getAmbulance("AMB-001");


finalAmbulance.complete();


if (
    finalAmbulance.state !==
    "COMPLETED"
) {

    throw new Error(
        "Ambulance failed to enter COMPLETED state."
    );

}


// ==================================================
// FINAL SNAPSHOT
// ==================================================

const finalSnapshot =
    simulationEngine.getSnapshot();


console.log(
    "\n=================================================="
);

console.log(
    "             FINAL SIMULATION STATE"
);

console.log(
    "=================================================="
);


console.log(
    JSON.stringify(
        finalSnapshot,
        null,
        2
    )
);


// ==================================================
// FINAL CHECKS
// ==================================================

console.log(
    "\n========== FINAL INTEGRATION CHECKS =========="
);


// --------------------------------------------------
// CHECK 1
// --------------------------------------------------

if (
    finalSnapshot.status !==
    "RUNNING"
) {

    throw new Error(
        "Simulation is not running."
    );

}


console.log(
    "✅ Simulation engine running."
);


// --------------------------------------------------
// CHECK 2
// --------------------------------------------------

if (
    !Array.isArray(
        finalSnapshot.vehicles
    )
) {

    throw new Error(
        "Vehicle snapshot missing."
    );

}


console.log(
    `✅ Vehicle snapshot available: ${finalSnapshot.vehicles.length} vehicles`
);


// --------------------------------------------------
// CHECK 3
// --------------------------------------------------

if (
    !Array.isArray(
        finalSnapshot.signals
    )
) {

    throw new Error(
        "Signal snapshot missing."
    );

}


if (
    finalSnapshot.signals.length !== 4
) {

    throw new Error(
        `Expected 4 signals, got ${finalSnapshot.signals.length}`
    );

}


console.log(
    "✅ Four signal snapshots available."
);


// --------------------------------------------------
// CHECK 4
// --------------------------------------------------

if (
    !finalSnapshot.ambulance
) {

    throw new Error(
        "Ambulance snapshot missing."
    );

}


if (
    finalSnapshot.ambulance.state !==
    "COMPLETED"
) {

    throw new Error(
        `Unexpected final ambulance state: ${finalSnapshot.ambulance.state}`
    );

}


console.log(
    "✅ Ambulance lifecycle completed."
);


// --------------------------------------------------
// CHECK 5
// --------------------------------------------------

if (
    finalSnapshot.simulationTime <= 0
) {

    throw new Error(
        "Simulation clock did not advance."
    );

}


console.log(
    `✅ Simulation clock advanced: ${finalSnapshot.simulationTime}s`
);


// --------------------------------------------------
// CHECK 6
// --------------------------------------------------

if (
    finalSnapshot.tickCount <= 0
) {

    throw new Error(
        "Simulation ticks did not execute."
    );

}


console.log(
    `✅ Simulation ticks executed: ${finalSnapshot.tickCount}`
);


// ==================================================
// SUCCESS
// ==================================================

console.log(
    "\n=================================================="
);

console.log(
    "      🚑 RESQWAY REAL SIMULATION PASSED 🚦"
);

console.log(
    "==================================================\n"
);