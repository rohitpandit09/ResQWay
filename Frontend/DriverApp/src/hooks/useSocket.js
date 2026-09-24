// src/hooks/useSocket.js
// Manages the Socket.IO connection to the ResQWay backend.
// Subscribes to simulation snapshots and emergency lifecycle events.
// The backend is the SINGLE SOURCE OF TRUTH — this hook only receives data.

import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { BACKEND_URL, SOCKET_EVENTS } from "../constants.js";

// ==================================================
// CONNECTION STATES
// ==================================================

export const CONNECTION_STATE = {
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  ERROR: "ERROR",
};

// ==================================================
// USE SOCKET
// ==================================================

export function useSocket({ onEmergencyCreated, onEmergencyUpdated } = {}) {
  const socketRef = useRef(null);

  const [connectionState, setConnectionState] = useState(
    CONNECTION_STATE.CONNECTING
  );
  const [snapshot, setSnapshot] = useState(null);
  const [lastError, setLastError] = useState(null);

  // Keep callbacks in refs so the effect closure is stable
  const onEmergencyCreatedRef = useRef(onEmergencyCreated);
  const onEmergencyUpdatedRef = useRef(onEmergencyUpdated);

  useEffect(() => {
    onEmergencyCreatedRef.current = onEmergencyCreated;
  }, [onEmergencyCreated]);

  useEffect(() => {
    onEmergencyUpdatedRef.current = onEmergencyUpdated;
  }, [onEmergencyUpdated]);

  // --------------------------------------------------
  // CONNECT
  // --------------------------------------------------

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // --------------------------------------------------
    // CONNECTION EVENTS
    // --------------------------------------------------

    socket.on("connect", () => {
      setConnectionState(CONNECTION_STATE.CONNECTED);
      setLastError(null);
      // Request the current snapshot immediately on (re)connect
      socket.emit(SOCKET_EVENTS.REQUEST_SNAPSHOT);
    });

    socket.on("disconnect", (reason) => {
      setConnectionState(CONNECTION_STATE.DISCONNECTED);
      console.warn("[useSocket] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      setConnectionState(CONNECTION_STATE.ERROR);
      setLastError(err.message);
      console.error("[useSocket] Connection error:", err.message);
    });

    socket.on("reconnect_attempt", () => {
      setConnectionState(CONNECTION_STATE.CONNECTING);
    });

    // --------------------------------------------------
    // SIMULATION SNAPSHOT
    // Backend broadcasts this every 1 second via setInterval
    // and also on connect.
    // Shape: { simulationTime, tickCount, status, ambulance,
    //          signals, eta, greenCorridor, signalControl }
    // --------------------------------------------------

    socket.on(SOCKET_EVENTS.SNAPSHOT, (data) => {
      setSnapshot(data);
    });

    // --------------------------------------------------
    // EMERGENCY EVENTS
    // Backend emits these when emergency lifecycle changes.
    // --------------------------------------------------

    socket.on(SOCKET_EVENTS.EMERGENCY_CREATED, (emergency) => {
      if (typeof onEmergencyCreatedRef.current === "function") {
        onEmergencyCreatedRef.current(emergency);
      }
    });

    socket.on(SOCKET_EVENTS.EMERGENCY_UPDATED, (emergency) => {
      if (typeof onEmergencyUpdatedRef.current === "function") {
        onEmergencyUpdatedRef.current(emergency);
      }
    });

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // runs once — socket lifecycle is independent

  // --------------------------------------------------
  // REQUEST SNAPSHOT MANUALLY
  // --------------------------------------------------

  const requestSnapshot = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SOCKET_EVENTS.REQUEST_SNAPSHOT);
    }
  }, []);

  return {
    connectionState,
    snapshot,
    lastError,
    requestSnapshot,
    isConnected: connectionState === CONNECTION_STATE.CONNECTED,
  };
}
