import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export function createSocket() {
  return io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
  });
}
