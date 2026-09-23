// Backend/src/simulation/testSimulationEngine.js

import {
    SimulationEngine,
    SIMULATION_STATUS
} from "./simulationEngine.js";


console.log(
    "\n========== SIMULATION ENGINE TEST ==========\n"
);


// --------------------------------------------------
// MOCK VEHICLE ENGINE
// --------------------------------------------------

const vehicleEngine = {

    updateCalls: 0,

    update(deltaTime) {

        this.updateCalls++;

        console.log(
            `🚗 Vehicle engine tick: ${deltaTime}s`
        );

    },

    getStates() {

        return [

            {

                id:
                    "TRAFFIC-001",

                type:
                    "CAR",

                position:
                    50,

                speed:
                    9,

                state:
                    "MOVING"

            }

        ];

    }

};


// --------------------------------------------------
// MOCK AMBULANCE ENGINE
// --------------------------------------------------

const ambulanceEngine = {

    updateCalls: 0,

    update(deltaTime) {

        this.updateCalls++;

        console.log(
            `🚑 Ambulance engine tick: ${deltaTime}s`
        );

    },

    getState() {

        return {

            id:
                "AMB-SIM-001",

            state:
                "EN_ROUTE_TO_CLIENT",

            currentNode:
                "INT-01",

            nextNode:
                "INT-02",

            position:
                60,

            speed:
                10

        };

    }

};


// --------------------------------------------------
// MOCK SIGNAL
// --------------------------------------------------

const signal = {

    intersectionId:
        "INT-01",

    phase:
        "NORTH_SOUTH_GREEN",

    remainingSeconds:
        18,

    tickCalls:
        0,

    tick(deltaTime) {

        this.tickCalls++;

        this.remainingSeconds -=
            deltaTime;

    },

    getState() {

        return {

            intersectionId:
                this.intersectionId,

            phase:
                this.phase,

            remainingSeconds:
                this.remainingSeconds,

            mode:
                "NORMAL"

        };

    }

};


// --------------------------------------------------
// MOCK ETA ENGINE
// --------------------------------------------------

const effectiveETAEngine = {

    getSnapshot() {

        return {

            ambulanceId:
                "AMB-SIM-001",

            totalEffectiveETA:
                30,

            intersections: [

                {

                    intersectionId:
                        "INT-02",

                    effectiveETA:
                        6,

                    travelETA:
                        6,

                    signalDelay:
                        0,

                    movement:
                        "NORTH"

                },

                {

                    intersectionId:
                        "INT-03",

                    effectiveETA:
                        18,

                    travelETA:
                        18,

                    signalDelay:
                        0,

                    movement:
                        "EAST"

                }

            ]

        };

    }

};


// --------------------------------------------------
// MOCK GREEN CORRIDOR
// --------------------------------------------------

const greenCorridorEngine = {

    getSnapshot(
        etaSnapshot,
        currentNode
    ) {

        return {

            ambulanceId:
                etaSnapshot.ambulanceId,

            activePriority:
                true,

            priorityIntersection:
                "INT-02",

            currentNode,

            intersections: [

                {

                    intersectionId:
                        "INT-02",

                    status:
                        "EMERGENCY_PRIORITY",

                    movement:
                        "NORTH",

                    eta:
                        6

                },

                {

                    intersectionId:
                        "INT-03",

                    status:
                        "PREPARE",

                    movement:
                        "EAST",

                    eta:
                        18

                }

            ]

        };

    }

};


// --------------------------------------------------
// MOCK SIGNAL COORDINATOR
// --------------------------------------------------

const corridorSignalCoordinator = {

    applyCalls:
        0,

    applyCorridor(
        corridor
    ) {

        this.applyCalls++;

        console.log(
            "🟢 Applying Green Corridor"
        );

        console.log(
            "Priority:",
            corridor.priorityIntersection
        );

        return {

            success:
                true,

            activePriority: {

                intersectionId:
                    corridor.priorityIntersection

            }

        };

    }

};


// --------------------------------------------------
// CREATE SIMULATION ENGINE
// --------------------------------------------------

const simulation =
    new SimulationEngine({

        vehicleEngine,

        ambulanceEngine,

        signals:
            new Map([
                [
                    "INT-01",
                    signal
                ]
            ]),

        effectiveETAEngine,

        greenCorridorEngine,

        corridorSignalCoordinator,

        defaultDeltaTime:
            1

    });


// --------------------------------------------------
// TEST 1
// INITIAL STATE
// --------------------------------------------------

console.log(
    "========== TEST 1: INITIAL STATE =========="
);


const initial =
    simulation.getSnapshot();


console.log(
    initial
);


if (
    simulation.status !==
    SIMULATION_STATUS.STOPPED
) {

    throw new Error(
        "Simulation should initially be STOPPED."
    );

}


if (
    initial.simulationTime !==
    0
) {

    throw new Error(
        "Initial simulation time should be 0."
    );

}


console.log(
    "✅ Initial state test passed."
);


// --------------------------------------------------
// TEST 2
// START
// --------------------------------------------------

console.log(
    "\n========== TEST 2: START =========="
);


const startResult =
    simulation.start();


console.log(
    startResult
);


if (
    !startResult.success
) {

    throw new Error(
        "Simulation failed to start."
    );

}


if (
    simulation.status !==
    SIMULATION_STATUS.RUNNING
) {

    throw new Error(
        "Simulation should be RUNNING."
    );

}


console.log(
    "✅ Start test passed."
);


// --------------------------------------------------
// TEST 3
// ONE TICK
// --------------------------------------------------

console.log(
    "\n========== TEST 3: FIRST TICK =========="
);


const snapshot1 =
    simulation.update(1);


console.log(
    snapshot1
);


if (
    snapshot1.simulationTime !==
    1
) {

    throw new Error(
        "Simulation time should be 1 second."
    );

}


if (
    snapshot1.tickCount !==
    1
) {

    throw new Error(
        "Tick count should be 1."
    );

}


if (
    vehicleEngine.updateCalls !==
    1
) {

    throw new Error(
        "Vehicle engine should be called once."
    );

}


if (
    ambulanceEngine.updateCalls !==
    1
) {

    throw new Error(
        "Ambulance engine should be called once."
    );

}


if (
    signal.tickCalls !==
    1
) {

    throw new Error(
        "Signal should be ticked once."
    );

}


console.log(
    "✅ First simulation tick passed."
);


// --------------------------------------------------
// TEST 4
// PIPELINE
// --------------------------------------------------

console.log(
    "\n========== TEST 4: PIPELINE =========="
);


if (
    !snapshot1.eta
) {

    throw new Error(
        "ETA snapshot is missing."
    );

}


if (
    !snapshot1.greenCorridor
) {

    throw new Error(
        "Green Corridor snapshot is missing."
    );

}


if (
    !snapshot1.signalControl
) {

    throw new Error(
        "Signal control result is missing."
    );

}


if (
    snapshot1.greenCorridor
        .priorityIntersection !==
    "INT-02"
) {

    throw new Error(
        "Expected INT-02 as priority intersection."
    );

}


if (
    snapshot1.signalControl
        .success !==
    true
) {

    throw new Error(
        "Signal control was not successful."
    );

}


console.log(
    "📏 ETA calculated"
);

console.log(
    "🟢 Green Corridor calculated"
);

console.log(
    "🚦 Signal priority applied"
);

console.log(
    "✅ Pipeline test passed."
);


// --------------------------------------------------
// TEST 5
// SECOND TICK
// --------------------------------------------------

console.log(
    "\n========== TEST 5: SECOND TICK =========="
);


const snapshot2 =
    simulation.update(1);


console.log(
    "Simulation time:",
    snapshot2.simulationTime
);

console.log(
    "Tick count:",
    snapshot2.tickCount
);


if (
    snapshot2.simulationTime !==
    2
) {

    throw new Error(
        "Simulation time should be 2 seconds."
    );

}


if (
    snapshot2.tickCount !==
    2
) {

    throw new Error(
        "Tick count should be 2."
    );

}


if (
    vehicleEngine.updateCalls !==
    2
) {

    throw new Error(
        "Vehicle engine should have 2 calls."
    );

}


if (
    ambulanceEngine.updateCalls !==
    2
) {

    throw new Error(
        "Ambulance engine should have 2 calls."
    );

}


console.log(
    "✅ Second tick test passed."
);


// --------------------------------------------------
// TEST 6
// PAUSE
// --------------------------------------------------

console.log(
    "\n========== TEST 6: PAUSE =========="
);


const pauseResult =
    simulation.pause();


console.log(
    pauseResult
);


if (
    simulation.status !==
    SIMULATION_STATUS.PAUSED
) {

    throw new Error(
        "Simulation should be PAUSED."
    );

}


const pausedSnapshot =
    simulation.update(1);


if (
    pausedSnapshot.simulationTime !==
    2
) {

    throw new Error(
        "Simulation time must not advance while paused."
    );

}


if (
    vehicleEngine.updateCalls !==
    2
) {

    throw new Error(
        "Vehicle engine must not update while paused."
    );

}


console.log(
    "⏸️ Simulation paused correctly."
);

console.log(
    "✅ Pause test passed."
);


// --------------------------------------------------
// TEST 7
// RESUME
// --------------------------------------------------

console.log(
    "\n========== TEST 7: RESUME =========="
);


const resumeResult =
    simulation.resume();


console.log(
    resumeResult
);


if (
    simulation.status !==
    SIMULATION_STATUS.RUNNING
) {

    throw new Error(
        "Simulation should be RUNNING after resume."
    );

}


simulation.update(1);


if (
    simulation.simulationTime !==
    3
) {

    throw new Error(
        "Simulation should continue from 2 to 3 seconds."
    );

}


console.log(
    "▶️ Simulation resumed correctly."
);

console.log(
    "✅ Resume test passed."
);


// --------------------------------------------------
// TEST 8
// STOP
// --------------------------------------------------

console.log(
    "\n========== TEST 8: STOP =========="
);


const stopResult =
    simulation.stop();


console.log(
    stopResult
);


if (
    simulation.status !==
    SIMULATION_STATUS.STOPPED
) {

    throw new Error(
        "Simulation should be STOPPED."
    );

}


console.log(
    "🛑 Simulation stopped."
);

console.log(
    "✅ Stop test passed."
);


// --------------------------------------------------
// FINAL
// --------------------------------------------------

console.log(
    "\n=============================================="
);

console.log(
    "🧠🚑🚦 Simulation Engine test passed."
);

console.log(
    "==============================================\n"
);