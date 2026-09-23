import { useEffect, useRef, useState } from "react";

import { createSocket } from "../services/socket";

export function useSimulationSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [status, setStatus] = useState(null);

  const requestSnapshot = () => {
    if (socketRef.current) {
      socketRef.current.emit("simulation:requestSnapshot");
    }
  };

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      requestSnapshot();
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("simulation:snapshot", (payload) => {
      setSnapshot(payload || null);
    });

    socket.on("simulation:status", (payload) => {
      setStatus(payload || null);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return {
    connected,
    snapshot,
    status,
    requestSnapshot,
  };
}
