// src/components/ConnectionStatus.jsx
// Shows the backend Socket.IO connection state in the header.

import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CONNECTION_STATE } from "../hooks/useSocket.js";

const CONFIG = {
  [CONNECTION_STATE.CONNECTING]: {
    icon: Loader2,
    label: "Connecting",
    color: "text-yellow-400",
    spin: true,
  },
  [CONNECTION_STATE.CONNECTED]: {
    icon: Wifi,
    label: "Live",
    color: "text-emerald-400",
    spin: false,
  },
  [CONNECTION_STATE.DISCONNECTED]: {
    icon: WifiOff,
    label: "Disconnected",
    color: "text-slate-400",
    spin: false,
  },
  [CONNECTION_STATE.ERROR]: {
    icon: AlertTriangle,
    label: "Error",
    color: "text-red-400",
    spin: false,
  },
};

export function ConnectionStatus({ connectionState, lastError }) {
  const cfg = CONFIG[connectionState] ?? CONFIG[CONNECTION_STATE.DISCONNECTED];
  const Icon = cfg.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={connectionState}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1.5"
        title={lastError ? `Error: ${lastError}` : cfg.label}
      >
        <Icon
          size={14}
          className={`${cfg.color} ${cfg.spin ? "animate-spin" : ""}`}
        />
        <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
      </motion.div>
    </AnimatePresence>
  );
}
