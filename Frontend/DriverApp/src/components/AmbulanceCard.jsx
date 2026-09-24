// src/components/AmbulanceCard.jsx
// Displays real-time ambulance state from backend snapshot.
// Data shape from: Backend/src/ambulance/ambulance.js → getState()

import { motion } from "framer-motion";
import { Ambulance, MapPin, Navigation, Gauge, Activity } from "lucide-react";
import { AMBULANCE_STATES, AMBULANCE_STATE_LABELS } from "../constants.js";

// ==================================================
// STATE COLOR MAP
// ==================================================

const STATE_COLORS = {
  [AMBULANCE_STATES.IDLE]: "text-slate-400 bg-slate-800",
  [AMBULANCE_STATES.DISPATCHED]: "text-yellow-300 bg-yellow-900/40",
  [AMBULANCE_STATES.EN_ROUTE_TO_CLIENT]: "text-blue-300 bg-blue-900/40",
  [AMBULANCE_STATES.ARRIVED_AT_CLIENT]: "text-orange-300 bg-orange-900/40",
  [AMBULANCE_STATES.PICKUP]: "text-purple-300 bg-purple-900/40",
  [AMBULANCE_STATES.EN_ROUTE_TO_HOSPITAL]: "text-cyan-300 bg-cyan-900/40",
  [AMBULANCE_STATES.ARRIVED_AT_HOSPITAL]: "text-emerald-300 bg-emerald-900/40",
  [AMBULANCE_STATES.COMPLETED]: "text-emerald-400 bg-emerald-900/40",
};

// ==================================================
// COMPONENT
// ==================================================

export function AmbulanceCard({ ambulance }) {
  if (!ambulance) {
    return (
      <div className="card flex items-center justify-center min-h-[120px]">
        <p className="text-slate-500 text-sm">Waiting for ambulance data…</p>
      </div>
    );
  }

  const stateLabel =
    AMBULANCE_STATE_LABELS[ambulance.state] ?? ambulance.state;
  const stateColor =
    STATE_COLORS[ambulance.state] ?? "text-slate-300 bg-slate-800";

  const speedKmh = ambulance.speed
    ? ((ambulance.speed * 3.6)).toFixed(1)
    : "0.0";

  const positionM = ambulance.position
    ? ambulance.position.toFixed(1)
    : "0.0";

  return (
    <motion.div
      className="card"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-900/30 border border-red-700/30">
            <Ambulance size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Ambulance</p>
            <p className="text-sm font-bold text-white">{ambulance.id}</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${stateColor}`}
        >
          {stateLabel}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Speed */}
        <div className="stat-box">
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge size={12} className="text-slate-500" />
            <span className="text-xs text-slate-500 uppercase tracking-wide">Speed</span>
          </div>
          <p className="text-lg font-bold text-white">
            {speedKmh}
            <span className="text-xs text-slate-500 ml-1 font-normal">km/h</span>
          </p>
        </div>

        {/* Position on lane */}
        <div className="stat-box">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity size={12} className="text-slate-500" />
            <span className="text-xs text-slate-500 uppercase tracking-wide">Position</span>
          </div>
          <p className="text-lg font-bold text-white">
            {positionM}
            <span className="text-xs text-slate-500 ml-1 font-normal">m</span>
          </p>
        </div>

        {/* Current node */}
        <div className="stat-box">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin size={12} className="text-slate-500" />
            <span className="text-xs text-slate-500 uppercase tracking-wide">At</span>
          </div>
          <p className="text-sm font-bold text-white">
            {ambulance.currentNode ?? "—"}
          </p>
        </div>

        {/* Next node */}
        <div className="stat-box">
          <div className="flex items-center gap-1.5 mb-1">
            <Navigation size={12} className="text-slate-500" />
            <span className="text-xs text-slate-500 uppercase tracking-wide">Next</span>
          </div>
          <p className="text-sm font-bold text-white">
            {ambulance.nextNode ?? "—"}
          </p>
        </div>
      </div>

      {/* Patient status indicator */}
      {ambulance.patientPickedUp && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-900/30 border border-purple-700/30">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs text-purple-300 font-medium">Patient on board</span>
        </div>
      )}
    </motion.div>
  );
}
