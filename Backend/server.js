import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import emergencyRoutes from "./src/emergency/emergencyRoutes.js";
import {registerSimulationSocket,} from "./src/sockets/simulationSocket.js";

const app = express();




const server = http.createServer(app);

const io = new Server(
  server,
  {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  }
);

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(
  express.json()
);

app.use("/api/emergencies",emergencyRoutes);


app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message:
        "ResQWay backend is running",
    });
  }
);

registerSimulationSocket(io);

const PORT = 3000;

server.listen(
  PORT,
  () => {
    console.log(
      `ResQWay backend running on http://localhost:${PORT}`
    );
  }
);