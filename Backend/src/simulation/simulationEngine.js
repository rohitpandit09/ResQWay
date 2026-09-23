// Backend/src/simulation/simulationEngine.js


export const SIMULATION_STATUS = {

    STOPPED:
        "STOPPED",

    RUNNING:
        "RUNNING",

    PAUSED:
        "PAUSED"

};


// ==================================================
// SIMULATION ENGINE
// ==================================================

export class SimulationEngine {

    constructor(options = {}) {

        this.vehicleEngine =
            options.vehicleEngine || null;


        this.ambulanceEngine =
            options.ambulanceEngine || null;


        this.signals =
            options.signals || new Map();


        this.etaEngine =
            options.etaEngine || null;


        this.effectiveETAEngine =
            options.effectiveETAEngine || null;


        this.greenCorridorEngine =
            options.greenCorridorEngine || null;


        this.corridorSignalCoordinator =
            options.corridorSignalCoordinator || null;


        // --------------------------------------------------
        // CLOCK
        // --------------------------------------------------

        this.simulationTime =
            0;


        this.tickCount =
            0;


        this.status =
            SIMULATION_STATUS.STOPPED;


        this.timeScale =
            options.timeScale || 1;


        this.defaultDeltaTime =
            options.defaultDeltaTime || 1;


        // --------------------------------------------------
        // AMBULANCE
        // --------------------------------------------------

        this.activeAmbulanceId =
            options.activeAmbulanceId || null;


        // --------------------------------------------------
        // LAST STATES
        // --------------------------------------------------

        this.lastETA =
            null;


        this.lastGreenCorridor =
            null;


        this.lastSignalControl =
            null;


        // --------------------------------------------------
        // DEBUG / TELEMETRY
        // --------------------------------------------------

        this.lastCorridorDebugKey =
            null;


        this.lastSignalDebugKey =
            null;


        this.lastAmbulanceDebugKey =
            null;

    }


    // ==================================================
    // START
    // ==================================================

    start() {

        if (
            this.status ===
            SIMULATION_STATUS.RUNNING
        ) {

            return {

                success:
                    false,

                reason:
                    "SIMULATION_ALREADY_RUNNING"

            };

        }


        this.status =
            SIMULATION_STATUS.RUNNING;


        return {

            success:
                true,

            status:
                this.status,

            simulationTime:
                this.simulationTime

        };

    }


    // ==================================================
    // PAUSE
    // ==================================================

    pause() {

        if (
            this.status !==
            SIMULATION_STATUS.RUNNING
        ) {

            return {

                success:
                    false,

                reason:
                    "SIMULATION_NOT_RUNNING"

            };

        }


        this.status =
            SIMULATION_STATUS.PAUSED;


        return {

            success:
                true,

            status:
                this.status

        };

    }


    // ==================================================
    // RESUME
    // ==================================================

    resume() {

        if (
            this.status !==
            SIMULATION_STATUS.PAUSED
        ) {

            return {

                success:
                    false,

                reason:
                    "SIMULATION_NOT_PAUSED"

            };

        }


        this.status =
            SIMULATION_STATUS.RUNNING;


        return {

            success:
                true,

            status:
                this.status

        };

    }


    // ==================================================
    // STOP
    // ==================================================

    stop() {

        this.status =
            SIMULATION_STATUS.STOPPED;


        return {

            success:
                true,

            status:
                this.status,

            simulationTime:
                this.simulationTime

        };

    }


    // ==================================================
    // SET ACTIVE AMBULANCE
    // ==================================================

    setActiveAmbulance(
        ambulanceId
    ) {

        if (
            !this.ambulanceEngine
        ) {

            return {

                success:
                    false,

                reason:
                    "NO_AMBULANCE_ENGINE"

            };

        }


        if (
            typeof this.ambulanceEngine
                .getAmbulance !==
            "function"
        ) {

            return {

                success:
                    false,

                reason:
                    "AMBULANCE_LOOKUP_NOT_SUPPORTED"

            };

        }


        const ambulance =
            this.ambulanceEngine
                .getAmbulance(
                    ambulanceId
                );


        if (!ambulance) {

            return {

                success:
                    false,

                reason:
                    "AMBULANCE_NOT_FOUND"

            };

        }


        this.activeAmbulanceId =
            ambulanceId;


        return {

            success:
                true,

            ambulanceId

        };

    }


    // ==================================================
    // GET ACTIVE AMBULANCE
    // ==================================================

    getActiveAmbulance() {

        if (
            !this.ambulanceEngine
        ) {

            return null;

        }


        // --------------------------------------------------
        // Explicit ambulance ID
        // --------------------------------------------------

        if (
            this.activeAmbulanceId &&
            typeof this.ambulanceEngine
                .getAmbulance ===
            "function"
        ) {

            return this.ambulanceEngine
                .getAmbulance(
                    this.activeAmbulanceId
                );

        }


        // --------------------------------------------------
        // Automatically use first ambulance
        // --------------------------------------------------

        if (
            this.ambulanceEngine
                .ambulances instanceof Map
        ) {

            const firstAmbulance =
                this.ambulanceEngine
                    .ambulances
                    .values()
                    .next()
                    .value;


            return firstAmbulance ||
                null;

        }


        return null;

    }


    // ==================================================
    // UPDATE SIGNALS
    // ==================================================

    updateSignals(
        deltaTime
    ) {

        for (
            const signal
            of this.signals.values()
        ) {

            if (
                signal &&
                typeof signal.tick ===
                "function"
            ) {

                signal.tick(
                    deltaTime
                );

            }

        }

    }


    // ==================================================
    // UPDATE TRAFFIC
    // ==================================================

    updateTraffic(
        deltaTime
    ) {

        if (
            !this.vehicleEngine
        ) {

            return;

        }


        this.vehicleEngine.update(
            deltaTime
        );

    }


    // ==================================================
    // UPDATE AMBULANCE
    // ==================================================

    updateAmbulance(
        deltaTime
    ) {

        if (
            !this.ambulanceEngine
        ) {

            return;

        }


        this.ambulanceEngine.update(
            deltaTime
        );

    }


    // ==================================================
    // CALCULATE ETA
    // ==================================================

    calculateETA() {

        if (
            !this.effectiveETAEngine
        ) {

            this.lastETA =
                null;

            return null;

        }


        const ambulance =
            this.getActiveAmbulance();


        if (
            !ambulance
        ) {

            this.lastETA =
                null;

            return null;

        }


        // --------------------------------------------------
        // Only calculate ETA while ambulance has route
        // --------------------------------------------------

        if (
            !Array.isArray(
                ambulance.route
            ) ||
            ambulance.route.length < 2
        ) {

            this.lastETA =
                null;

            return null;

        }


        this.lastETA =
            this.effectiveETAEngine
                .getSnapshot(
                    ambulance
                );


        return this.lastETA;

    }


    // ==================================================
    // UPDATE GREEN CORRIDOR
    // ==================================================

    updateGreenCorridor() {

        if (
            !this.greenCorridorEngine ||
            !this.lastETA
        ) {

            this.lastGreenCorridor =
                null;

            return null;

        }


        const ambulance =
            this.getActiveAmbulance();


        if (
            !ambulance
        ) {

            this.lastGreenCorridor =
                null;

            return null;

        }


        const currentNode =
            ambulance.currentNode ||
            null;


        this.lastGreenCorridor =
            this.greenCorridorEngine
                .getSnapshot(

                    this.lastETA,

                    currentNode

                );


        return this.lastGreenCorridor;

    }


    // ==================================================
    // APPLY SIGNAL PRIORITY
    // ==================================================

    applySignalPriority() {

        if (
            !this.corridorSignalCoordinator ||
            !this.lastGreenCorridor
        ) {

            this.lastSignalControl =
                null;

            return null;

        }


        this.lastSignalControl =
            this.corridorSignalCoordinator
                .applyCorridor(
                    this.lastGreenCorridor
                );


        return this.lastSignalControl;

    }


    // ==================================================
    // AMBULANCE TELEMETRY
    // ==================================================

    logAmbulanceTelemetry(
        ambulance
    ) {

        if (
            !ambulance
        ) {

            return;

        }


        if (
            !ambulance.route ||
            ambulance.route.length < 2
        ) {

            return;

        }


        const currentNode =
            ambulance.currentNode ||
            "-";


        const nextNode =
            ambulance.nextNode ||
            "-";


        const ambulanceKey =
            [

                ambulance.state,

                currentNode,

                nextNode,

                Math.floor(
                    ambulance.position || 0
                )

            ].join("|");


        if (
            ambulanceKey !==
            this.lastAmbulanceDebugKey
        ) {

            this.lastAmbulanceDebugKey =
                ambulanceKey;


            console.log(

                `🚑 [AMBULANCE] ` +

                `state=${ambulance.state} | ` +

                `current=${currentNode} | ` +

                `next=${nextNode} | ` +

                `speed=${Number(
                    ambulance.speed || 0
                ).toFixed(1)}`

            );

        }

    }


    // ==================================================
    // ETA TELEMETRY
    // ==================================================

    logETATelemetry() {

        if (
            !this.lastETA
        ) {

            return;

        }


        const totalETA =
            this.lastETA
                .totalEffectiveETA;


        const intersections =
            this.lastETA.intersections ||
            [];


        console.log(

            `⏱️ [ETA] ` +

            `total=${Number(
                totalETA || 0
            ).toFixed(1)}s`

        );


        if (
            intersections.length > 0
        ) {

            const etaText =
                intersections
                    .map(
                        intersection => {

                            const id =
                                intersection.intersectionId ||
                                intersection.node ||
                                intersection.id ||
                                "?";


                            const eta =
                                intersection.effectiveETA ??
                                intersection.eta ??
                                intersection.travelETA ??
                                0;


                            return `${id}=${Number(
                                eta
                            ).toFixed(1)}s`;

                        }
                    )
                    .join(" | ");


            console.log(
                `📍 [UPCOMING ETA] ${etaText}`
            );

        }

    }


    // ==================================================
    // GREEN CORRIDOR TELEMETRY
    // ==================================================

    logGreenCorridorTelemetry() {

        if (
            !this.lastGreenCorridor
        ) {

            return;

        }


        const corridor =
            this.lastGreenCorridor.intersections ||
            this.lastGreenCorridor.corridor ||
            [];


        if (
            !Array.isArray(corridor) ||
            corridor.length === 0
        ) {

            return;

        }


        const corridorText =
            corridor
                .map(
                    item => {

                        const id =
                            item.intersectionId ||
                            item.node ||
                            item.id ||
                            "?";


                        const status =
                            item.status ||
                            item.priority ||
                            "NORMAL";


                        const eta =
                            item.eta ??
                            item.effectiveETA;


                        if (
                            Number.isFinite(
                                eta
                            )
                        ) {

                            return (

                                `${id}=${status}` +

                                `(${Number(
                                    eta
                                ).toFixed(1)}s)`

                            );

                        }


                        return (
                            `${id}=${status}`
                        );

                    }
                )
                .join(" → ");


        const corridorKey =
            corridorText;


        if (
            corridorKey !==
            this.lastCorridorDebugKey
        ) {

            this.lastCorridorDebugKey =
                corridorKey;


            console.log(
                `🟢 [GREEN CORRIDOR] ${corridorText}`
            );

        }

    }


    // ==================================================
    // SIGNAL CONTROL TELEMETRY
    // ==================================================

    logSignalControlTelemetry() {

        if (
            !this.lastSignalControl
        ) {

            return;

        }


        /*
         * CorridorSignalCoordinator returns:
         *
         * {
         *     controlMode,
         *     activePriority,
         *     decisions,
         *     summary
         * }
         *
         * Therefore we MUST read "decisions".
         */

        const decisions =
            Array.isArray(
                this.lastSignalControl.decisions
            )

                ? this.lastSignalControl.decisions

                : [];


        if (
            decisions.length === 0
        ) {

            return;

        }


        const signalText =
            decisions
                .map(
                    decision => {

                        const id =
                            decision.intersectionId ||
                            "?";


                        const action =
                            decision.action ||
                            "NO_ACTION";


                        const movement =
                            decision.movement ||
                            decision.controllerState
                                ?.priorityMovement ||
                            "-";


                        const controllerState =
                            decision.controllerState ||
                            {};


                        const phase =
                            controllerState.signalPhase ||
                            "-";


                        const remaining =
                            controllerState.remainingSeconds;


                        const remainingText =
                            Number.isFinite(
                                Number(
                                    remaining
                                )
                            )

                                ? ` | ${Number(
                                    remaining
                                ).toFixed(1)}s`

                                : "";


                        return (

                            `${id}=${action}` +

                            `[${movement}]` +

                            ` phase=${phase}` +

                            remainingText

                        );

                    }
                )
                .join(" | ");


        const controlMode =
            this.lastSignalControl
                .controlMode ||
            "NORMAL";


        const signalKey =
            `${controlMode}|${signalText}`;


        if (
            signalKey !==
            this.lastSignalDebugKey
        ) {

            this.lastSignalDebugKey =
                signalKey;


            console.log(

                `🚦 [SIGNAL CONTROL] ` +

                `${controlMode} | ` +

                signalText

            );

        }

    }


    // ==================================================
    // UPDATE ONE TICK
    // ==================================================

    update(
        deltaTime =
            this.defaultDeltaTime
    ) {

        if (
            this.status !==
            SIMULATION_STATUS.RUNNING
        ) {

            return this.getSnapshot();

        }


        if (
            !Number.isFinite(deltaTime) ||
            deltaTime <= 0
        ) {

            throw new Error(
                "deltaTime must be a positive number."
            );

        }


        const scaledDeltaTime =
            deltaTime *
            this.timeScale;


        // ----------------------------------------------
        // 1. NORMAL SIGNAL CLOCK
        // ----------------------------------------------

        this.updateSignals(
            scaledDeltaTime
        );


        // ----------------------------------------------
        // 2. TRAFFIC
        // ----------------------------------------------

        this.updateTraffic(
            scaledDeltaTime
        );


        // ----------------------------------------------
        // 3. AMBULANCE
        // ----------------------------------------------

        this.updateAmbulance(
            scaledDeltaTime
        );


        // ----------------------------------------------
        // 4. SIMULATION CLOCK
        // ----------------------------------------------

        this.simulationTime +=
            scaledDeltaTime;


        this.tickCount++;


        // ----------------------------------------------
        // 5. ETA
        // ----------------------------------------------

        this.calculateETA();


        // ----------------------------------------------
        // 6. GREEN CORRIDOR
        // ----------------------------------------------

        this.updateGreenCorridor();


        // ----------------------------------------------
        // 7. SIGNAL PRIORITY
        // ----------------------------------------------

        this.applySignalPriority();


        // ----------------------------------------------
        // 8. TELEMETRY
        // ----------------------------------------------

        const ambulance =
            this.getActiveAmbulance();


        this.logAmbulanceTelemetry(
            ambulance
        );


        this.logETATelemetry();

        this.logGreenCorridorTelemetry();

        this.logSignalControlTelemetry();


        return this.getSnapshot();

    }


    // ==================================================
    // GET VEHICLE STATES
    // ==================================================

    getVehicleStates() {

        if (
            !this.vehicleEngine
        ) {

            return [];

        }


        if (
            typeof this.vehicleEngine
                .getStates ===
            "function"
        ) {

            return this.vehicleEngine
                .getStates();

        }


        return [];

    }


    // ==================================================
    // GET AMBULANCE STATE
    // ==================================================

    getAmbulanceState() {

        const ambulance =
            this.getActiveAmbulance();


        if (
            ambulance &&
            typeof ambulance.getState ===
            "function"
        ) {

            return ambulance.getState();

        }


        if (
            this.ambulanceEngine &&
            typeof this.ambulanceEngine
                .getStates ===
            "function"
        ) {

            const states =
                this.ambulanceEngine
                    .getStates();


            return states.length > 0
                ? states[0]
                : null;

        }


        return null;

    }


    // ==================================================
    // GET ALL AMBULANCE STATES
    // ==================================================

    getAmbulanceStates() {

        if (
            !this.ambulanceEngine
        ) {

            return [];

        }


        if (
            typeof this.ambulanceEngine
                .getStates ===
            "function"
        ) {

            return this.ambulanceEngine
                .getStates();

        }


        return [];

    }


    // ==================================================
    // GET SIGNAL STATES
    // ==================================================

    getSignalStates() {

        const states = [];


        for (
            const signal
            of this.signals.values()
        ) {

            if (
                signal &&
                typeof signal.getState ===
                "function"
            ) {

                states.push(
                    signal.getState()
                );

            }

        }


        return states;

    }


    // ==================================================
    // GET SNAPSHOT
    // ==================================================

    getSnapshot() {

        return {

            simulationTime:
                this.simulationTime,

            tickCount:
                this.tickCount,

            status:
                this.status,

            activeAmbulanceId:
                this.activeAmbulanceId,

            vehicles:
                this.getVehicleStates(),

            ambulance:
                this.getAmbulanceState(),

            ambulances:
                this.getAmbulanceStates(),

            signals:
                this.getSignalStates(),

            eta:
                this.lastETA,

            greenCorridor:
                this.lastGreenCorridor,

            signalControl:
                this.lastSignalControl

        };

    }

}