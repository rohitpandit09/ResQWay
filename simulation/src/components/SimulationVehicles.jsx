import Vehicle from "./Vehicle";
import Ambulance from "./Ambulance";

import {
  ROAD_NODES,
} from "../simulation/roadNetwork";

function getVehicleRotation(
  vehicle,
  roadNodes
) {
  if (!vehicle.nextNode) {
    return 0;
  }

  const current =
    roadNodes[vehicle.currentNode];

  const next =
    roadNodes[vehicle.nextNode];

  if (!current || !next) {
    return 0;
  }

  const dx =
    next.position[0] -
    current.position[0];

  const dz =
    next.position[2] -
    current.position[2];

  return Math.atan2(dz, dx);
}

export default function SimulationVehicles({
  simulation,
}) {
  return (
    <group>
      {/* Ambulance */}
      <Ambulance
        position={
          simulation.ambulance.position
        }
        state={
          simulation.ambulance.state
        }
      />

      {/* Normal traffic */}
      {simulation.traffic.map(
        (vehicle) => (
          <Vehicle
            key={vehicle.id}
            position={
              vehicle.position
            }
            rotation={getVehicleRotation(
              vehicle,
              ROAD_NODES
            )}
            color={
              vehicle.id.endsWith("01")
                ? "#d7d7d7"
                : vehicle.id.endsWith("02")
                ? "#4f82b8"
                : vehicle.id.endsWith("03")
                ? "#d6ad35"
                : vehicle.id.endsWith("04")
                ? "#b24a4a"
                : "#9c9c9c"
            }
          />
        )
      )}
    </group>
  );
}