import { Text } from "@react-three/drei";
import { NODE_IDS, NODE_POSITIONS, ROAD_WIDTH } from "./worldMapping";

const BUILDINGS = [
  [-29, -7, 6, 12, 8],
  [-29, 7, 8, 8, 6],
  [-8, -24, 8, 9, 8],
  [7, -24, 6, 12, 7],
  [29, -7, 7, 10, 9],
  [29, 7, 8, 8, 7],
  [-8, 24, 7, 10, 6],
  [8, 24, 8, 8, 8],
];

function Building({ position, width, height, depth }) {
  return (
    <group position={[position[0], height / 2, position[1]]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#182230" roughness={0.82} metalness={0.12} />
      </mesh>
      <mesh position={[0, height * 0.52, depth / 2 + 0.02]}>
        <planeGeometry args={[width * 0.72, height * 0.2]} />
        <meshBasicMaterial color="#334155" />
      </mesh>
    </group>
  );
}

function StreetLight({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 4.4, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0.35, 4.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.7, 0.06, 0.06]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0.68, 4.25, 0]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshBasicMaterial color="#fef3c7" />
      </mesh>
    </group>
  );
}

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 2, 8]} />
        <meshStandardMaterial color="#6b4f36" />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshStandardMaterial color="#1e6b58" roughness={1} />
      </mesh>
    </group>
  );
}

export function RoadNetwork3D() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[92, 76]} />
        <meshStandardMaterial color="#0b111a" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[82, 68]} />
        <meshStandardMaterial color="#101923" roughness={0.92} />
      </mesh>

      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[12, 0.12, 68]} />
        <meshStandardMaterial color="#151f2c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[68, 0.12, 12]} />
        <meshStandardMaterial color="#151f2c" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[68, 0.12]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[68, 0.12]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>

      {NODE_IDS.map((nodeId) => {
        const [x, , z] = NODE_POSITIONS[nodeId];
        return (
          <group key={nodeId} position={[x, 0.1, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[ROAD_WIDTH + 6, ROAD_WIDTH + 6]} />
              <meshStandardMaterial color="#182433" roughness={0.96} />
            </mesh>
            <Text position={[0, 0.18, -5.2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.9} color="#94a3b8" anchorX="center" anchorY="middle">
              {nodeId}
            </Text>
          </group>
        );
      })}

      {Array.from({ length: 9 }, (_, index) => (
        <mesh key={`horizontal-mark-${index}`} position={[-30 + index * 7.5, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 0.12]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.55} />
        </mesh>
      ))}
      {Array.from({ length: 9 }, (_, index) => (
        <mesh key={`vertical-mark-${index}`} position={[0, 0.16, -30 + index * 7.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[3.2, 0.12]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

export default function CityEnvironment3D() {
  return (
    <group>
      <RoadNetwork3D />
      {BUILDINGS.map(([x, z, width, height, depth], index) => (
        <Building key={`building-${index}`} position={[x, z]} width={width} height={height} depth={depth} />
      ))}
      {[
        [-25, 0, -19], [-25, 0, 19], [25, 0, -19], [25, 0, 19],
        [-11, 0, -19], [11, 0, 19], [-11, 0, 19], [11, 0, -19],
      ].map((position, index) => <StreetLight key={`light-${index}`} position={position} />)}
      {[
        [-24, 0, -12], [-24, 0, 12], [24, 0, -12], [24, 0, 12],
        [-11, 0, -22], [11, 0, 22],
      ].map((position, index) => <Tree key={`tree-${index}`} position={position} />)}
    </group>
  );
}
