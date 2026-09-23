import { motion } from "framer-motion";
import {
  Ambulance,
  MapPin,
  Navigation,
  Radio,
  Route,
} from "lucide-react";

const NODES = {
  "INT-01": { x: 80, y: 260 },
  "INT-02": { x: 80, y: 80 },
  "INT-03": { x: 360, y: 80 },
  "INT-04": { x: 360, y: 260 },
};

const NODE_LABELS = {
  "INT-01": "Base",
  "INT-02": "Intersection 02",
  "INT-03": "Intersection 03",
  "INT-04": "Client",
};

const ROAD_LENGTH = 120;

function getPointOnRoad(
  currentNode,
  nextNode,
  position,
  laneLength = ROAD_LENGTH
) {
  const start = NODES[currentNode];
  const end = NODES[nextNode];

  if (!start || !end) {
    return null;
  }

  const progress = Math.max(
    0,
    Math.min(
      1,
      Number(position || 0) /
        Number(laneLength || ROAD_LENGTH)
    )
  );

  return {
    x:
      start.x +
      (end.x - start.x) * progress,

    y:
      start.y +
      (end.y - start.y) * progress,
  };
}

function SignalDot({ state }) {
  const normalized =
    String(state || "").toUpperCase();

  const isGreen =
    normalized.includes("GREEN");

  const isYellow =
    normalized.includes("YELLOW");

  return (
    <span
      className={`h-2.5 w-2.5 rounded-full ${
        isGreen
          ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
          : isYellow
            ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]"
            : "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"
      }`}
    />
  );
}

export default function LiveRouteMap({
  ambulance = null,
  eta = null,
  greenCorridor = null,
  signals = [],
}) {
  const currentNode =
    ambulance?.currentNode || "INT-01";

  const nextNode =
    ambulance?.nextNode || "INT-02";

  const ambulancePoint =
    getPointOnRoad(
      currentNode,
      nextNode,
      ambulance?.position,
      ambulance?.laneLength
    );

  const activePriority =
    greenCorridor?.activePriority ||
    false;

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-white/5 bg-white/[0.025] backdrop-blur-xl">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10">

            <Route className="h-4 w-4 text-red-400" />

          </div>

          <div>

            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Live emergency route
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              Ambulance tracking
            </p>

          </div>

        </div>


        <div className="flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-500/5 px-3 py-1.5">

          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-300">
            Backend live
          </span>

        </div>

      </div>


      {/* ==================================================
          MAP
      ================================================== */}

      <div className="relative p-4 sm:p-6">

        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#090c11]">

          <svg
            viewBox="0 0 440 340"
            className="h-auto w-full"
          >

            {/* ==================================================
                ROAD BACKGROUND
            ================================================== */}

            <path
              d="M80 260 L80 80 L360 80 L360 260"
              fill="none"
              stroke="rgba(255,255,255,0.035)"
              strokeWidth="34"
              strokeLinecap="round"
              strokeLinejoin="round"
            />


            {/* ==================================================
                ROAD CENTER
            ================================================== */}

            <path
              d="M80 260 L80 80 L360 80 L360 260"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="7 7"
            />


            {/* ==================================================
                ROAD SEGMENTS
            ================================================== */}

            <line
              x1="80"
              y1="260"
              x2="80"
              y2="80"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2"
            />

            <line
              x1="80"
              y1="80"
              x2="360"
              y2="80"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2"
            />

            <line
              x1="360"
              y1="80"
              x2="360"
              y2="260"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2"
            />

            <line
              x1="360"
              y1="260"
              x2="80"
              y2="260"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2"
            />


            {/* ==================================================
                GREEN CORRIDOR HIGHLIGHT
            ================================================== */}

            {activePriority && (
              <motion.line
                x1={NODES[currentNode]?.x || 80}
                y1={NODES[currentNode]?.y || 260}
                x2={NODES[nextNode]?.x || 80}
                y2={NODES[nextNode]?.y || 80}
                stroke="rgba(52,211,153,0.35)"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: [0.2, 0.7, 0.2],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                }}
              />
            )}


            {/* ==================================================
                INTERSECTIONS
            ================================================== */}

            {Object.entries(NODES).map(
              ([nodeId, point]) => {

                const priority =
                  greenCorridor?.intersections?.find(
                    (intersection) =>
                      intersection.intersectionId ===
                      nodeId
                  );

                return (
                  <g key={nodeId}>

                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="12"
                      fill="#090c11"
                      stroke={
                        priority?.status ===
                        "EMERGENCY_PRIORITY"
                          ? "rgba(52,211,153,0.8)"
                          : "rgba(255,255,255,0.12)"
                      }
                      strokeWidth="2"
                    />

                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={
                        priority?.status ===
                        "EMERGENCY_PRIORITY"
                          ? "#34d399"
                          : "#64748b"
                      }
                    />

                    <text
                      x={point.x}
                      y={point.y + 29}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9"
                    >
                      {nodeId}
                    </text>

                  </g>
                );
              }
            )}


            {/* ==================================================
                AMBULANCE
            ================================================== */}

            {ambulancePoint && (

              <motion.g
                animate={{
                  x: ambulancePoint.x - 12,
                  y: ambulancePoint.y - 12,
                }}
                transition={{
                  duration: 0.35,
                  ease: "linear",
                }}
              >

                <circle
                  cx="12"
                  cy="12"
                  r="12"
                  fill="rgba(239,68,68,0.12)"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="7"
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth="1.5"
                />

              </motion.g>

            )}

          </svg>


          {/* ==================================================
              AMBULANCE LABEL
          ================================================== */}

          {ambulancePoint && (

            <motion.div
              className="pointer-events-none absolute"
              animate={{
                left: `${(ambulancePoint.x / 440) * 100}%`,
                top: `${(ambulancePoint.y / 340) * 100}%`,
              }}
              transition={{
                duration: 0.35,
                ease: "linear",
              }}
              style={{
                transform:
                  "translate(-50%, -140%)",
              }}
            >

              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-[#0b0e13]/95 px-2.5 py-1.5 shadow-xl backdrop-blur">

                <Ambulance className="h-3 w-3 text-red-400" />

                <span className="text-[10px] font-medium text-white">
                  {ambulance.id || "AMB-001"}
                </span>

              </div>

            </motion.div>

          )}

        </div>


        {/* ==================================================
            LIVE DETAILS
        ================================================== */}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

            <div className="flex items-center gap-2">

              <MapPin className="h-4 w-4 text-red-400" />

              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                Current
              </p>

            </div>

            <p className="mt-2 text-sm font-semibold text-white">
              {currentNode}
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              {NODE_LABELS[currentNode] || "Road node"}
            </p>

          </div>


          <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

            <div className="flex items-center gap-2">

              <Navigation className="h-4 w-4 text-blue-400" />

              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                Next
              </p>

            </div>

            <p className="mt-2 text-sm font-semibold text-white">
              {nextNode}
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              Upcoming intersection
            </p>

          </div>


          <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

            <div className="flex items-center gap-2">

              <Radio className="h-4 w-4 text-emerald-400" />

              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                Speed
              </p>

            </div>

            <p className="mt-2 text-sm font-semibold text-white">
              {Number(
                ambulance?.speed || 0
              ).toFixed(1)}{" "}
              m/s
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              Backend telemetry
            </p>

          </div>


          <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">

            <div className="flex items-center gap-2">

              <Navigation className="h-4 w-4 text-emerald-400" />

              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                ETA
              </p>

            </div>

            <p className="mt-2 text-sm font-semibold text-emerald-300">

              {eta?.totalEffectiveETA != null
                ? `${Number(
                    eta.totalEffectiveETA
                  ).toFixed(1)} sec`
                : "--"}

            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              Effective route ETA
            </p>

          </div>

        </div>


        {/* ==================================================
            SIGNALS
        ================================================== */}

        {signals.length > 0 && (

          <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-4">

            <div className="mb-3 flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  Upcoming traffic control
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Live signal state from backend
                </p>

              </div>

              <Radio className="h-4 w-4 text-slate-600" />

            </div>


            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">

              {signals.map((signal) => (

                <div
                  key={signal.intersectionId}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
                >

                  <div className="flex items-center gap-2">

                    <SignalDot
                      state={
                        signal.signalState ||
                        signal.state ||
                        signal.phase
                      }
                    />

                    <span className="text-xs text-slate-300">
                      {signal.intersectionId}
                    </span>

                  </div>

                  <span className="text-[10px] text-slate-500">
                    {signal.phase || "--"}
                  </span>

                </div>

              ))}

            </div>

          </div>

        )}

      </div>

    </section>
  );
}