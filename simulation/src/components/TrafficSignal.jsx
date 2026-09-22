import { Html } from "@react-three/drei";

function Light({
  position,
  color,
  active,
}) {
  return (
    <mesh position={position}>
      <sphereGeometry
        args={[0.22, 16, 16]}
      />

      <meshStandardMaterial
        color={
          active
            ? color
            : "#181c20"
        }
        emissive={
          active
            ? color
            : "#000000"
        }
        emissiveIntensity={
          active ? 1.3 : 0
        }
      />
    </mesh>
  );
}

function SignalHead({
  position,
  state,
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry
          args={[
            0.7,
            1.8,
            0.45,
          ]}
        />

        <meshStandardMaterial
          color="#090b0e"
        />
      </mesh>

      <Light
        position={[
          0,
          0.55,
          0.25,
        ]}
        color="#ff3030"
        active={
          state === "RED"
        }
      />

      <Light
        position={[
          0,
          0,
          0.25,
        ]}
        color="#ffc13b"
        active={
          state === "YELLOW"
        }
      />

      <Light
        position={[
          0,
          -0.55,
          0.25,
        ]}
        color="#35e06f"
        active={
          state === "GREEN"
        }
      />
    </group>
  );
}

export default function TrafficSignal({
  position = [0, 0, 0],

  signalId = "ATCS-UNKNOWN",

  controller = "ICCC_ATCS",

  horizontalState = "RED",

  verticalState = "RED",

  phase = 0,

  remainingPhaseSeconds = 0,
}) {
  return (
    <group position={position}>
      {/* Horizontal movement signal */}

      <mesh
        position={[
          3.1,
          2,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            0.09,
            0.09,
            4,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#111111"
        />
      </mesh>

      <SignalHead
        position={[
          3.1,
          3.15,
          0,
        ]}
        state={
          horizontalState
        }
      />

      {/* Vertical movement signal */}

      <mesh
        position={[
          0,
          2,
          3.1,
        ]}
      >
        <cylinderGeometry
          args={[
            0.09,
            0.09,
            4,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#111111"
        />
      </mesh>

      <SignalHead
        position={[
          0,
          3.15,
          3.1,
        ]}
        state={
          verticalState
        }
      />

      {/* Label */}

      <Html
        position={[
          0,
          5,
          0,
        ]}
        center
        distanceFactor={22}
      >
        <div
          style={{
            padding:
              "5px 8px",

            borderRadius:
              "7px",

            background:
              "rgba(4, 10, 18, 0.9)",

            border:
              "1px solid rgba(255,255,255,0.12)",

            color:
              "#ffffff",

            fontSize:
              "9px",

            fontWeight:
              "700",

            whiteSpace:
              "nowrap",

            textAlign:
              "center",
          }}
        >
          {signalId}

          <br />

          <span
            style={{
              color:
                "#35e06f",
              fontSize:
                "8px",
            }}
          >
            {controller}
          </span>

          <br />

          <span
            style={{
              color:
                "#aeb9c7",
              fontSize:
                "8px",
            }}
          >
            PHASE {phase}
            {" • "}
            {remainingPhaseSeconds.toFixed(
              1
            )}
            s
          </span>
        </div>
      </Html>
    </group>
  );
}