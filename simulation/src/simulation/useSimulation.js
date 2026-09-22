import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createInitialSimulation,
  updateSimulation,
} from "./simulationEngine";

import {
  buildTelemetry,
} from "./telemetryEngine";

const SIMULATION_SPEED = 0.5;

const TELEMETRY_UPDATE_INTERVAL = 500;

export default function useSimulation() {
  const [
    simulation,
    setSimulation,
  ] = useState(
    createInitialSimulation
  );

  const simulationRef =
    useRef(null);

  const [
    telemetry,
    setTelemetry,
  ] = useState(() =>
    buildTelemetry(
      createInitialSimulation()
    )
  );

  const lastTimeRef =
    useRef(null);

  const telemetryTimerRef =
    useRef(0);

  useEffect(() => {
    simulationRef.current =
      simulation;
  }, []);

  useEffect(() => {
    let animationFrame;

    function animate(time) {
      if (
        lastTimeRef.current === null
      ) {
        lastTimeRef.current =
          time;
      }

      const realDelta =
        (time -
          lastTimeRef.current) /
        1000;

      lastTimeRef.current =
        time;

      const deltaSeconds =
        Math.min(
          realDelta *
            SIMULATION_SPEED,
          0.05
        );

      telemetryTimerRef.current +=
        realDelta * 1000;

      setSimulation(
        (current) => {
          const next =
            updateSimulation(
              current,
              deltaSeconds
            );

          simulationRef.current =
            next;

          return next;
        }
      );

      if (
        telemetryTimerRef.current >=
        TELEMETRY_UPDATE_INTERVAL
      ) {
        telemetryTimerRef.current = 0;

        const current =
          simulationRef.current;

        if (current) {
          setTelemetry(
            buildTelemetry(
              current
            )
          );
        }
      }

      animationFrame =
        requestAnimationFrame(
          animate
        );
    }

    animationFrame =
      requestAnimationFrame(
        animate
      );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };
  }, []);

  return {
    simulation,
    telemetry,
  };
}