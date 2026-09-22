import {
  ROAD_CONNECTIONS,
  ROAD_NODES,
} from "../simulation/roadNetwork";

function RoadSegment({ connection }) {
  const from =
    ROAD_NODES[connection.from].position;

  const to =
    ROAD_NODES[connection.to].position;

  const dx = to[0] - from[0];
  const dz = to[2] - from[2];

  const length =
    Math.sqrt(dx * dx + dz * dz);

  const centerX =
    (from[0] + to[0]) / 2;

  const centerZ =
    (from[2] + to[2]) / 2;

  const isHorizontal =
    Math.abs(dx) > Math.abs(dz);

  return (
    <group>
      <mesh
        position={[
          centerX,
          -0.05,
          centerZ,
        ]}
        rotation={[
          0,
          isHorizontal
            ? 0
            : Math.PI / 2,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            length,
            0.1,
            7,
          ]}
        />

        <meshStandardMaterial
          color="#252a31"
        />
      </mesh>

      {/* Center road marking */}

      <mesh
        position={[
          centerX,
          0.02,
          centerZ,
        ]}
        rotation={[
          0,
          isHorizontal
            ? 0
            : Math.PI / 2,
          0,
        ]}
      >
        <boxGeometry
          args={[
            length,
            0.025,
            0.12,
          ]}
        />

        <meshBasicMaterial
          color="#d9d9d9"
        />
      </mesh>
    </group>
  );
}

function IntersectionPad({
  position,
}) {
  return (
    <mesh
      position={[
        position[0],
        -0.02,
        position[2],
      ]}
      receiveShadow
    >
      <boxGeometry
        args={[
          8,
          0.08,
          8,
        ]}
      />

      <meshStandardMaterial
        color="#1d2127"
      />
    </mesh>
  );
}

export default function RoadGrid() {
  return (
    <group>
      {ROAD_CONNECTIONS.map(
        (connection) => (
          <RoadSegment
            key={connection.id}
            connection={connection}
          />
        )
      )}

      {Object.values(ROAD_NODES).map(
        (node) => (
          <IntersectionPad
            key={node.id}
            position={node.position}
          />
        )
      )}
    </group>
  );
}