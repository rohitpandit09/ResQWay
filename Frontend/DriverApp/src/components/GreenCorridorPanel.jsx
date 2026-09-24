// src/components/GreenCorridorPanel.jsx
// Displays Green Corridor status from backend snapshot.
// Data shape from: Backend/src/greenCorridor/greenCorridorEngine.js → getSnapshot()
//
// snapshot.greenCorridor shape:
// {
//   ambulanceId, activePriority, priorityIntersection,
//   prepareIntersections: [],
//   intersections: [{
//     intersectionId, fromNode, movement, eta,
//     travelETA, signalDelay, signalState, signalPhase,
//     status, recommendedAction
//   }]
// }

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, CheckCircle, Circle } from "lucide-react";
import { GREEN_CORRIDOR_STATUS } from "../constants.js";

// ==================================================
// STATUS CONFIG
// ==================================================

const STATUS_CONFIG = {
  [GREEN_CORRIDOR_STATUS.EMERGENCY_PRIORITY]: {
    label: "PRIORITY",
    color: "text-red-400",
    bg: "bg-red-900/40 border-red-500/50",
    icon: Zap,
    iconColor: "text-red-400",
  },
  [GREEN_CORRIDOR_STATUS.PREPARE]: {
    label: "PREPARE",
    color: "text-yellow-400",
    bg: "bg-yellow-900/30 border-yellow-600/40",
    icon: Shield,
    iconColor: "text-yellow-400",
  },
  [GREEN_CORRIDOR_STATUS.NORMAL]: {
    label: "NORMAL",
    color: "text-slate-400",
    bg: "bg-slate-800/60 border-slate-700/40",
    icon: Circle,
    iconColor: "text-slate-500",
  },
  [GREEN_CORRIDOR_STATUS.RELEASE]: {
    label: "RELEASED",
    color: "text-emerald-400",
    bg: "bg-emerald-900/20 border-emerald-700/30",
    icon: CheckCircle,
    iconColor: "text-emerald-400",
  },
};

// ==================================================
// COMPONENT
// ==================================================

export function GreenCorridorPanel({ greenCorridor }) {
  if (!greenCorridor) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-400">Green Corridor</h3>
        </div>
        <p className="text-slate-500 text-sm">No active corridor</p>
      </div>
    );
  }

  const intersections = Array.isArray(greenCorridor.intersections)
    ? greenCorridor.intersections
    : [];

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              greenCorridor.activePriority
                ? "bg-red-900/30 border-red-700/30"
                : "bg-slate-800 border-slate-700"
            }`}
          >
            <Zap
              size={14}
              className={
                greenCorridor.activePriority ? "text-red-400" : "text-slate-500"
              }
            />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">
            Green Corridor
          </h3>
        </div>

        {greenCorridor.activePriority && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-900/40 border border-red-500/50"
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-red-400"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <span className="text-xs font-bold text-red-300 uppercase tracking-wider">
              Active
            </span>
          </motion.div>
        )}
      </div>

      {/* Priority intersection callout */}
      {greenCorridor.priorityIntersection && (
        <motion.div
          key={greenCorridor.priorityIntersection}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-red-900/30 border border-red-600/40"
        >
          <Zap size={14} className="text-red-400 shrink-0" />
          <span className="text-xs text-red-300 font-medium">
            Priority active at{" "}
            <span className="font-bold text-red-200">
              {greenCorridor.priorityIntersection}
            </span>
          </span>
        </motion.div>
      )}

      {/* Intersection list */}
      {intersections.length === 0 ? (
        <p className="text-slate-500 text-sm">No intersections in corridor</p>
      ) : (
        <div className="space-y-2">
          {intersections.map((item, idx) => {
            const cfg =
              STATUS_CONFIG[item.status] ??
              STATUS_CONFIG[GREEN_CORRIDOR_STATUS.NORMAL];
            const Icon = cfg.icon;

            return (
              <AnimatePresence key={item.intersectionId} mode="wait">
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${cfg.bg}`}
                >
                  <Icon size={14} className={`shrink-0 ${cfg.iconColor}`} />

                  <span className="text-sm font-bold text-white flex-1">
                    {item.intersectionId}
                  </span>

                  {item.movement && (
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded font-mono">
                      {item.movement}
                    </span>
                  )}

                  <span
                    className={`text-xs font-bold uppercase tracking-wide ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                </motion.div>
              </AnimatePresence>
            );
          })}
        </div>
      )}
    </div>
  );
}
