import { Html } from "@react-three/drei";

export default function Ambulance({
  position,
  state,
}) {
  return (
    <group position={position}>
      {/* Main body */}

      <mesh
        position={[0, 0.65, 0]}
        castShadow
      >
        <boxGeometry
          args={[
            2.8,
            1.25,
            1.2,
          ]}
        />

        <meshStandardMaterial
          color="#f4f4f4"
        />
      </mesh>

      {/* Red stripe */}

      <mesh
        position={[
          0,
          0.72,
          0.61,
        ]}
      >
        <boxGeometry
          args={[
            2.85,
            0.18,
            0.04,
          ]}
        />

        <meshBasicMaterial
          color="#e33131"
        />
      </mesh>

      {/* Cabin */}

      <mesh
        position={[
          0.55,
          1.35,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            1.35,
            0.65,
            1.05,
          ]}
        />

        <meshStandardMaterial
          color="#dfe7ee"
        />
      </mesh>

      {/* Blue windshield */}

      <mesh
        position={[
          1.24,
          1.35,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.03,
            0.45,
            0.85,
          ]}
        />

        <meshStandardMaterial
          color="#5d90b8"
        />
      </mesh>

      {/* Wheels */}

      {[
        [-0.85, 0.25, 0.65],
        [0.85, 0.25, 0.65],
        [-0.85, 0.25, -0.65],
        [0.85, 0.25, -0.65],
      ].map(
        ([x, y, z], index) => (
          <mesh
            key={index}
            position={[x, y, z]}
            rotation={[
              Math.PI / 2,
              0,
              0,
            ]}
          >
            <cylinderGeometry
              args={[
                0.25,
                0.25,
                0.18,
                16,
              ]}
            />

            <meshStandardMaterial
              color="#101010"
            />
          </mesh>
        )
      )}

      {/* Emergency light bar */}

      <mesh
        position={[
          0,
          1.75,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.9,
            0.14,
            0.28,
          ]}
        />

        <meshStandardMaterial
          color="#202020"
        />
      </mesh>

      <mesh
        position={[
          -0.22,
          1.76,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.28,
            0.12,
            0.2,
          ]}
        />

        <meshStandardMaterial
          color="#2196ff"
          emissive="#2196ff"
          emissiveIntensity={2}
        />
      </mesh>

      <mesh
        position={[
          0.22,
          1.76,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.28,
            0.12,
            0.2,
          ]}
        />

        <meshStandardMaterial
          color="#ff3030"
          emissive="#ff3030"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Status label */}

      <Html
        position={[
          0,
          2.5,
          0,
        ]}
        center
        distanceFactor={20}
      >
        <div
          style={{
            padding: "5px 8px",
            borderRadius: "7px",
            background:
              "rgba(4, 10, 18, 0.9)",
            border:
              "1px solid rgba(255,255,255,0.1)",
            color: "#ffffff",
            fontSize: "9px",
            fontWeight: "700",
            whiteSpace: "nowrap",
          }}
        >
          🚑 AMBULANCE_01
          <br />
          <span
            style={{
              color:
                state === "PICKUP"
                  ? "#ffc13b"
                  : state === "COMPLETED"
                  ? "#35e06f"
                  : "#ff4747",
            }}
          >
            {state}
          </span>
        </div>
      </Html>
    </group>
  );
}