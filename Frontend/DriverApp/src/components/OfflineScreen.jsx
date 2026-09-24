// src/components/OfflineScreen.jsx
// Full-screen shown when driver status is OFFLINE.
// The driver must go ONLINE to receive dispatches.

import { motion } from "framer-motion";
import { Power, Ambulance, Shield } from "lucide-react";

export function OfflineScreen({ onGoOnline, isConnected }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center"
    >
      {/* Ambulance icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
          <Ambulance size={40} className="text-slate-500" />
        </div>
        {/* Offline dot */}
        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-slate-600 border-2 border-slate-900 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-2xl font-bold text-white mb-2"
      >
        You are Offline
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-slate-400 text-sm max-w-xs mb-8 leading-relaxed"
      >
        Go online to receive emergency dispatches and start your shift.
      </motion.p>

      {/* Connection requirement */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-2 px-4 py-2.5 mb-6 rounded-xl bg-yellow-900/20 border border-yellow-700/30 text-xs text-yellow-400"
        >
          <Shield size={13} />
          Connecting to ResQWay backend…
        </motion.div>
      )}

      {/* Go Online button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={onGoOnline}
        disabled={!isConnected}
        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold text-base transition-colors shadow-lg shadow-emerald-900/30"
        aria-label="Go online"
      >
        <Power size={18} />
        Go Online
      </motion.button>

      {!isConnected && (
        <p className="mt-3 text-xs text-slate-600">
          Requires backend connection
        </p>
      )}

      {/* ResQWay branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 flex flex-col items-center gap-1"
      >
        <div className="flex items-center gap-2 text-slate-700">
          <Ambulance size={14} />
          <span className="text-xs font-bold uppercase tracking-widest">
            ResQWay
          </span>
        </div>
        <p className="text-xs text-slate-700">Driver Application</p>
      </motion.div>
    </motion.div>
  );
}
