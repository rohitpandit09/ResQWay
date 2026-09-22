import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import "dotenv/config";

import emergencyRoutes from "./src/emergency/emergencyRoutes.js";
import groqRoutes from "./src/ai/groqRoutes.js";
import {
  registerSimulationSocket,
} from "./src/sockets/simulationSocket.js";

const app = express();


// ==================================================
// HTTP SERVER
// ==================================================

const server = http.createServer(app);


// ==================================================
// SOCKET.IO
// ==================================================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE"],
  },
});


// ==================================================
// CORS
// ==================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);


// ==================================================
// BODY PARSER
// ==================================================

app.use(express.json());


// ==================================================
// API ROUTES
// ==================================================

app.use(
  "/api/emergencies",
  emergencyRoutes
);

app.use(
  "/api/groq",
  groqRoutes
);


// ==================================================
// HEALTH CHECK
// ==================================================

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message: "ResQWay backend is running",
    });
  }
);


// ==================================================
// SOCKET REGISTRATION
// ==================================================

registerSimulationSocket(io);


// ==================================================
// START SERVER
// ==================================================

const PORT = 3000;

server.listen(
  PORT,
  () => {
    console.log(
      `ResQWay backend running on http://localhost:${PORT}`
    );
  }
);