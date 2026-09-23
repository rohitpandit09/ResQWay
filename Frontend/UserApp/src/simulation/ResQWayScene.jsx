import { Canvas } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";
import Ambulance3D from "./Ambulance3D";
import CameraController from "./CameraController";
import CityEnvironment3D from "./CityEnvironment3D";
import GreenCorridor3D from "./GreenCorridor3D";
import TrafficSignal3D from "./TrafficSignal3D";
import TrafficVehicle3D from "./TrafficVehicle3D";
import { NODE_POSITIONS } from "./worldMapping";

function SimulationWorld({ snapshot, cameraMode, cameraResetKey }) {
  const signals = snapshot?.signals || [];
  const vehicles = snapshot?.vehicles || [];
  const corridorItems = snapshot?.greenCorridor?.intersections || [];
  const corridorLookup = Object.fromEntries(corridorItems.map((item) => [item.intersectionId, item]));

  return (
    <>
      <color attach="background" args={["#070b11"]} />
      <fog attach="fog" args={["#070b11", 52, 105]} />
      <ambientLight intensity={0.85} color="#b8c7db" />
      <hemisphereLight intensity={0.65} color="#bfdbfe" groundColor="#0b1220" />
      <directionalLight castShadow intensity={1.7} color="#f8fafc" position={[-22, 34, 18]} shadow-mapSize={[2048, 2048]} />

      <CityEnvironment3D />
      <GreenCorridor3D corridor={snapshot?.greenCorridor} />

      {signals.map((signal) => {
        const position = NODE_POSITIONS[signal?.intersectionId];
        if (!position) return null;
        return <TrafficSignal3D key={signal.intersectionId} signal={signal} position={position} priorityStatus={corridorLookup[signal.intersectionId]?.status} />;
      })}

      {vehicles.map((vehicle) => <TrafficVehicle3D key={vehicle?.id} vehicle={vehicle} />)}
      <Ambulance3D ambulance={snapshot?.ambulance} />
      <CameraController mode={cameraMode} ambulance={snapshot?.ambulance} resetKey={cameraResetKey} />
      <ContactShadows position={[0, 0.03, 0]} opacity={0.38} scale={78} blur={2.5} far={38} />
    </>
  );
}

export default function ResQWayScene({ snapshot, cameraMode = "OVERVIEW", cameraResetKey = 0 }) {
  return (
    <div className="relative h-120 overflow-hidden rounded-[28px] border border-white/10 bg-[#070b11] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] md:h-162.5">
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [42, 37, 46], fov: 42 }}>
        <PerspectiveCamera makeDefault position={[42, 37, 46]} fov={42} near={0.1} far={180} />
        <Suspense fallback={null}>
          <SimulationWorld snapshot={snapshot} cameraMode={cameraMode} cameraResetKey={cameraResetKey} />
        </Suspense>
      </Canvas>
      {!snapshot && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#070b11]/45">
          <div className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300 backdrop-blur">
            Waiting for backend snapshot
          </div>
        </div>
      )}
    </div>
  );
}
