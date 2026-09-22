import {
  ROAD_X_POSITIONS,
  ROAD_Z_POSITIONS,
} from "../simulation/roadNetwork";

function Building({
  position,
  size,
}) {
  return (
    <mesh
      position={position}
      castShadow
      receiveShadow
    >
      <boxGeometry
        args={size}
      />

      <meshStandardMaterial
        color="#58616d"
      />
    </mesh>
  );
}

function createBuildings() {
  const buildings = [];

  for (
    let row = 0;
    row < 3;
    row++
  ) {
    for (
      let col = 0;
      col < 3;
      col++
    ) {
      const x1 =
        ROAD_X_POSITIONS[col];

      const x2 =
        ROAD_X_POSITIONS[col + 1];

      const z1 =
        ROAD_Z_POSITIONS[row];

      const z2 =
        ROAD_Z_POSITIONS[row + 1];

      const blockWidth =
        Math.abs(x2 - x1);

      const blockDepth =
        Math.abs(z2 - z1);

      const centerX =
        (x1 + x2) / 2;

      const centerZ =
        (z1 + z2) / 2;

      const buildingWidth =
        Math.min(
          blockWidth * 0.42,
          11
        );

      const buildingDepth =
        Math.min(
          blockDepth * 0.42,
          11
        );

      const height =
        7 +
        ((row + col) % 3) *
          4;

      buildings.push({
        position: [
          centerX,
          height / 2,
          centerZ,
        ],

        size: [
          buildingWidth,
          height,
          buildingDepth,
        ],
      });
    }
  }

  return buildings;
}

const BUILDINGS =
  createBuildings();

export default function BuildingGrid() {
  return (
    <group>
      {BUILDINGS.map(
        (building, index) => (
          <Building
            key={index}
            position={
              building.position
            }
            size={
              building.size
            }
          />
        )
      )}
    </group>
  );
}