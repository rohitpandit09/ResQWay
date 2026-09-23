import { Activity, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between border-b border-white/5 px-5 py-4 sm:px-8"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
          <Activity className="h-5 w-5 text-red-400" />
        </div>

        <div>
          <h1 className="text-base font-semibold tracking-tight text-white">
            ResQWay
          </h1>

          <p className="text-[11px] text-slate-500">
            Emergency Response Network
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/3 px-3 py-2">
        <MapPin className="h-3.5 w-3.5 text-emerald-400" />

        <span className="hidden text-xs text-slate-400 sm:block">
          Location active
        </span>

        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      </div>
    </motion.header>
  );
}