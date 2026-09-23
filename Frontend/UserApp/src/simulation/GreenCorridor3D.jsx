import { NODE_POSITIONS } from "./worldMapping";

const STATUS_COLORS = {
  EMERGENCY_PRIORITY: "#34d399",
  PREPARE: "#fbbf24",
  RELEASE: "#64748b",
  NORMAL: "#334155",
};

function Segment({ from, to, color, opacity = 0.85 }) {
  const start = NODE_POSITIONS[from];
  const end = NODE_POSITIONS[to];
  if (!start || !end) return null;

  const midpoint = [(start[0] + end[0]) / 2, 0.16, (start[2] + end[2]) / 2];
  const length = Math.hypot(end[0] - start[0], end[2] - start[2]);
  const angle = Math.atan2(end[0] - start[0], end[2] - start[2]);

  return (
    <mesh position={midpoint} rotation={[-Math.PI / 2, 0, angle]}>
      <planeGeometry args={[0.42, length]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

export default function GreenCorridor3D({ corridor }) {
  const intersections = corridor?.intersections || [];
  if (!intersections.length) return null;

  return (
    <group>
      {intersections.map((item, index) => {
        const next = intersections[index + 1];
        const status = item?.status || "NORMAL";
        return (
          <group key={item?.intersectionId || index}>
            {next && <Segment from={item.intersectionId} to={next.intersectionId} color={STATUS_COLORS[status] || STATUS_COLORS.NORMAL} opacity={status === "EMERGENCY_PRIORITY" ? 0.95 : 0.55} />}
            {status === "EMERGENCY_PRIORITY" && NODE_POSITIONS[item.intersectionId] && (
              <mesh position={[NODE_POSITIONS[item.intersectionId][0], 0.22, NODE_POSITIONS[item.intersectionId][2]]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[5.2, 5.65, 48]} />
                <meshBasicMaterial color={STATUS_COLORS[status]} transparent opacity={0.72} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
