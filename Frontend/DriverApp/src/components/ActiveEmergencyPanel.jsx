// src/components/ActiveEmergencyPanel.jsx
// Shows the active emergency details and the driver's current phase.
// Every state transition is driven by the backend snapshot,
// not by buttons here — we display what the backend reports.

import { motion } from "framer-motion";
import {
  AlertTriangle,
  MapPin,
  Hospital,
  Clock,
  CheckCircle,
  Truck,
  Activity,
  User,
} from "lucide-react";
import {
  EMERGENCY_STATES,
  EMERGENCY_STATE_LABELS,
  AMBULANCE_STATES,
  AMBULANCE_STATE_LABELS,
} from "../constants.js";

// ==================================================
// WORKFLOW STEPS
// Maps backend emergency states to ordered steps
// ==================================================

const WORKFLOW_STEPS = [
  {
    state: EMERGENCY_STATES.DRIVER_ASSIGNED,
    label: "Dispatch Received",
    icon: AlertTriangle,
  },
  {
    state: EMERGENCY_STATES.EN_ROUTE_TO_CLIENT,
    label: "En Route to Patient",
    icon: Truck,
  },
  {
    state: EMERGENCY_STATES.ARRIVED_AT_CLIENT,
    label: "Arrived at Patient",
    icon: MapPin,
  },
  {
    state: EMERGENCY_STATES.PICKUP,
    label: "Patient Pickup",
    icon: User,
  },
  {
    state: EMERGENCY_STATES.EN_ROUTE_TO_HOSPITAL,
    label: "En Route to Hospital",
    icon: Activity,
  },
  {
    state: EMERGENCY_STATES.ARRIVED_AT_HOSPITAL,
    label: "Arrived at Hospital",
    icon: Hospital,
  },
  {
    state: EMERGENCY_STATES.COMPLETED,
    label: "Completed",
    icon: CheckCircle,
  },
];

function getStepStatus(stepState, currentState) {
  const currentIdx = WORKFLOW_STEPS.findIndex((s) => s.state === currentState);
  const stepIdx = WORKFLOW_STEPS.findIndex((s) => s.state === stepState);
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

// ==================================================
// COMPONENT
// ==================================================

export function ActiveEmergencyPanel({ emergency, ambulance }) {
  if (!emergency) return null;

  const stateLabel =
    EMERGENCY_STATE_LABELS[emergency.state] ?? emergency.state;

  const ambStateLabel = ambulance
    ? AMBULANCE_STATE_LABELS[ambulance.state] ?? ambulance.state
    : null;

  const createdAt = emergency.createdAt
    ? new Date(emergency.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  const assignedAt = emergency.assignedAt
    ? new Date(emergency.assignedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  const isCompleted = emergency.state === EMERGENCY_STATES.COMPLETED;
  const isCancelled = emergency.state === EMERGENCY_STATES.CANCELLED;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-900/30 border border-red-700/30">
            <AlertTriangle size={14} className="text-red-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Emergency</p>
            <p className="text-sm font-bold text-white">{emergency.id}</p>
          </div>
        </div>

        <span
          className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
            isCompleted
              ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/30"
              : isCancelled
              ? "bg-slate-800 text-slate-400 border border-slate-700"
              : "bg-red-900/40 text-red-300 border border-red-700/30"
          }`}
        >
          {stateLabel}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            Patient at
          </span>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-red-400" />
            <span className="font-bold text-white">
              {emergency.clientNode ?? "—"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            Hospital at
          </span>
          <div className="flex items-center gap-1.5">
            <Hospital size={12} className="text-blue-400" />
            <span className="font-bold text-white">
              {emergency.hospitalNode ?? "—"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            Created
          </span>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-500" />
            <span className="text-slate-300">{createdAt}</span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            Assigned
          </span>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-500" />
            <span className="text-slate-300">{assignedAt}</span>
          </div>
        </div>
      </div>

      {/* Ambulance state from backend */}
      {ambulance && ambStateLabel && (
        <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-slate-800/60 border border-slate-700/40 text-sm">
          <Truck size={13} className="text-slate-400 shrink-0" />
          <span className="text-slate-500">Ambulance</span>
          <span className="ml-auto font-bold text-white">{ambulance.id}</span>
          <span className="text-yellow-300 font-medium">{ambStateLabel}</span>
        </div>
      )}

      {/* Workflow progress */}
      <div className="space-y-1.5">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          Progress
        </p>
        {WORKFLOW_STEPS.map((step, idx) => {
          const status = getStepStatus(step.state, emergency.state);
          const Icon = step.icon;

          return (
            <motion.div
              key={step.state}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                status === "active"
                  ? "bg-red-900/30 border border-red-700/30"
                  : status === "done"
                  ? "bg-emerald-900/10 border border-emerald-900/20"
                  : "bg-slate-800/30 border border-slate-800"
              }`}
            >
              <Icon
                size={13}
                className={`shrink-0 ${
                  status === "active"
                    ? "text-red-400"
                    : status === "done"
                    ? "text-emerald-500"
                    : "text-slate-600"
                }`}
              />
              <span
                className={`text-xs flex-1 ${
                  status === "active"
                    ? "text-red-200 font-semibold"
                    : status === "done"
                    ? "text-emerald-500/70"
                    : "text-slate-600"
                }`}
              >
                {step.label}
              </span>
              {status === "active" && (
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-red-400"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
              {status === "done" && (
                <CheckCircle size={12} className="text-emerald-500" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Completed callout */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 flex items-center gap-2 px-3 py-3 rounded-xl bg-emerald-900/30 border border-emerald-600/30"
        >
          <CheckCircle size={16} className="text-emerald-400" />
          <div>
            <p className="text-sm font-bold text-emerald-300">
              Emergency Completed
            </p>
            {emergency.completedAt && (
              <p className="text-xs text-emerald-500">
                {new Date(emergency.completedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
