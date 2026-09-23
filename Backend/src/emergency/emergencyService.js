// Backend/src/emergency/emergencyService.js

import simulationRuntime
    from "../simulation/simulationRuntime.js";


// ==================================================
// EMERGENCY STATES
// ==================================================

export const EMERGENCY_STATES = {

    CREATED:
        "CREATED",

    DISPATCHING:
        "DISPATCHING",

    DRIVER_ASSIGNED:
        "DRIVER_ASSIGNED",

    EN_ROUTE_TO_CLIENT:
        "EN_ROUTE_TO_CLIENT",

    ARRIVED_AT_CLIENT:
        "ARRIVED_AT_CLIENT",

    PICKUP:
        "PICKUP",

    EN_ROUTE_TO_HOSPITAL:
        "EN_ROUTE_TO_HOSPITAL",

    ARRIVED_AT_HOSPITAL:
        "ARRIVED_AT_HOSPITAL",

    COMPLETED:
        "COMPLETED",

    CANCELLED:
        "CANCELLED"

};


// ==================================================
// EMERGENCY SERVICE
// ==================================================

class EmergencyService {

    constructor() {

        this.emergencies =
            new Map();

        this.nextEmergencyNumber =
            1;

    }


    // ==================================================
    // CREATE EMERGENCY
    // ==================================================

    createEmergency({
        userId = null,
        clientNode = "INT-04",
        hospitalNode = "INT-01",
    } = {}) {

        // --------------------------------------------------
        // MAKE SURE SIMULATION EXISTS
        // --------------------------------------------------

        simulationRuntime.initialize();


        // --------------------------------------------------
        // GET AMBULANCE ENGINE
        // --------------------------------------------------

        const ambulanceEngine =
            simulationRuntime.ambulanceEngine;


        if (!ambulanceEngine) {

            throw new Error(
                "Ambulance engine is not available."
            );

        }


        // --------------------------------------------------
        // FIND AVAILABLE AMBULANCE
        // --------------------------------------------------

        const ambulance =
            this.findAvailableAmbulance(
                ambulanceEngine
            );


        if (!ambulance) {

            throw new Error(
                "No ambulance is currently available."
            );

        }


        console.log(
            `🚑 Ambulance ${ambulance.id} assigned to emergency.`
        );


        // --------------------------------------------------
        // CREATE EMERGENCY ID
        // --------------------------------------------------

        const emergencyId =
            `EMG-${String(
                this.nextEmergencyNumber++
            ).padStart(3, "0")}`;


        // --------------------------------------------------
        // CREATE EMERGENCY
        // --------------------------------------------------

        const emergency = {

            id:
                emergencyId,

            userId,

            ambulanceId:
                ambulance.id,

            clientNode,

            hospitalNode,

            state:
                EMERGENCY_STATES.CREATED,

            createdAt:
                new Date().toISOString(),

            assignedAt:
                null,

            completedAt:
                null

        };


        // --------------------------------------------------
        // SAVE EMERGENCY
        // --------------------------------------------------

        this.emergencies.set(
            emergencyId,
            emergency
        );


        // --------------------------------------------------
        // ASSIGN AMBULANCE
        // --------------------------------------------------

        emergency.state =
            EMERGENCY_STATES.DRIVER_ASSIGNED;

        emergency.assignedAt =
            new Date().toISOString();


        // --------------------------------------------------
        // DISPATCH
        // --------------------------------------------------

        ambulance.dispatch(
            clientNode
        );


        // --------------------------------------------------
        // BUILD CLIENT ROUTE
        // --------------------------------------------------

        const clientRoute =
            this.buildClientRoute(
                ambulance.baseNode,
                clientNode
            );


        // --------------------------------------------------
        // START CLIENT JOURNEY
        // --------------------------------------------------

        simulationRuntime.ambulanceEngine
            .startClientJourney(
                ambulance,
                clientRoute
            );


        emergency.state =
            EMERGENCY_STATES.EN_ROUTE_TO_CLIENT;


        console.log(
            `🚑 ${ambulance.id} started journey to client.`
        );


        console.log(
            `🛣️ Route: ${clientRoute.join(" → ")}`
        );


        // --------------------------------------------------
        // BROADCAST EMERGENCY CREATED
        // --------------------------------------------------

        const createdEmergency =
            this.getEmergency(
                emergencyId
            );


        if (
            typeof simulationRuntime.emitEmergencyCreated ===
            "function"
        ) {

            simulationRuntime.emitEmergencyCreated(
                createdEmergency
            );

        }


        // --------------------------------------------------
        // RETURN
        // --------------------------------------------------

        return createdEmergency;

    }


    // ==================================================
    // FIND AVAILABLE AMBULANCE
    // ==================================================

    findAvailableAmbulance(
        ambulanceEngine
    ) {

        const ambulances =
            ambulanceEngine.ambulances;


        if (
            !ambulances ||
            !(ambulances instanceof Map)
        ) {

            return null;

        }


        console.log(
            "🚑 Checking ambulance availability..."
        );


        for (
            const ambulance
            of ambulances.values()
        ) {

            console.log(
                `   ${ambulance.id} | state=${ambulance.state} | active=${ambulance.active}`
            );


            // --------------------------------------------------
            // IDLE AMBULANCE
            // --------------------------------------------------

            if (
                ambulance.state ===
                "IDLE"
            ) {

                console.log(
                    `   ✅ ${ambulance.id} is available.`
                );


                return ambulance;

            }


            // --------------------------------------------------
            // COMPLETED AMBULANCE
            // --------------------------------------------------

            if (
                ambulance.state ===
                    "COMPLETED" &&
                ambulance.active === false
            ) {

                console.log(
                    `   ✅ ${ambulance.id} completed previous trip and is available.`
                );


                return ambulance;

            }

        }


        console.log(
            "   ❌ No available ambulance found."
        );


        return null;

    }


    // ==================================================
    // BUILD CLIENT ROUTE
    // ==================================================

    buildClientRoute(
        baseNode,
        clientNode
    ) {

        /*
         * Current Phase-0 simulation network:
         *
         * INT-01 → INT-02 → INT-03 → INT-04
         *
         * This is deterministic for the current prototype.
         *
         * Later this will be replaced by the actual
         * route/pathfinding engine.
         */


        if (
            baseNode === "INT-01" &&
            clientNode === "INT-04"
        ) {

            return [

                "INT-01",

                "INT-02",

                "INT-03",

                "INT-04"

            ];

        }


        if (
            baseNode === clientNode
        ) {

            return [

                baseNode

            ];

        }


        throw new Error(
            `No route available from ${baseNode} to ${clientNode}.`
        );

    }


    // ==================================================
    // GET EMERGENCY
    // ==================================================

    getEmergency(
        emergencyId
    ) {

        const emergency =
            this.emergencies.get(
                emergencyId
            );


        if (!emergency) {

            return null;

        }


        return {

            ...emergency

        };

    }


    // ==================================================
    // GET ALL EMERGENCIES
    // ==================================================

    getAllEmergencies() {

        return Array.from(
            this.emergencies.values()
        );

    }


    // ==================================================
    // UPDATE EMERGENCY STATE
    // ==================================================

    updateEmergencyState(
        emergencyId,
        state
    ) {

        const emergency =
            this.emergencies.get(
                emergencyId
            );


        if (!emergency) {

            throw new Error(
                `Emergency ${emergencyId} not found.`
            );

        }


        emergency.state =
            state;


        if (
            state ===
            EMERGENCY_STATES.COMPLETED
        ) {

            emergency.completedAt =
                new Date().toISOString();

        }


        const updatedEmergency =
            this.getEmergency(
                emergencyId
            );


        // --------------------------------------------------
        // BROADCAST EMERGENCY UPDATED
        // --------------------------------------------------

        if (
            typeof simulationRuntime.emitEmergencyUpdated ===
            "function"
        ) {

            simulationRuntime.emitEmergencyUpdated(
                updatedEmergency
            );

        }


        return updatedEmergency;

    }

}


// ==================================================
// SINGLETON
// ==================================================

const emergencyService =
    new EmergencyService();


export default emergencyService;