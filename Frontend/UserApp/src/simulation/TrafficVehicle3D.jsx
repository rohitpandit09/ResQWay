import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { getEntityPosition, getHeading } from "./worldMapping";

const VEHICLE_COLORS = {
  CAR: "#dbeafe",
  BIKE: "#f8fafc",
  AUTO: "#fbbf24",
  BUS: "#a78bfa",
  TRUCK: "#38bdf8",
};

const VEHICLE_SIZES = {
  CAR: [1.35, 0.65, 2.3],
  BIKE: [0.55, 0.65, 1.6],
  AUTO: [1.05, 0.9, 1.8],
  BUS: [1.7, 1.15, 3.7],
  TRUCK: [1.75, 1.2, 3.8],
};

function SnapshotMotion({ objectRef, entity }) {
  const target = getEntityPosition(entity);
  const heading = getHeading(entity);
  const targetRef = useRef(target);
  const headingRef = useRef(heading);

  useEffect(() => {
    targetRef.current = target;
    headingRef.current = heading;
  }, [target, heading]);

  useFrame((_, delta) => {
    if (!objectRef.current || !targetRef.current) return;
    const blend = Math.min(1, delta * 6);
    objectRef.current.position.lerp({ x: targetRef.current[0], y: targetRef.current[1], z: targetRef.current[2] }, blend);
    objectRef.current.rotation.y += (headingRef.current - objectRef.current.rotation.y) * blend;
  });

  return null;
}

export default function TrafficVehicle3D({ vehicle }) {
  const groupRef = useRef(null);
  const type = String(vehicle?.type || "CAR").toUpperCase();
  const color = VEHICLE_COLORS[type] || VEHICLE_COLORS.CAR;
  const size = VEHICLE_SIZES[type] || VEHICLE_SIZES.CAR;
  const stopped = vehicle?.state === "STOPPED" || vehicle?.state === "WAITING";

  if (!getEntityPosition(vehicle)) return null;

  return (
    <group ref={groupRef}>
      <SnapshotMotion objectRef={groupRef} entity={vehicle} />
      <mesh castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.22} />
      </mesh>
      <mesh position={[0, size[1] * 0.63, 0]}>
        <boxGeometry args={[size[0] * 0.72, size[1] * 0.38, size[2] * 0.44]} />
        <meshStandardMaterial color={type === "BUS" ? "#312e81" : "#172033"} roughness={0.38} metalness={0.25} />
      </mesh>
      {stopped && <mesh position={[0, 0.02, -size[2] * 0.55]}>
        <boxGeometry args={[size[0] * 0.62, 0.04, 0.04]} />
        <meshBasicMaterial color="#fb7185" />
      </mesh>}
    </group>
  );
}
