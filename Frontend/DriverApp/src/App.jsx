// src/App.jsx
// ResQWay DriverApp — Main entry point and workflow state machine.
//
// ARCHITECTURE:
//   Backend is the single source of truth.
//   All simulation, ambulance, signal, ETA, and green corridor data
//   comes from the backend via Socket.IO snapshot events.
//
//   This component wires together:
//   - useSocket  → live backend connection
//   - useEmergency → emergency lifecycle
//   - useDriver  → local driver online/offline status
//
// DRIVER WORKFLOW:
//   OFFLINE → ONLINE → WAITING → EMERGENCY_RECEIVED
//   → ACCEPTED → ACTIVE EMERGENCY (backend drives state)
//   → COMPLETED → back to WAITING

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ambulance, Power, PowerOff, RefreshCw } from "lucide-react";

// Hooks
import { useSocket } from "./hooks/useSocket.js";
import { useEmergency } from "./hooks/useEmergency.js";
import { useDriver } from "./hooks/useDriver.js";

// Components
import { StatusBadge } from "./components/StatusBadge.jsx";
import { ConnectionStatus } from "./components/ConnectionStatus.jsx";
import { AmbulanceCard } from "./components/AmbulanceCard.jsx";
import { ETAPanel } from "./components/ETAPanel.jsx";
import { GreenCorridorPanel } from "./components/GreenCorridorPanel.jsx";
import { SignalStatusPanel } from "./components/SignalStatusPanel.jsx";
import { EmergencyRequestCard } from "./components/EmergencyRequestCard.jsx";
import { ActiveEmergencyPanel } from "./components/ActiveEmergencyPanel.jsx";
import { RouteVisualizer } from "./components/RouteVisualizer.jsx";
import { OfflineScreen } from "./components/OfflineScreen.jsx";
import { WaitingScreen } from "./components/WaitingScreen.jsx";

// Constants
import { DRIVER_STATUS, EMERGENCY_STATES } from "./constants.js";

// ==================================================
// APP
// ==================================================

export default function App() {
  // --------------------------------------------------
  // EMERGENCY HOOK
  // Set up first so we can pass its callbacks to useSocket
  // --------------------------------------------------

  const {
    activeEmergency,
    pendingEmergency,
    emergencyHistory,
    loading: emergencyLoading,
    handleEmergencyCreated,
    handleEmergencyUpdated,
    acceptEmergency,
    rejectEmergency,
    fetchEmergencies,
    clearActiveEmergency,
  } = useEmergency();

  // --------------------------------------------------
  // SOCKET HOOK
  // Connect to backend, receive snapshots + emergency events
  // --------------------------------------------------

  const { connectionState, snapshot, lastError, isConnected, requestSnapshot } =
    useSocket({
      onEmergencyCreated: handleEmergencyCreated,
      onEmergencyUpdated: handleEmergencyUpdated,
    });

  // --------------------------------------------------
  // DRIVER HOOK
  // Local driver status gating
  // --------------------------------------------------

  const { driverStatus, isOffline, isOnline, isOnEmergency, goOnline, goOffline } =
    useDriver({ activeEmergency });

  // --------------------------------------------------
  // RESTORE STATE ON CONNECT
  // When we connect (or reconnect), fetch current
  // emergencies from REST to restore any in-progress state.
  // --------------------------------------------------

  useEffect(() => {
    if (isConnected) {
      fetchEmergencies();
    }
  }, [isConnected, fetchEmergencies]);

  // --------------------------------------------------
  // EXTRACT FROM SNAPSHOT
  // All of this is backend-authoritative data.
  // Shape defined by SimulationEngine.getSnapshot()
  // --------------------------------------------------

  const ambulance = snapshot?.ambulance ?? null;
  const signals = snapshot?.signals ?? [];
  const eta = snapshot?.eta ?? null;
  const greenCorridor = snapshot?.greenCorridor ?? null;
  const simulationTime = snapshot?.simulationTime ?? 0;
  const simulationStatus = snapshot?.status ?? null;

  // --------------------------------------------------
  // HANDLE ACCEPT
  // --------------------------------------------------

  const handleAccept = useCallback(() => {
    acceptEmergency();
  }, [acceptEmergency]);

  // --------------------------------------------------
  // HANDLE REJECT
  // --------------------------------------------------

  const handleReject = useCallback(() => {
    rejectEmergency();
  }, [rejectEmergency]);

  // --------------------------------------------------
  // HANDLE GO OFFLINE
  // Only allowed if not actively on an emergency
  // --------------------------------------------------

  const handleGoOffline = useCallback(() => {
    if (isOnEmergency) return; // cannot go offline mid-emergency
    goOffline();
  }, [isOnEmergency, goOffline]);

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-dvh bg-[#0a0c12] flex flex-col">
      {/* ================================================
          HEADER
          ================================================ */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-900/30 border border-red-700/30">
            <Ambulance size={16} className="text-red-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">
              ResQWay
            </span>
            <span className="text-xs text-slate-500 ml-1.5">Driver</span>
          </div>
        </div>

        {/* Right side: status + connection */}
        <div className="flex items-center gap-3">
          <ConnectionStatus
            connectionState={connectionState}
            lastError={lastError}
          />
          <StatusBadge status={driverStatus} />
        </div>
      </header>

      {/* ================================================
          MAIN CONTENT
          ================================================ */}
      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* ------------------------------------------
              OFFLINE SCREEN
              ------------------------------------------ */}
          {isOffline && (
            <motion.div
              key="offline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <OfflineScreen
                onGoOnline={goOnline}
                isConnected={isConnected}
              />
            </motion.div>
          )}

          {/* ------------------------------------------
              ONLINE — waiting for emergency
              ------------------------------------------ */}
          {(isOnline || isOnEmergency) && !pendingEmergency && !activeEmergency && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Waiting hero */}
              <WaitingScreen
                ambulance={ambulance}
                simulationTime={simulationTime}
              />

              {/* Live signal states — useful even while waiting */}
              {signals.length > 0 && (
                <SignalStatusPanel signals={signals} />
              )}

              {/* Go offline button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleGoOffline}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-sm transition-colors"
                  aria-label="Go offline"
                >
                  <PowerOff size={14} />
                  Go Offline
                </button>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------
              PENDING EMERGENCY — accept / reject
              ------------------------------------------ */}
          {(isOnline || isOnEmergency) && pendingEmergency && !activeEmergency && (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <EmergencyRequestCard
                emergency={pendingEmergency}
                onAccept={handleAccept}
                onReject={handleReject}
              />

              {/* Show ambulance state while waiting */}
              {ambulance && <AmbulanceCard ambulance={ambulance} />}
            </motion.div>
          )}

          {/* ------------------------------------------
              ACTIVE EMERGENCY — full driver dashboard
              ------------------------------------------ */}
          {(isOnline || isOnEmergency) && activeEmergency && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Emergency status */}
              <ActiveEmergencyPanel
                emergency={activeEmergency}
                ambulance={ambulance}
              />

              {/* Route visualizer */}
              <RouteVisualizer
                ambulance={ambulance}
                emergency={activeEmergency}
              />

              {/* ETA */}
              {eta && <ETAPanel eta={eta} />}

              {/* Green Corridor */}
              {greenCorridor && (
                <GreenCorridorPanel greenCorridor={greenCorridor} />
              )}

              {/* Signal states */}
              <SignalStatusPanel signals={signals} />

              {/* Ambulance telemetry */}
              <AmbulanceCard ambulance={ambulance} />

              {/* Go offline (only available after trip is complete) */}
              {activeEmergency.state === EMERGENCY_STATES.COMPLETED && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3 pt-2"
                >
                  <button
                    onClick={clearActiveEmergency}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
                    aria-label="Confirm complete and return to standby"
                  >
                    <RefreshCw size={15} />
                    Return to Standby
                  </button>
                  <button
                    onClick={() => { clearActiveEmergency(); handleGoOffline(); }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm transition-colors"
                    aria-label="Go offline after completing trip"
                  >
                    <PowerOff size={14} />
                    End Shift
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ================================================
          SIMULATION STATUS BAR (footer)
          Only shown when online and backend is running
          ================================================ */}
      {!isOffline && snapshot && (
        <footer className="sticky bottom-0 z-40 flex items-center justify-between px-4 py-2 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/60">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>
              SIM T+
              <span className="tabular-nums text-slate-500 font-medium ml-0.5">
                {simulationTime.toFixed(0)}s
              </span>
            </span>
            {simulationStatus && (
              <span
                className={`uppercase tracking-wider font-medium ${
                  simulationStatus === "RUNNING"
                    ? "text-emerald-600"
                    : "text-slate-600"
                }`}
              >
                {simulationStatus}
              </span>
            )}
          </div>

          {/* Manual snapshot refresh */}
          <button
            onClick={requestSnapshot}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-slate-800 transition-colors"
            aria-label="Refresh snapshot"
            title="Refresh snapshot from backend"
          >
            <RefreshCw size={12} />
          </button>
        </footer>
      )}
    </div>
  );
}
