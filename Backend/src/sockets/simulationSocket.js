// Backend/src/sockets/simulationSocket.js

import simulationRuntime
    from "../simulation/simulationRuntime.js";


// ==================================================
// SOCKET EVENTS
// ==================================================

const EVENTS = {

    // Simulation
    SNAPSHOT:
        "simulation:snapshot",

    STATUS:
        "simulation:status",

    REQUEST_SNAPSHOT:
        "simulation:requestSnapshot",


    // Emergency
    EMERGENCY_CREATED:
        "emergency:created",

    EMERGENCY_UPDATED:
        "emergency:updated",

    EMERGENCY_REQUEST:
        "emergency:request"

};


// ==================================================
// REGISTER SOCKET
// ==================================================

export function registerSimulationSocket(io) {

    // --------------------------------------------------
    // INITIALIZE BACKEND SIMULATION
    // --------------------------------------------------

    simulationRuntime.initialize();


    // --------------------------------------------------
    // START BACKEND SIMULATION
    // --------------------------------------------------

    simulationRuntime.start();


    // --------------------------------------------------
    // SOCKET CONNECTION
    // --------------------------------------------------

    io.on(
        "connection",
        (socket) => {

            console.log(
                `🔌 Frontend connected: ${socket.id}`
            );


            // --------------------------------------------------
            // SEND CURRENT STATE IMMEDIATELY
            // --------------------------------------------------

            const snapshot =
                simulationRuntime.getSnapshot();


            socket.emit(
                EVENTS.SNAPSHOT,
                snapshot
            );


            // --------------------------------------------------
            // SEND STATUS
            // --------------------------------------------------

            socket.emit(
                EVENTS.STATUS,
                simulationRuntime.getStatus()
            );


            // --------------------------------------------------
            // REQUEST CURRENT SNAPSHOT
            // --------------------------------------------------

            socket.on(
                EVENTS.REQUEST_SNAPSHOT,
                () => {

                    const currentSnapshot =
                        simulationRuntime.getSnapshot();


                    socket.emit(
                        EVENTS.SNAPSHOT,
                        currentSnapshot
                    );

                }
            );


            // --------------------------------------------------
            // EMERGENCY REQUEST
            // --------------------------------------------------

            /*
             * The frontend can request an emergency through
             * Socket.IO later.
             *
             * For now, the REST API remains the actual
             * emergency creation mechanism.
             *
             * This listener is intentionally prepared but
             * does not create duplicate emergency logic.
             */

            socket.on(
                EVENTS.EMERGENCY_REQUEST,
                (data) => {

                    console.log(
                        `🚨 Emergency request received from socket ${socket.id}`,
                        data
                    );

                }
            );


            // --------------------------------------------------
            // DISCONNECT
            // --------------------------------------------------

            socket.on(
                "disconnect",
                (reason) => {

                    console.log(
                        `🔌 Frontend disconnected: ${socket.id} | ${reason}`
                    );

                }
            );

        }
    );


    // --------------------------------------------------
    // BROADCAST SNAPSHOTS
    // --------------------------------------------------

    setInterval(
        () => {

            if (
                !simulationRuntime.running
            ) {

                return;

            }


            const snapshot =
                simulationRuntime.getSnapshot();


            io.emit(
                EVENTS.SNAPSHOT,
                snapshot
            );

        },

        1000
    );


    // --------------------------------------------------
    // EMERGENCY EVENT HELPERS
    // --------------------------------------------------

    /*
     * These helpers allow the emergency service/controller
     * to broadcast emergency lifecycle events without
     * creating another Socket.IO connection.
     */


    simulationRuntime.emitEmergencyCreated =
        (emergency) => {

            io.emit(
                EVENTS.EMERGENCY_CREATED,
                emergency
            );

        };


    simulationRuntime.emitEmergencyUpdated =
        (emergency) => {

            io.emit(
                EVENTS.EMERGENCY_UPDATED,
                emergency
            );

        };


    // --------------------------------------------------
    // REGISTERED
    // --------------------------------------------------

    console.log(
        "📡 ResQWay simulation Socket.IO layer registered."
    );

}