// src/components/WaitingScreen.jsx
// Shown when driver is ONLINE but has no active emergency.
// Displays a live pulse indicating the driver is ready for dispatch.

import { motion } from "framer-motion";
import { Radio, Ambulance } from "lucide-react";

export function WaitingScreen({ ambulance, simulationTime }) {
  const simTime = Number.isFinite(simulationTime)
    ? simulationTime.toFixed(0)
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center"
    >
      {/* Pulse ring animation */}
      <div className="relative mb-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-emerald-500/20"
            animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut",
            }}
          />
        ))}
        <div className="relative w-20 h-20 rounded-full bg-emerald-900/30 border-2 border-emerald-600/50 flex items-center justify-center">
          <Ambulance size={32} className="text-emerald-400" />
        </div>
      </div>

      <motion.h2
        className="text-xl font-bold text-white mb-2"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Waiting for Dispatch
      </motion.h2>

      <p className="text-slate-500 text-sm max-w-xs mb-6 leading-relaxed">
        You are online and available. Emergency requests will appear here
        automatically.
      </p>

      {/* Simulation clock */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400">
        <Radio size={12} className="text-emerald-400" />
        Simulation T+{simTime}s
      </div>

      {/* Ambulance standby status */}
      {ambulance && (
        <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {ambulance.id} — Standby at {ambulance.currentNode ?? "base"}
        </div>
      )}
    </motion.div>
  );
}
