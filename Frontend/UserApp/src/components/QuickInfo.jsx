import {
  HeartPulse,
  MapPinned,
  Route,
} from "lucide-react";
import { motion } from "framer-motion";

const items = [
  {
    icon: MapPinned,
    title: "Live tracking",
    description:
      "Follow the ambulance using real-time simulation data.",
  },
  {
    icon: Route,
    title: "Smart routing",
    description:
      "ResQWay coordinates the emergency route and upcoming intersections.",
  },
  {
    icon: HeartPulse,
    title: "Emergency response",
    description:
      "The ambulance journey and response state are coordinated by the backend.",
  },
];

export default function QuickInfo() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2 + index * 0.08,
            }}
            className="rounded-2xl border border-white/5 bg-white/[0.025] p-4"
          >
            <Icon className="h-5 w-5 text-slate-400" />

            <h3 className="mt-4 text-sm font-semibold text-white">
              {item.title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {item.description}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}