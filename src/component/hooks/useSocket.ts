import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  StrokeData,
} from "../socket-types";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketOptions {
  roomId: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  saveToHistory: () => void;
}

export function useSocket({ roomId, canvasRef, saveToHistory }: UseSocketOptions) {
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const remoteDrawingRef = useRef(false);

  // Connect and join room
  useEffect(() => {
    if (!roomId) return;

    const serverUrl = import.meta.env.VITE_SOCKET_URL || "/";
    const socket: TypedSocket = io(serverUrl, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-room", { roomId });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setUserCount(0);
    });

    socket.on("room-joined", (data) => {
      setUserCount(data.userCount);
    });

    // Receive remote strokes
    socket.on("stroke-start", (data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      remoteDrawingRef.current = true;
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    });

    socket.on("stroke-move", (data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineWidth = data.brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = data.tool === "eraser" ? "#ffffff" : data.color;
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    });

    socket.on("stroke-end", () => {
      if (remoteDrawingRef.current) {
        remoteDrawingRef.current = false;
        saveToHistory();
      }
    });

    socket.on("clear-canvas", () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    });

    // Existing user: respond to canvas state request
    socket.on("request-canvas-state", ({ requesterSocketId }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL();
      socket.emit("canvas-state-response", {
        targetSocketId: requesterSocketId,
        dataUrl,
      });
    });

    // New user: receive canvas state
    socket.on("canvas-state", ({ dataUrl }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.src = dataUrl;
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setUserCount(0);
    };
  }, [roomId, canvasRef, saveToHistory]);

  // Emit callbacks for local drawing
  const emitStrokeStart = useCallback((data: StrokeData) => {
    socketRef.current?.emit("stroke-start", data);
  }, []);

  const emitStrokeMove = useCallback((data: StrokeData) => {
    socketRef.current?.emit("stroke-move", data);
  }, []);

  const emitStrokeEnd = useCallback(() => {
    socketRef.current?.emit("stroke-end");
  }, []);

  const emitClearCanvas = useCallback(() => {
    socketRef.current?.emit("clear-canvas");
  }, []);

  return {
    isConnected,
    userCount,
    emitStrokeStart,
    emitStrokeMove,
    emitStrokeEnd,
    emitClearCanvas,
  };
}
