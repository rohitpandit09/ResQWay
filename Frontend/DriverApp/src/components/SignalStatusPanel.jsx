// src/components/SignalStatusPanel.jsx
// Displays live signal states from backend snapshot.
// Data shape from: Backend/src/signals/signalController.js → getState()
//
// snapshot.signals is an array of:
// { intersectionId, phase, remainingSeconds, mode }
//
// Phases (from signalPhases.js):
// NORTH_SOUTH_GREEN, NORTH_SOUTH_YELLOW, EAST_WEST_GREEN, EAST_WEST_YELLOW

import { motion, AnimatePresence } from "framer-motion";
import { TrafficCone } from "lucide-react";
import { SIGNAL_PHASES } from "../constants.js";

// ==================================================
// PHASE → COLOR MAPPING
// ==================================================

function getSignalColor(phase) {
  switch (phase) {
    case SIGNAL_PHASES.NORTH_SOUTH_GREEN:
    case SIGNAL_PHASES.EAST_WEST_GREEN:
      return {
        dot: "bg-emerald-400",
        ring: "ring-emerald-500/40",
        text: "text-emerald-300",
        label: "GREEN",
        bg: "bg-emerald-900/20 border-emerald-700/30",
      };
    case SIGNAL_PHASES.NORTH_SOUTH_YELLOW:
    case SIGNAL_PHASES.EAST_WEST_YELLOW:
      return {
        dot: "bg-yellow-400",
        ring: "ring-yellow-500/40",
        text: "text-yellow-300",
        label: "YELLOW",
        bg: "bg-yellow-900/20 border-yellow-700/30",
      };
    default:
      return {
        dot: "bg-red-400",
        ring: "ring-red-500/40",
        text: "text-red-300",
        label: "RED",
        bg: "bg-red-900/20 border-red-700/30",
      };
  }
}

function getDirectionLabel(phase) {
  if (
    phase === SIGNAL_PHASES.NORTH_SOUTH_GREEN ||
    phase === SIGNAL_PHASES.NORTH_SOUTH_YELLOW
  ) {
    return "N/S";
  }
  if (
    phase === SIGNAL_PHASES.EAST_WEST_GREEN ||
    phase === SIGNAL_PHASES.EAST_WEST_YELLOW
  ) {
    return "E/W";
  }
  return "—";
}

// ==================================================
// SINGLE SIGNAL
// ==================================================

function SignalLight({ signal }) {
  const colors = getSignalColor(signal.phase);
  const direction = getDirectionLabel(signal.phase);
  const remaining = signal.remainingSeconds ?? 0;
  const isPriority = signal.mode === "PRIORITY" || signal.mode !== "NORMAL";

  return (
    <motion.div
      layout
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${colors.bg}`}
    >
      {/* Traffic light dot */}
      <span className={`relative flex h-3 w-3 shrink-0`}>
        {/* Pulse for green signals */}
        {colors.label === "GREEN" && (
          <motion.span
            className={`absolute inline-flex h-full w-full rounded-full ${colors.dot} opacity-60`}
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        )}
        <span
          className={`relative inline-flex h-3 w-3 rounded-full ${colors.dot} ring-2 ${colors.ring}`}
        />
      </span>

      {/* Intersection ID */}
      <span className="text-sm font-bold text-white w-16">{signal.intersectionId}</span>

      {/* Direction */}
      <span className="text-xs text-slate-500 font-mono bg-slate-800 px-1.5 py-0.5 rounded w-8 text-center">
        {direction}
      </span>

      {/* Phase label */}
      <span className={`text-xs font-bold uppercase tracking-wide flex-1 ${colors.text}`}>
        {colors.label}
      </span>

      {/* Remaining seconds */}
      <div className="text-right">
        <AnimatePresence mode="wait">
          <motion.span
            key={Math.floor(remaining)}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className={`text-sm font-bold tabular-nums ${colors.text}`}
          >
            {remaining.toFixed(0)}
            <span className="text-xs text-slate-500 font-normal ml-0.5">s</span>
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Priority badge */}
      {isPriority && (
        <span className="text-xs font-bold text-red-400 bg-red-900/30 border border-red-700/30 px-1.5 py-0.5 rounded uppercase tracking-wide">
          P
        </span>
      )}
    </motion.div>
  );
}

// ==================================================
// PANEL
// ==================================================

export function SignalStatusPanel({ signals }) {
  const signalList = Array.isArray(signals) ? signals : [];

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
          <TrafficCone size={14} className="text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">
          Traffic Signals
        </h3>
        <span className="ml-auto text-xs text-slate-600">
          {signalList.length} intersections
        </span>
      </div>

      {signalList.length === 0 ? (
        <p className="text-slate-500 text-sm">No signal data</p>
      ) : (
        <div className="space-y-2">
          {signalList.map((signal) => (
            <SignalLight key={signal.intersectionId} signal={signal} />
          ))}
        </div>
      )}
    </div>
  );
}
