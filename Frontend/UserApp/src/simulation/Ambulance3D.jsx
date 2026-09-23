import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { getEntityPosition, getHeading } from "./worldMapping";

export default function Ambulance3D({ ambulance }) {
  const groupRef = useRef(null);
  const target = getEntityPosition(ambulance);
  const heading = getHeading(ambulance);
  const targetRef = useRef(target);
  const headingRef = useRef(heading);

  useEffect(() => {
    targetRef.current = target;
    headingRef.current = heading;
  }, [target, heading]);

  useFrame((_, delta) => {
    if (!groupRef.current || !targetRef.current) return;
    const blend = Math.min(1, delta * 5);
    groupRef.current.position.lerp({ x: targetRef.current[0], y: targetRef.current[1] + 0.25, z: targetRef.current[2] }, blend);
    groupRef.current.rotation.y += (headingRef.current - groupRef.current.rotation.y) * blend;
  });

  if (!target) return null;

  return (
    <group ref={groupRef}>
      <mesh castShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[1.9, 1.15, 3.4]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.42} metalness={0.15} />
      </mesh>
      <mesh position={[0, 1.12, 0.25]}>
        <boxGeometry args={[1.45, 0.68, 1.45]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.35} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[1.96, 0.22, 3.45]} />
        <meshStandardMaterial color="#dc2626" emissive="#7f1d1d" emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[0.72, 0.18, 0.28]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[-0.42, 1.75, 0]}>
        <boxGeometry args={[0.2, 0.17, 0.25]} />
        <meshStandardMaterial color="#60a5fa" emissive="#2563eb" emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[0.42, 1.75, 0]}>
        <boxGeometry args={[0.2, 0.17, 0.25]} />
        <meshStandardMaterial color="#f87171" emissive="#dc2626" emissiveIntensity={2.2} />
      </mesh>
      <Text position={[0, 1.83, 0]} rotation={[0, 0, 0]} fontSize={0.24} color="#991b1b" anchorX="center" anchorY="middle">
        {ambulance?.id || "AMBULANCE"}
      </Text>
      <pointLight color="#ef4444" intensity={1.8} distance={5} position={[0, 1.5, 0]} />
    </group>
  );
}
