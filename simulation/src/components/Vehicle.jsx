export default function Vehicle({
  position,
  color = "#d9d9d9",
  scale = [1.8, 0.7, 0.9],
  rotation = 0,
}) {
  return (
    <group
      position={position}
      rotation={[0, rotation, 0]}
    >
      {/* Main body */}
      <mesh
        position={[0, 0.45, 0]}
        castShadow
      >
        <boxGeometry args={scale} />

        <meshStandardMaterial
          color={color}
        />
      </mesh>

      {/* Cabin */}
      <mesh
        position={[0.25, 0.82, 0]}
        castShadow
      >
        <boxGeometry
          args={[0.8, 0.45, 0.75]}
        />

        <meshStandardMaterial
          color="#8ea4b8"
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Front windshield */}
      <mesh
        position={[0.68, 0.82, 0]}
      >
        <boxGeometry
          args={[0.04, 0.3, 0.72]}
        />

        <meshStandardMaterial
          color="#5f819b"
        />
      </mesh>

      {/* Wheels */}
      <mesh
        position={[-0.72, 0.18, 0.52]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[0.18, 0.18, 0.16, 16]}
        />

        <meshStandardMaterial
          color="#111111"
        />
      </mesh>

      <mesh
        position={[0.72, 0.18, 0.52]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[0.18, 0.18, 0.16, 16]}
        />

        <meshStandardMaterial
          color="#111111"
        />
      </mesh>

      <mesh
        position={[-0.72, 0.18, -0.52]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[0.18, 0.18, 0.16, 16]}
        />

        <meshStandardMaterial
          color="#111111"
        />
      </mesh>

      <mesh
        position={[0.72, 0.18, -0.52]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[0.18, 0.18, 0.16, 16]}
        />

        <meshStandardMaterial
          color="#111111"
        />
      </mesh>

      {/* Headlights */}
      <mesh
        position={[0.94, 0.45, 0.3]}
      >
        <boxGeometry
          args={[0.08, 0.12, 0.16]}
        />

        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh
        position={[0.94, 0.45, -0.3]}
      >
        <boxGeometry
          args={[0.08, 0.12, 0.16]}
        />

        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Tail lights */}
      <mesh
        position={[-0.94, 0.45, 0.3]}
      >
        <boxGeometry
          args={[0.08, 0.12, 0.16]}
        />

        <meshStandardMaterial
          color="#c62828"
          emissive="#c62828"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh
        position={[-0.94, 0.45, -0.3]}
      >
        <boxGeometry
          args={[0.08, 0.12, 0.16]}
        />

        <meshStandardMaterial
          color="#c62828"
          emissive="#c62828"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}