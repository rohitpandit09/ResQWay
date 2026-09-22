import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

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

io.on(
  "connection",
  (socket) => {
    console.log(
      "Client connected:",
      socket.id
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          "Client disconnected:",
          socket.id
        );
      }
    );
  }
);

const PORT = 5000;

server.listen(
  PORT,
  () => {
    console.log(
      `ResQWay backend running on http://localhost:${PORT}`
    );
  }
);