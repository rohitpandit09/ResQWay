// src/components/StatusBadge.jsx
// Driver status indicator — OFFLINE / ONLINE / ON EMERGENCY

import { motion } from "framer-motion";
import { DRIVER_STATUS } from "../constants.js";

const STATUS_CONFIG = {
  [DRIVER_STATUS.OFFLINE]: {
    label: "OFFLINE",
    dot: "bg-slate-500",
    badge: "bg-slate-800 border-slate-600 text-slate-300",
    pulse: false,
  },
  [DRIVER_STATUS.ONLINE]: {
    label: "ONLINE",
    dot: "bg-emerald-400",
    badge: "bg-emerald-900/40 border-emerald-500/50 text-emerald-300",
    pulse: true,
  },
  [DRIVER_STATUS.ON_EMERGENCY]: {
    label: "ON EMERGENCY",
    dot: "bg-red-400",
    badge: "bg-red-900/40 border-red-500/50 text-red-300",
    pulse: true,
  },
};

export function StatusBadge({ status, className = "" }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[DRIVER_STATUS.OFFLINE];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase ${config.badge} ${className}`}
      role="status"
      aria-label={`Driver status: ${config.label}`}
    >
      {/* Dot indicator */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {config.pulse && (
          <motion.span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
            animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.dot}`}
        />
      </span>

      {config.label}
    </div>
  );
}
