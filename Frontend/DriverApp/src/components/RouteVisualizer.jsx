// src/components/RouteVisualizer.jsx
// Visualizes the ambulance route as a linear node graph.
// All data comes from the backend snapshot ambulance state.
// No simulation logic here — purely display.

import { motion } from "framer-motion";
import { MapPin, CheckCircle, Navigation, Circle } from "lucide-react";
import { AMBULANCE_STATES } from "../constants.js";

// ==================================================
// NODE STATE
// ==================================================

function getNodeState(node, ambulance) {
  if (!ambulance) return "future";

  const { route, routeIndex, currentNode, nextNode, state } = ambulance;

  if (!Array.isArray(route) || route.length === 0) return "future";

  const nodeIdx = route.indexOf(node);
  if (nodeIdx === -1) return "future";

  // Current position in route
  const currentIdx = routeIndex ?? 0;

  if (nodeIdx < currentIdx) return "passed";
  if (nodeIdx === currentIdx) {
    // Are we actively at this node or have we passed it?
    if (
      state === AMBULANCE_STATES.ARRIVED_AT_CLIENT ||
      state === AMBULANCE_STATES.ARRIVED_AT_HOSPITAL ||
      state === AMBULANCE_STATES.PICKUP ||
      state === AMBULANCE_STATES.COMPLETED
    ) {
      return nodeIdx === route.length - 1 ? "current" : "passed";
    }
    return "current";
  }
  if (node === nextNode) return "next";
  return "future";
}

const NODE_STYLES = {
  passed: {
    circle: "bg-emerald-600 border-emerald-500",
    text: "text-emerald-400",
    icon: CheckCircle,
    iconColor: "text-emerald-300",
  },
  current: {
    circle: "bg-red-600 border-red-400 ring-2 ring-red-500/30 ring-offset-1 ring-offset-slate-900",
    text: "text-red-300 font-bold",
    icon: MapPin,
    iconColor: "text-red-200",
  },
  next: {
    circle: "bg-blue-700 border-blue-500",
    text: "text-blue-300",
    icon: Navigation,
    iconColor: "text-blue-300",
  },
  future: {
    circle: "bg-slate-700 border-slate-600",
    text: "text-slate-500",
    icon: Circle,
    iconColor: "text-slate-600",
  },
};

// ==================================================
// COMPONENT
// ==================================================

export function RouteVisualizer({ ambulance, emergency }) {
  // Use ambulance route if available, otherwise fall back to a
  // constructed route from emergency nodes
  let route = ambulance?.route ?? [];

  // If route is empty but we have emergency data, show conceptual nodes
  if (route.length === 0 && emergency) {
    route = ["INT-01", "INT-02", "INT-03", "INT-04"];
  }

  if (route.length === 0) {
    return (
      <div className="card">
        <p className="text-slate-500 text-sm">No route active</p>
      </div>
    );
  }

  // Determine destination label
  const destination =
    ambulance?.state === AMBULANCE_STATES.EN_ROUTE_TO_HOSPITAL ||
    ambulance?.state === AMBULANCE_STATES.ARRIVED_AT_HOSPITAL
      ? "Hospital"
      : "Patient";

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation size={14} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-300">Route</h3>
        </div>
        <span className="text-xs text-slate-500">
          → {destination}
        </span>
      </div>

      {/* Node track */}
      <div className="relative flex items-center justify-between px-2">
        {/* Track line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-700" />

        {/* Filled progress line */}
        {ambulance && Array.isArray(ambulance.route) && ambulance.route.length > 0 && (
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-600"
            initial={{ width: 0 }}
            animate={{
              width: `${
                ((ambulance.routeIndex ?? 0) /
                  Math.max(ambulance.route.length - 1, 1)) *
                  92 // 92% to account for px-2 padding
              }%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}

        {/* Nodes */}
        {route.map((node, idx) => {
          const nodeState = getNodeState(node, ambulance);
          const style = NODE_STYLES[nodeState];
          const Icon = style.icon;
          const isLast = idx === route.length - 1;

          return (
            <div key={node} className="relative flex flex-col items-center gap-1 z-10">
              {/* Node circle */}
              <motion.div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${style.circle}`}
                animate={
                  nodeState === "current"
                    ? { scale: [1, 1.1, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 1.2, repeat: nodeState === "current" ? Infinity : 0 }}
              >
                <Icon size={14} className={style.iconColor} />
              </motion.div>

              {/* Node label */}
              <span className={`text-[10px] font-mono ${style.text} whitespace-nowrap`}>
                {node}
              </span>

              {/* Destination label */}
              {isLast && (
                <span className="text-[9px] text-slate-600 uppercase tracking-wider">
                  {destination}
                </span>
              )}
              {idx === 0 && (
                <span className="text-[9px] text-slate-600 uppercase tracking-wider">
                  Base
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Ambulance progress text */}
      {ambulance && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            {ambulance.currentNode ?? "—"} → {ambulance.nextNode ?? "destination"}
          </span>
          <span className="tabular-nums">
            {ambulance.position?.toFixed(0) ?? 0}m along lane
          </span>
        </div>
      )}
    </div>
  );
}
