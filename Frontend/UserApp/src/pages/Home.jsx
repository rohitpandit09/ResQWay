import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Clock3,
  Gauge,
  MapPinned,
  Navigation,
  RotateCcw,
  Route,
  ShieldCheck,
  Siren,
  Wifi,
  WifiOff,
} from "lucide-react";

import EmergencyButton from "../components/EmergencyButton";
import QuickInfo from "../components/QuickInfo";
import SimulationHeader from "../components/SimulationHeader";
import { useSimulationSocket } from "../hooks/useSimulationSocket";
import { createEmergencyRequest } from "../services/emergencyApi";
import ResQWayScene from "../simulation/ResQWayScene";

const clampNumber = (value, fallback = "--") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return fallback;
  }

  return Number(value).toFixed(1);
};

const formatETA = (value) => {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "--";
  }

  return `${Number(value).toFixed(1)}s`;
};

export default function Home() {
  const { connected, snapshot } = useSimulationSocket();
  const [emergency, setEmergency] = useState(null);
  const [requestingEmergency, setRequestingEmergency] = useState(false);
  const [error, setError] = useState(null);
  const [cameraMode, setCameraMode] = useState("OVERVIEW");
  const [cameraResetKey, setCameraResetKey] = useState(0);

  const ambulance = snapshot?.ambulance || null;
  const eta = snapshot?.eta || null;
  const greenCorridor = snapshot?.greenCorridor || null;
  const signals = snapshot?.signals || [];
  const signalControl = snapshot?.signalControl || null;
  const emergencyActive =
    emergency &&
    emergency.state !== "COMPLETED" &&
    emergency.state !== "CANCELLED";

  const corridorStatus = useMemo(() => {
    if (!greenCorridor || !Array.isArray(greenCorridor.intersections)) {
      return "NORMAL";
    }

    const current = greenCorridor.intersections.find(
      (item) => item.status === "EMERGENCY_PRIORITY"
    );

    if (current) {
      return "EMERGENCY_PRIORITY";
    }

    const prepare = greenCorridor.intersections.find(
      (item) => item.status === "PREPARE"
    );

    if (prepare) {
      return "PREPARE";
    }

    return "NORMAL";
  }, [greenCorridor]);

  const handleEmergency = async () => {
    if (requestingEmergency) {
      return;
    }

    if (emergencyActive) {
      return;
    }

    setRequestingEmergency(true);
    setError(null);

    try {
      const created = await createEmergencyRequest({
        userId: "USER-001",
        clientNode: "INT-04",
        hospitalNode: "INT-01",
      });

      setEmergency(created);
    } catch (requestError) {
      setError(requestError.message || "Unable to create emergency.");
    } finally {
      setRequestingEmergency(false);
    }
  };

  const currentEta = eta?.totalEffectiveETA ?? null;
  const upcomingIntersections = eta?.intersections || [];

  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      <header className="border-b border-white/5 bg-[#090d12]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
              <Activity className="h-5 w-5 text-red-400" />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">ResQWay</p>
              <h1 className="text-base font-semibold text-white">Live Simulation</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/3 px-3 py-2">
              {connected ? (
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-red-400" />
              )}
              <span className={`text-[10px] font-medium uppercase tracking-[0.18em] ${connected ? "text-emerald-300" : "text-red-300"}`}>
                {connected ? "Connected" : "Reconnecting"}
              </span>
            </div>

            {emergency && (
              <div className="rounded-full border border-red-500/15 bg-red-500/5 px-3 py-2 text-right">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Emergency</p>
                <p className="text-sm font-medium text-white">{emergency.id}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <SimulationHeader connected={connected} snapshot={snapshot} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_420px]">
          <section className="space-y-5">
            <div className="relative">
              <ResQWayScene snapshot={snapshot} cameraMode={cameraMode} cameraResetKey={cameraResetKey} />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#070b11]/75 p-1 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setCameraMode("OVERVIEW")}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] transition ${cameraMode === "OVERVIEW" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setCameraMode("FOLLOW")}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] transition ${cameraMode === "FOLLOW" ? "bg-emerald-500/15 text-emerald-300" : "text-slate-500 hover:text-white"}`}
                >
                  Follow ambulance
                </button>
                <button
                  type="button"
                  title="Reset camera"
                  aria-label="Reset camera"
                  onClick={() => setCameraResetKey((value) => value + 1)}
                  className="rounded-full p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
              {!snapshot && (
                <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-amber-200">
                  Waiting for backend
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/5 bg-white/2.5 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPinned className="h-4 w-4 text-red-400" />
                  <p className="text-[10px] uppercase tracking-[0.16em]">Current</p>
                </div>
                <p className="mt-2 text-lg font-semibold text-white">{ambulance?.currentNode || "--"}</p>
                <p className="mt-1 text-[10px] text-slate-500">Live backend node</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/2.5 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Navigation className="h-4 w-4 text-blue-400" />
                  <p className="text-[10px] uppercase tracking-[0.16em]">Next</p>
                </div>
                <p className="mt-2 text-lg font-semibold text-white">{ambulance?.nextNode || "--"}</p>
                <p className="mt-1 text-[10px] text-slate-500">Upcoming route node</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/2.5 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Gauge className="h-4 w-4 text-emerald-400" />
                  <p className="text-[10px] uppercase tracking-[0.16em]">Speed</p>
                </div>
                <p className="mt-2 text-lg font-semibold text-white">{ambulance?.speed == null ? "--" : `${clampNumber(ambulance.speed)} m/s`}</p>
                <p className="mt-1 text-[10px] text-slate-500">Backend telemetry</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/3 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock3 className="h-4 w-4 text-emerald-400" />
                  <p className="text-[10px] uppercase tracking-[0.16em]">ETA</p>
                </div>
                <p className="mt-2 text-lg font-semibold text-emerald-300">{formatETA(currentEta)}</p>
                <p className="mt-1 text-[10px] text-slate-500">Total route ETA</p>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-white/5 bg-white/2.5 p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.17em] text-slate-500">Emergency network</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{emergencyActive ? "Active response" : "Emergency network ready"}</h2>
                </div>
                <ShieldCheck className="h-5 w-5 text-slate-500" />
              </div>

              <div className="flex justify-center">
                <EmergencyButton
                  onClick={handleEmergency}
                  loading={requestingEmergency}
                  active={Boolean(emergencyActive)}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/2.5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Ambulance</p>
                  <p className="mt-2 text-lg font-semibold text-white">{ambulance?.id || "--"}</p>
                </div>
                <span className="rounded-full border border-red-500/20 bg-red-500/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-red-300">
                  {ambulance?.state || "IDLE"}
                </span>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-3 py-2.5">
                  <span className="text-slate-500">Current</span>
                  <span className="font-medium text-white">{ambulance?.currentNode || "--"}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-3 py-2.5">
                  <span className="text-slate-500">Next</span>
                  <span className="font-medium text-white">{ambulance?.nextNode || "--"}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-3 py-2.5">
                  <span className="text-slate-500">Speed</span>
                  <span className="font-medium text-white">{ambulance?.speed == null ? "--" : `${clampNumber(ambulance.speed)} m/s`}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-3 py-2.5">
                  <span className="text-slate-500">ETA</span>
                  <span className="font-medium text-emerald-300">{formatETA(currentEta)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {requestingEmergency && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-red-500/10 bg-red-500/5 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-400" />
              <div>
                <p className="text-sm font-medium text-white">Requesting ambulance...</p>
                <p className="mt-1 text-xs text-slate-400">Dispatching to the emergency network.</p>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-red-200">
            <p className="text-sm font-semibold">Emergency request failed</p>
            <p className="mt-1 text-xs text-red-300/80">{error}</p>
          </div>
        )}

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/5 bg-white/2.5 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Route className="h-4 w-4 text-emerald-400" />
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">ETA panel</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Total ETA</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-300">{formatETA(currentEta)}</p>
            </div>

            <div className="mt-4 space-y-2">
              {upcomingIntersections.length > 0 ? (
                upcomingIntersections.map((item, index) => (
                  <div key={`${item.intersectionId}-${index}`} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/1.5 px-3 py-2.5 text-sm">
                    <span className="text-slate-300">{item.intersectionId || item.node || item.id}</span>
                    <span className="font-medium text-emerald-300">{formatETA(item.effectiveETA ?? item.eta ?? item.travelETA)}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/5 bg-white/1.5 px-3 py-3 text-sm text-slate-400">
                  No upcoming ETA data yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/2.5 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Siren className="h-4 w-4 text-red-400" />
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Green corridor</p>
            </div>

            <div className={`rounded-2xl border px-4 py-3 ${
              corridorStatus === "EMERGENCY_PRIORITY"
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                : corridorStatus === "PREPARE"
                  ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                  : corridorStatus === "RELEASE"
                    ? "border-red-500/20 bg-red-500/5 text-red-300"
                    : "border-white/5 bg-black/20 text-slate-300"
            }`}>
              <p className="text-[10px] uppercase tracking-[0.18em]">Status</p>
              <p className="mt-2 text-xl font-semibold">{corridorStatus}</p>
            </div>

            <div className="mt-4 space-y-2">
              {(greenCorridor?.intersections || []).length > 0 ? (
                (greenCorridor.intersections || []).map((item) => (
                  <div key={item.intersectionId} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/1.5 px-3 py-2.5 text-sm">
                    <span className="text-slate-300">{item.intersectionId}</span>
                    <span className={`font-medium ${
                      item.status === "EMERGENCY_PRIORITY"
                        ? "text-emerald-300"
                        : item.status === "PREPARE"
                          ? "text-amber-300"
                          : item.status === "RELEASE"
                            ? "text-red-300"
                            : "text-slate-400"
                    }`}>{item.status || "NORMAL"}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/5 bg-white/1.5 px-3 py-3 text-sm text-slate-400">
                  Green corridor not active.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/5 bg-white/2.5 p-5">
          <div className="mb-4 flex items-center gap-3">
            <Activity className="h-4 w-4 text-blue-400" />
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Signal control panel</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/5">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-black/20 text-slate-400">
                <tr>
                  <th className="px-3 py-3 text-[10px] font-medium uppercase tracking-[0.16em]">Intersection</th>
                  <th className="px-3 py-3 text-[10px] font-medium uppercase tracking-[0.16em]">Phase</th>
                  <th className="px-3 py-3 text-[10px] font-medium uppercase tracking-[0.16em]">Time</th>
                  <th className="px-3 py-3 text-[10px] font-medium uppercase tracking-[0.16em]">Mode</th>
                </tr>
              </thead>
              <tbody>
                {signals.length > 0 ? (
                  signals.map((signal) => (
                    <tr key={signal.intersectionId} className="border-t border-white/5">
                      <td className="px-3 py-3 text-white">{signal.intersectionId}</td>
                      <td className="px-3 py-3 text-slate-300">{signal.phase || "--"}</td>
                      <td className="px-3 py-3 text-slate-300">{signal.remainingSeconds != null ? `${Number(signal.remainingSeconds).toFixed(0)}s` : "--"}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${
                          signal.mode === "NORMAL"
                            ? "border-slate-500/20 bg-slate-500/5 text-slate-300"
                            : signal.mode === "PREPARE"
                              ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                              : signal.mode === "ACTIVE"
                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                                : "border-red-500/20 bg-red-500/5 text-red-300"
                        }`}>
                          {signal.mode || "NORMAL"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-slate-400">Signal data not available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {signalControl && (
            <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-slate-300">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Signal control mode</p>
              <p className="mt-2 text-lg font-semibold text-white">{signalControl.control?.controlMode || "NORMAL"}</p>
              <p className="mt-1 text-xs text-slate-400">{signalControl.activeIntersection ? `Active intersection: ${signalControl.activeIntersection}` : "No active priority intersection."}</p>
            </div>
          )}
        </section>

        <section className="mt-8">
          <QuickInfo />
        </section>
      </main>
    </div>
  );
}
