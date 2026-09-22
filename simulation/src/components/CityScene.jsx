import {
  OrbitControls,
  Sky,
  Line,
} from "@react-three/drei";
import SimulationVehicles from "./SimulationVehicles";
import {
  getSignalSnapshot,
} from "../simulation/signalEngine";

import RoadGrid from "./RoadGrid";
import BuildingGrid from "./BuildingGrid";
import TrafficSignal from "./TrafficSignal";
import LocationMarker from "./LocationMarker";

import {
  ROAD_NODES,
  getRoutePoints,
} from "../simulation/roadNetwork";

import {
  SIMULATION_CONFIG,
} from "../simulation/simulationConfig";

function Ground() {
  return (
    <mesh
      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
      receiveShadow
    >
      <planeGeometry
        args={[
          140,
          140,
        ]}
      />

      <meshStandardMaterial
        color="#111a15"
      />
    </mesh>
  );
}

function SignalNetwork({
  simulationTime,
}) {
  return (
    <group>
      {Object.values(
        ROAD_NODES
      ).map((node) => {
        const signal =
          getSignalSnapshot(
            node.id,
            simulationTime
          );

        if (!signal) {
          return null;
        }

        return (
          <TrafficSignal
            key={node.signal.id}
            position={node.position}
            signalId={
              signal.signalId
            }
            controller={
              signal.controller
            }
            horizontalState={
              signal.horizontalState
            }
            verticalState={
              signal.verticalState
            }
            phase={signal.phase}
            remainingPhaseSeconds={
              signal.remainingPhaseSeconds
            }
          />
        );
      })}
    </group>
  );
}

function EmergencyRoute() {
  const points =
    getRoutePoints(
      SIMULATION_CONFIG.route.full
    );

  return (
    <Line
      points={points.map(
        ([x, y, z]) => [
          x,
          y + 0.15,
          z,
        ]
      )}
      color="#168cff"
      lineWidth={2}
    />
  );
}

export default function CityScene({
    simulation
}) {
    
  return (
    <>
      <color
        attach="background"
        args={[
          "#07111c",
        ]}
      />

      <fog
        attach="fog"
        args={[
          "#07111c",
          70,
          150,
        ]}
      />

      <Sky
        sunPosition={[
          50,
          40,
          20,
        ]}
        turbidity={4}
        rayleigh={1}
      />

      <ambientLight
        intensity={1.2}
      />

      <directionalLight
        position={[
          30,
          50,
          20,
        ]}
        intensity={2}
        castShadow
        shadow-mapSize-width={
          1024
        }
        shadow-mapSize-height={
          1024
        }
      />

      <Ground />

      <RoadGrid />

      <BuildingGrid />
      <SimulationVehicles
        simulation={simulation}
      />

      <SignalNetwork
        simulationTime={
            simulation.elapsedTime
        }
      />

      {/* Planned emergency route */}

      <EmergencyRoute />

      {/* Client */}

      <LocationMarker
        position={
          SIMULATION_CONFIG.client
            .position
        }
        color="#ff304d"
        label={
          SIMULATION_CONFIG.client
            .label
        }
        type="CLIENT"
      />

      {/* Hospital */}

      <LocationMarker
        position={
          SIMULATION_CONFIG.hospital
            .position
        }
        color="#35e06f"
        label={
          SIMULATION_CONFIG.hospital
            .label
        }
        type="HOSPITAL"
      />

      <OrbitControls
        makeDefault
        maxPolarAngle={
          Math.PI / 2.15
        }
        minDistance={15}
        maxDistance={120}
      />
    </>
  );
}