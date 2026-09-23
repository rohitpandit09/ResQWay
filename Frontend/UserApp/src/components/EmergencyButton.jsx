import { motion } from "framer-motion";
import { Siren, LoaderCircle } from "lucide-react";

export default function EmergencyButton({
  onClick,
  loading = false,
  active = false,
}) {
  const disabled = loading || active;

  return (
    <div className="flex flex-col items-center">
      <motion.button
        whileHover={!disabled ? { scale: 1.03 } : undefined}
        whileTap={!disabled ? { scale: 0.96 } : undefined}
        onClick={onClick}
        disabled={disabled}
        className={`group relative flex h-44 w-44 items-center justify-center rounded-full transition-all sm:h-52 sm:w-52 ${
          active
            ? "cursor-not-allowed bg-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.18)]"
            : loading
              ? "cursor-wait bg-red-500/70 shadow-[0_0_80px_rgba(239,68,68,0.12)]"
              : "bg-red-500 shadow-[0_0_80px_rgba(239,68,68,0.18)]"
        }`}
      >
        <div
          className={`absolute -inset-3 rounded-full border ${
            active
              ? "border-emerald-500/10"
              : "border-red-500/10"
          }`}
        />

        <div
          className={`absolute -inset-6 rounded-full border ${
            active
              ? "border-emerald-500/5"
              : "border-red-500/5"
          }`}
        />

        <div className="flex flex-col items-center gap-2">
          {loading ? (
            <LoaderCircle className="h-9 w-9 animate-spin text-white" />
          ) : active ? (
            <Siren className="h-9 w-9 text-white" strokeWidth={1.8} />
          ) : (
            <Siren className="h-9 w-9 text-white" strokeWidth={1.8} />
          )}

          <span className="text-lg font-bold tracking-wide text-white">
            {loading
              ? "WAIT"
              : active
                ? "ACTIVE"
                : "SOS"}
          </span>

          <span
            className={`text-[10px] font-medium uppercase tracking-[0.25em] ${
              active
                ? "text-emerald-100"
                : "text-red-100"
            }`}
          >
            {loading
              ? "Requesting"
              : active
                ? "Emergency"
                : "Emergency"}
          </span>
        </div>
      </motion.button>

      <p className="mt-8 max-w-xs text-center text-sm leading-6 text-slate-500">
        {active
          ? "Emergency response is currently active."
          : "Press only when you need immediate ambulance assistance."}
      </p>
    </div>
  );
}