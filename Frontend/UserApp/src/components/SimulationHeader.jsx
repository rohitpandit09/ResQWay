import { Activity, Wifi, WifiOff } from "lucide-react";

export default function SimulationHeader({ connected = false, snapshot = null }) {
  const statusText = connected ? "LIVE SIMULATION" : "OFFLINE";
  const timeText = snapshot?.simulationTime != null ? `${Number(snapshot.simulationTime).toFixed(1)}s` : "--";

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-white/8 bg-white/2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
          <Activity className="h-5 w-5 text-red-400" />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">ResQWay</p>
          <h2 className="text-lg font-semibold text-white">{statusText}</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-white/5 bg-black/20 px-3 py-2">
          {connected ? (
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-red-400" />
          )}
          <span className={`text-[10px] font-medium uppercase tracking-[0.18em] ${connected ? "text-emerald-300" : "text-red-300"}`}>
            {connected ? "Connected" : "Reconnecting"}
          </span>
        </div>

        <div className="rounded-full border border-white/5 bg-black/20 px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Simulation time</p>
          <p className="text-sm font-medium text-white">{timeText}</p>
        </div>
      </div>
    </div>
  );
}
