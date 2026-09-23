import {
  Clock3,
  Navigation,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LiveStatusCard({
  connected = false,
  emergency = null,
  ambulance = null,
  eta = null,
}) {
  const emergencyActive =
    emergency &&
    emergency.state !== "COMPLETED" &&
    emergency.state !== "CANCELLED";

  const networkStatus = connected
    ? "Emergency network online"
    : "Backend disconnected";

  const responseStatus = emergencyActive
    ? "Active"
    : "Ready";

  const trackingStatus = ambulance
    ? "Live"
    : "Ready";

  const priorityStatus = emergencyActive
    ? "Active"
    : "Standby";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-3xl border border-white/5 bg-white/[0.035] p-5 backdrop-blur-xl"
    >
      {/* NETWORK */}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Network status
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                connected
                  ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                  : "bg-red-400"
              }`}
            />

            <span
              className={`text-sm font-medium ${
                connected
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {networkStatus}
            </span>
          </div>
        </div>

        <ShieldCheck className="h-5 w-5 text-slate-600" />
      </div>

      {/* STATUS GRID */}

      <div className="mt-5 grid grid-cols-3 divide-x divide-white/5">
        <div className="px-3 first:pl-0">
          <Clock3 className="mb-2 h-4 w-4 text-slate-500" />

          <p className="text-[11px] text-slate-500">
            Response
          </p>

          <p
            className={`mt-1 text-sm font-semibold ${
              emergencyActive
                ? "text-red-400"
                : "text-white"
            }`}
          >
            {responseStatus}
          </p>
        </div>

        <div className="px-3">
          <Navigation className="mb-2 h-4 w-4 text-slate-500" />

          <p className="text-[11px] text-slate-500">
            Tracking
          </p>

          <p
            className={`mt-1 text-sm font-semibold ${
              ambulance
                ? "text-emerald-400"
                : "text-white"
            }`}
          >
            {trackingStatus}
          </p>
        </div>

        <div className="px-3">
          <Radio className="mb-2 h-4 w-4 text-slate-500" />

          <p className="text-[11px] text-slate-500">
            Priority
          </p>

          <p
            className={`mt-1 text-sm font-semibold ${
              emergencyActive
                ? "text-emerald-400"
                : "text-white"
            }`}
          >
            {priorityStatus}
          </p>
        </div>
      </div>

      {/* LIVE ETA */}

      {ambulance && (
        <div className="mt-5 rounded-2xl border border-white/5 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Ambulance
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {ambulance.id}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                ETA
              </p>

              <p className="mt-1 text-sm font-semibold text-emerald-400">
                {eta?.totalEffectiveETA != null
                  ? `${Number(
                      eta.totalEffectiveETA
                    ).toFixed(1)}s`
                  : "--"}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}