import { Text } from "@react-three/drei";
import { useMemo } from "react";

function getSignalColor(phase) {
  const value = String(phase || "").toUpperCase();
  if (value.includes("GREEN")) return "#34d399";
  if (value.includes("YELLOW")) return "#fbbf24";
  return "#f87171";
}

export default function TrafficSignal3D({ signal, position, priorityStatus }) {
  const activeColor = getSignalColor(signal?.phase);
  const isPriority = priorityStatus === "EMERGENCY_PRIORITY";
  const isPrepare = priorityStatus === "PREPARE";
  const haloColor = isPriority ? "#34d399" : isPrepare ? "#fbbf24" : "#475569";
  const lights = useMemo(() => ["#f87171", "#fbbf24", "#34d399"], []);

  return (
    <group position={[position[0] + 5.2, 0, position[2] + 4.8]}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 5, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 4.75, 0]}>
        <boxGeometry args={[0.65, 1.85, 0.5]} />
        <meshStandardMaterial color="#020617" emissive={haloColor} emissiveIntensity={isPriority ? 0.32 : 0.08} />
      </mesh>
      {lights.map((color, index) => {
        const isActive = color === activeColor;
        return (
          <mesh key={color} position={[0, 5.32 - index * 0.58, 0.27]}>
            <sphereGeometry args={[0.17, 12, 12]} />
            <meshStandardMaterial color={isActive ? color : "#1e293b"} emissive={isActive ? color : "#000000"} emissiveIntensity={isActive ? 2.4 : 0} />
          </mesh>
        );
      })}
      {isPriority && (
        <Text position={[0, 6.2, 0]} fontSize={0.46} color="#6ee7b7" anchorX="center" anchorY="middle">
          PRIORITY
        </Text>
      )}
      <Text position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.35} color="#cbd5e1" anchorX="center" anchorY="middle">
        {signal?.remainingSeconds != null ? `${Math.round(Number(signal.remainingSeconds))}s` : "--"}
      </Text>
    </group>
  );
}
