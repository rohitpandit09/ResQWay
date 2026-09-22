import { Canvas } from "@react-three/fiber";

import CityScene from "./components/CityScene";

import useSimulation from "./simulation/useSimulation";

export default function App() {
  const {
    simulation,
    telemetry,
  } = useSimulation();

  const ambulance =
    telemetry?.ambulance;

  const client =
    telemetry?.client;

  const hospital =
    telemetry?.hospital;

  return (
    <div className="app">

      {/* ================================= */}
      {/* TOP BAR                           */}
      {/* ================================= */}

      <div className="topBar">

        <div>
          <div className="brand">
            RESQWAY
          </div>

          <div className="subtitle">
            Smart Ambulance Emergency Response
          </div>
        </div>

        <div className="status">
          PHASE 4 • LIVE TELEMETRY
        </div>

      </div>

      {/* ================================= */}
      {/* 3D SIMULATION                     */}
      {/* ================================= */}

      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{
          position: [
            55,
            55,
            55,
          ],
          fov: 45,
        }}
      >
        <CityScene
          simulation={simulation}
        />
      </Canvas>

      {/* ================================= */}
      {/* TELEMETRY                         */}
      {/* ================================= */}

      {telemetry &&
        ambulance &&
        client &&
        hospital && (
          <div className="telemetryPanel">

            <div className="telemetryTitle">
              EMERGENCY SESSION
            </div>

            <div className="telemetryState">
              {telemetry.journeyStatus}
            </div>

            {/* ============================= */}
            {/* AMBULANCE INFO                 */}
            {/* ============================= */}

            <div className="telemetryGrid">

              <div>
                <span>
                  AMBULANCE
                </span>

                <strong>
                  {ambulance.id}
                </strong>
              </div>

              <div>
                <span>
                  SPEED
                </span>

                <strong>
                  {ambulance.speed.toFixed(
                    1
                  )}{" "}
                  u/s
                </strong>
              </div>

              <div>
                <span>
                  CURRENT
                </span>

                <strong>
                  {ambulance.currentNode}
                </strong>
              </div>

              <div>
                <span>
                  NEXT
                </span>

                <strong>
                  {ambulance.nextNode ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  SIGNAL DELAY
                </span>

                <strong>
                  {ambulance.signalWaitSeconds.toFixed(
                    1
                  )}{" "}
                  sec
                </strong>
              </div>

              <div>
                <span>
                  SIGNAL
                </span>

                <strong>
                  {ambulance.signalState ||
                    "CLEAR"}
                </strong>
              </div>

            </div>

            {/* ============================= */}
            {/* CLIENT                         */}
            {/* ============================= */}

            <div className="routeSection">

              <div className="routeTitle">
                CLIENT
              </div>

              <div className="routeValue">
                Distance:{" "}
                {client.distance !== null
                  ? `${client.distance.toFixed(
                      1
                    )} units`
                  : "-"}
              </div>

              <div className="routeValue">
                ETA:{" "}
                {client.etaSeconds !== null
                  ? `${Math.ceil(
                      client.etaSeconds
                    )} sec`
                  : "-"}
              </div>

            </div>

            {/* ============================= */}
            {/* HOSPITAL                       */}
            {/* ============================= */}

            <div className="routeSection">

              <div className="routeTitle">
                HOSPITAL
              </div>

              <div className="routeValue">
                Distance:{" "}
                {hospital.distance !== null
                  ? `${hospital.distance.toFixed(
                      1
                    )} units`
                  : "-"}
              </div>

              <div className="routeValue">
                ETA:{" "}
                {hospital.etaSeconds !== null
                  ? `${Math.ceil(
                      hospital.etaSeconds
                    )} sec`
                  : "-"}
              </div>

            </div>

            {/* ============================= */}
            {/* WAITING AT SIGNAL              */}
            {/* ============================= */}

            {ambulance.waitingForSignal && (
              <div className="signalWarning">

                🚦 WAITING AT{" "}
                ATCS-
                {ambulance.waitingForSignal}

                <br />

                <span
                  style={{
                    fontSize:
                      "10px",
                    opacity:
                      0.8,
                  }}
                >
                  Delay:{" "}
                  {ambulance.signalWaitSeconds.toFixed(
                    1
                  )}{" "}
                  sec
                </span>

              </div>
            )}

            {/* ============================= */}
            {/* UPCOMING SIGNALS               */}
            {/* ============================= */}

            <div className="signalSection">

              <div className="routeTitle">
                UPCOMING ICCC / ATCS
              </div>

              {telemetry.upcomingSignals
                .slice(0, 3)
                .map((signal) => (
                  <div
                    className="signalRow"
                    key={
                      signal.signalId
                    }
                  >

                    <span>
                      {signal.signalId}
                    </span>

                    <span>
                      {signal.distance.toFixed(
                        0
                      )}
                      m
                    </span>

                    <span>
                      {signal.etaSeconds !==
                      null
                        ? `${Math.ceil(
                            signal.etaSeconds
                          )} sec`
                        : "-"}
                    </span>

                  </div>
                ))}

            </div>

          </div>
        )}

    </div>
  );
}