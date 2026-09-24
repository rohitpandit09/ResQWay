// src/components/EmergencyRequestCard.jsx
// Shown when a new emergency dispatch is received from the backend.
// Driver can Accept or Reject.
//
// NOTE: The backend auto-dispatches the ambulance on emergency creation.
// Accept/Reject here is a local UI acknowledgment.
// See useEmergency.js for the full explanation of missing backend capabilities.

import { motion } from "framer-motion";
import { AlertTriangle, MapPin, Hospital, Check, X, Clock } from "lucide-react";
import { EMERGENCY_STATE_LABELS } from "../constants.js";

// ==================================================
// COMPONENT
// ==================================================

export function EmergencyRequestCard({ emergency, onAccept, onReject }) {
  if (!emergency) return null;

  const stateLabel =
    EMERGENCY_STATE_LABELS[emergency.state] ?? emergency.state;

  const createdAt = emergency.createdAt
    ? new Date(emergency.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -16 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative overflow-hidden rounded-2xl border-2 border-red-500/60 bg-slate-900 shadow-xl shadow-red-900/20"
    >
      {/* Animated top border */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-400 to-red-600"
        animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />

      {/* Alert banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-red-600/20 border-b border-red-700/30">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <AlertTriangle size={18} className="text-red-400" />
        </motion.div>
        <div className="flex-1">
          <p className="text-sm font-bold text-red-200 uppercase tracking-wider">
            Emergency Dispatch
          </p>
          <p className="text-xs text-red-400">{emergency.id}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={11} />
          {createdAt}
        </div>
      </div>

      {/* Emergency details */}
      <div className="px-4 py-4 space-y-3">
        {/* Ambulance assigned */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 w-24 shrink-0">Ambulance</span>
          <span className="font-bold text-white">
            {emergency.ambulanceId ?? "—"}
          </span>
        </div>

        {/* Client location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={13} className="text-red-400 shrink-0" />
          <span className="text-slate-500 w-20 shrink-0">Pick up at</span>
          <span className="font-bold text-white">
            {emergency.clientNode ?? "—"}
          </span>
        </div>

        {/* Hospital */}
        <div className="flex items-center gap-2 text-sm">
          <Hospital size={13} className="text-blue-400 shrink-0" />
          <span className="text-slate-500 w-20 shrink-0">Hospital at</span>
          <span className="font-bold text-white">
            {emergency.hospitalNode ?? "—"}
          </span>
        </div>

        {/* Current state */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 w-24 shrink-0">Status</span>
          <span className="text-yellow-300 font-medium">{stateLabel}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {/* Reject */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onReject}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
          aria-label="Reject emergency"
        >
          <X size={16} />
          Reject
        </motion.button>

        {/* Accept */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAccept}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 border border-red-400/40 text-white text-sm font-bold transition-colors"
          aria-label="Accept emergency"
        >
          <Check size={16} />
          Accept
        </motion.button>
      </div>
    </motion.div>
  );
}
