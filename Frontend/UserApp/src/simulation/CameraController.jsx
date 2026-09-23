import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { getEntityPosition } from "./worldMapping";

export default function CameraController({ mode, ambulance, resetKey = 0 }) {
  const controlsRef = useRef(null);
  const { camera } = useThree();
  const target = getEntityPosition(ambulance);
  const targetRef = useRef(target);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    camera.position.set(42, 37, 46);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [camera, resetKey]);

  useFrame((_, delta) => {
    if (mode !== "FOLLOW" || !targetRef.current || !controlsRef.current) return;
    const blend = Math.min(1, delta * 2.5);
    const desiredTarget = { x: targetRef.current[0], y: 0, z: targetRef.current[2] };
    controlsRef.current.target.lerp(desiredTarget, blend);
    camera.position.lerp({ x: targetRef.current[0] + 18, y: 19, z: targetRef.current[2] + 18 }, blend);
    controlsRef.current.update();
  });

  return <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.08} minDistance={18} maxDistance={90} maxPolarAngle={Math.PI / 2.15} />;
}
