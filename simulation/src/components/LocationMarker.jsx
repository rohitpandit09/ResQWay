export default function LocationMarker({
  position,
  color,
  label,
  type,
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.15, 32]} />

        <meshBasicMaterial color={color} />
      </mesh>

      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.55, 20, 20]} />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh position={[0, 2.3, 0]}>
        <boxGeometry args={[0.12, 2, 0.12]} />

        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh
        position={[0, 3.2, 0]}
        rotation={[0, Math.PI / 4, 0]}
      >
        <boxGeometry args={[1.1, 0.55, 0.05]} />

        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}