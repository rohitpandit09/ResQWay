// Backend/src/simulation/simulationRuntime.js


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
// SIMULATION RUNTIME
// ==================================================

class SimulationRuntime {

    constructor() {

        this.simulationEngine = null;

        this.ambulanceEngine = null;

        this.initialized = false;

        this.running = false;

        this.interval = null;

        this.tickIntervalMs = 1000;

        this.lastSnapshot = null;

        // --------------------------------------------------
        // Socket.IO emergency event hooks
        // --------------------------------------------------

        this.emitEmergencyCreated = null;

        this.emitEmergencyUpdated = null;

    }


    // ==================================================
    // INITIALIZE
    // ==================================================

    initialize() {

        if (
            this.initialized
        ) {

            return this.lastSnapshot;

        }


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


        // --------------------------------------------------
        // SIGNALS
        // --------------------------------------------------

        /*
         * VehicleEngine expects signals as an object.
         *
         * SimulationEngine / ETA expects a Map.
         *
         * Both must point to the SAME
         * SignalController objects.
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


        this.ambulanceEngine =
            ambulanceEngine;


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


        /*
         * IMPORTANT:
         *
         * Ambulance starts IDLE.
         *
         * It must NOT be dispatched here.
         *
         * EmergencyService is responsible for:
         *
         * IDLE
         *   ↓
         * DISPATCHED
         *   ↓
         * EN_ROUTE_TO_CLIENT
         *
         * This keeps the backend emergency API
         * as the source of the ambulance lifecycle.
         */

        console.log(
            `🚑 ${ambulance.id} is waiting for an emergency request.`
        );


        // --------------------------------------------------
        // ETA ENGINE
        // --------------------------------------------------

        const effectiveETAEngine =
            new EffectiveETAEngine({

                signals:
                    signalMap

            });


        // --------------------------------------------------
        // GREEN CORRIDOR ENGINE
        // --------------------------------------------------

        const greenCorridorEngine =
            new GreenCorridorEngine();


        // --------------------------------------------------
        // SIGNAL PRIORITY CONTROLLERS
        // --------------------------------------------------

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


        // --------------------------------------------------
        // CORRIDOR SIGNAL COORDINATOR
        // --------------------------------------------------

        const corridorSignalCoordinator =
            new CorridorSignalCoordinator({

                greenCorridorEngine,

                priorityControllers,

                defaultPriorityGreenSeconds:
                    12

            });


        // --------------------------------------------------
        // SIMULATION ENGINE
        // --------------------------------------------------

        this.simulationEngine =
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


        // --------------------------------------------------
        // START SIMULATION ENGINE
        // --------------------------------------------------

        const startResult =
            this.simulationEngine.start();


        if (
            !startResult.success
        ) {

            throw new Error(
                "Failed to start ResQWay simulation."
            );

        }


        // --------------------------------------------------
        // INITIAL SNAPSHOT
        // --------------------------------------------------

        this.lastSnapshot =
            this.simulationEngine.getSnapshot();


        this.initialized =
            true;


        console.log(
            "🧠 ResQWay simulation initialized."
        );


        return this.lastSnapshot;

    }


    // ==================================================
    // UPDATE
    // ==================================================

    update() {

        if (
            !this.initialized
        ) {

            this.initialize();

        }


        // --------------------------------------------------
        // GET ACTIVE AMBULANCE
        // --------------------------------------------------

        const ambulance =
            this.ambulanceEngine
                .getAmbulance(
                    "AMB-001"
                );


        // --------------------------------------------------
        // AUTOMATIC CLIENT → HOSPITAL TRANSITION
        // --------------------------------------------------

        /*
         * For the realtime prototype:
         *
         * When the ambulance reaches the client,
         * automatically perform pickup and start
         * the hospital journey.
         *
         * This keeps the Phase-0 demo continuous.
         *
         * IMPORTANT:
         * This does NOT simulate ambulance movement.
         * AmbulanceEngine remains responsible for
         * physical movement and signals.
         */

        if (
            ambulance &&
            ambulance.state ===
                "ARRIVED_AT_CLIENT"
        ) {

            console.log(
                "👤 Ambulance arrived at client. Starting patient pickup."
            );


            // ----------------------------------------------
            // PICKUP
            // ----------------------------------------------

            ambulance.pickupPatient();


            // ----------------------------------------------
            // HOSPITAL ROUTE
            // ----------------------------------------------

            const hospitalRoute = [

                "INT-04",

                "INT-03",

                "INT-02",

                "INT-01"

            ];


            // ----------------------------------------------
            // START HOSPITAL JOURNEY
            // ----------------------------------------------

            this.ambulanceEngine.startHospitalJourney(

                ambulance,

                "INT-01",

                hospitalRoute

            );


            console.log(
                "🏥 Hospital journey started."
            );

        }


        // --------------------------------------------------
        // HOSPITAL ARRIVAL
        // --------------------------------------------------

        if (
            ambulance &&
            ambulance.state ===
                "ARRIVED_AT_HOSPITAL"
        ) {

            console.log(
                "🏥 Ambulance arrived at hospital."
            );


            /*
             * Complete the ambulance after reaching
             * the hospital.
             */

            ambulance.complete();


            console.log(
                "✅ Ambulance emergency journey completed."
            );

        }


        // --------------------------------------------------
        // SIMULATION UPDATE
        // --------------------------------------------------

        /*
         * IMPORTANT:
         *
         * SimulationEngine owns:
         *
         * - signal updates
         * - traffic movement
         * - ambulance movement
         * - simulation clock
         * - ETA calculation
         * - green corridor
         * - signal priority
         *
         * Frontend never performs any of these.
         */

        const snapshot =
            this.simulationEngine.update(1);


        this.lastSnapshot =
            snapshot;


        return snapshot;

    }


    // ==================================================
    // START REALTIME LOOP
    // ==================================================

    start() {

        if (
            this.running
        ) {

            return;

        }


        if (
            !this.initialized
        ) {

            this.initialize();

        }


        this.running =
            true;


        /*
         * IMPORTANT:
         *
         * Backend owns the simulation clock.
         *
         * Frontend never advances simulation time.
         */

        this.interval =
            setInterval(

                () => {

                    try {

                        this.update();

                    }

                    catch (error) {

                        console.error(
                            "❌ ResQWay simulation update failed:",
                            error
                        );

                    }

                },

                this.tickIntervalMs

            );


        console.log(
            "🚑 ResQWay realtime simulation started."
        );

    }


    // ==================================================
    // STOP REALTIME LOOP
    // ==================================================

    stop() {

        if (
            this.interval
        ) {

            clearInterval(
                this.interval
            );

            this.interval =
                null;

        }


        this.running =
            false;


        console.log(
            "⏹️ ResQWay realtime simulation stopped."
        );

    }


    // ==================================================
    // SNAPSHOT
    // ==================================================

    getSnapshot() {

        if (
            !this.initialized
        ) {

            this.initialize();

        }


        this.lastSnapshot =
            this.simulationEngine.getSnapshot();


        return this.lastSnapshot;

    }


    // ==================================================
    // STATUS
    // ==================================================

    getStatus() {

        return {

            initialized:
                this.initialized,

            running:
                this.running,

            tickIntervalMs:
                this.tickIntervalMs,

            snapshot:
                this.lastSnapshot

        };

    }

}


// ==================================================
// SINGLETON RUNTIME
// ==================================================

const simulationRuntime =
    new SimulationRuntime();


export default simulationRuntime;