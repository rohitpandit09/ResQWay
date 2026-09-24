// src/components/ETAPanel.jsx
// Displays ETA data from backend snapshot.
// Data shape from: Backend/src/eta/effectiveEtaEngine.js → getSnapshot()
//
// snapshot.eta shape:
// {
//   ambulanceId, state, currentNode, nextNode,
//   position, speed, totalEffectiveETA,
//   intersections: [{
//     intersectionId, fromNode, travelETA, signalDelay,
//     effectiveETA, signalState, signalPhase, movement
//   }]
// }

import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowRight, AlertCircle } from "lucide-react";

// ==================================================
// HELPERS
// ==================================================

function formatSeconds(sec) {
  if (!Number.isFinite(sec)) return "—";
  if (sec < 60) return `${sec.toFixed(0)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s}s`;
}

function etaBarColor(eta) {
  if (!Number.isFinite(eta)) return "bg-slate-600";
  if (eta <= 8) return "bg-red-500";
  if (eta <= 20) return "bg-yellow-500";
  return "bg-emerald-500";
}

// ==================================================
// COMPONENT
// ==================================================

export function ETAPanel({ eta }) {
  if (!eta) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-400">ETA</h3>
        </div>
        <p className="text-slate-500 text-sm">No active route</p>
      </div>
    );
  }

  const intersections = Array.isArray(eta.intersections)
    ? eta.intersections
    : [];

  return (
    <div className="card">
      {/* Header + Total ETA */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-900/30 border border-blue-700/30">
            <Clock size={14} className="text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">ETA</h3>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
          <p className="text-xl font-bold text-white">
            {formatSeconds(eta.totalEffectiveETA)}
          </p>
        </div>
      </div>

      {/* Per-intersection ETAs */}
      {intersections.length === 0 ? (
        <p className="text-slate-500 text-sm">No upcoming intersections</p>
      ) : (
        <div className="space-y-2">
          {intersections.map((item, idx) => {
            const travelETA = item.travelETA ?? 0;
            const delay = item.signalDelay ?? 0;
            const effective = item.effectiveETA ?? 0;
            const barColor = etaBarColor(effective);

            return (
              <AnimatePresence key={item.intersectionId} mode="wait">
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.25 }}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40"
                >
                  {/* Node badge */}
                  <span className="shrink-0 w-16 text-center text-xs font-bold text-slate-300 bg-slate-700 rounded px-1.5 py-1">
                    {item.intersectionId}
                  </span>

                  {/* Bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">
                        Travel {formatSeconds(travelETA)}
                      </span>
                      {delay > 0 && (
                        <span className="text-yellow-400 flex items-center gap-1">
                          <AlertCircle size={10} />
                          +{formatSeconds(delay)} signal
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${barColor}`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (8 / Math.max(effective, 1)) * 100)}%`,
                        }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>

                  {/* Effective ETA */}
                  <span
                    className={`shrink-0 text-sm font-bold ${
                      effective <= 8
                        ? "text-red-400"
                        : effective <= 20
                        ? "text-yellow-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {formatSeconds(effective)}
                  </span>

                  {/* Arrow for non-last items */}
                  {idx < intersections.length - 1 && (
                    <ArrowRight size={12} className="shrink-0 text-slate-600" />
                  )}
                </motion.div>
              </AnimatePresence>
            );
          })}
        </div>
      )}
    </div>
  );
}
