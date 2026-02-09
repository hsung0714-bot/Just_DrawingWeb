import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5174"];

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

// Track rooms: roomId -> Set<socketId>
const rooms = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  console.log(`[connect] ${socket.id}`);
  let currentRoom: string | null = null;

  socket.on("join-room", ({ roomId }) => {
    // Leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      const members = rooms.get(currentRoom);
      if (members) {
        members.delete(socket.id);
        if (members.size === 0) rooms.delete(currentRoom);
      }
    }

    currentRoom = roomId;
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    const members = rooms.get(roomId)!;
    const isFirstUser = members.size === 0;
    members.add(socket.id);

    console.log(`[join-room] ${socket.id} → ${roomId} (${members.size} users)`);

    // Notify the joiner
    socket.emit("room-joined", { roomId, userCount: members.size });

    // If not the first user, request canvas state from an existing member
    if (!isFirstUser) {
      const existingMember = [...members].find((id) => id !== socket.id);
      if (existingMember) {
        io.to(existingMember).emit("request-canvas-state", {
          requesterSocketId: socket.id,
        });
      }
    }

    // Notify others about updated user count
    socket.to(roomId).emit("room-joined", { roomId, userCount: members.size });
  });

  // Relay stroke events
  socket.on("stroke-start", (data) => {
    if (currentRoom) socket.to(currentRoom).emit("stroke-start", data);
  });

  socket.on("stroke-move", (data) => {
    if (currentRoom) socket.to(currentRoom).emit("stroke-move", data);
  });

  socket.on("stroke-end", () => {
    if (currentRoom) socket.to(currentRoom).emit("stroke-end");
  });

  socket.on("clear-canvas", () => {
    if (currentRoom) socket.to(currentRoom).emit("clear-canvas");
  });

  // Canvas state sync for new users
  socket.on("canvas-state-response", ({ targetSocketId, dataUrl }) => {
    io.to(targetSocketId).emit("canvas-state", { dataUrl });
  });

  socket.on("disconnect", () => {
    console.log(`[disconnect] ${socket.id}`);
    if (currentRoom) {
      const members = rooms.get(currentRoom);
      if (members) {
        members.delete(socket.id);
        if (members.size === 0) {
          rooms.delete(currentRoom);
        } else {
          // Notify remaining members about updated user count
          io.to(currentRoom).emit("room-joined", {
            roomId: currentRoom,
            userCount: members.size,
          });
        }
      }
    }
  });
});

const PORT = Number(process.env.PORT) || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
