import type { Tool } from "./types";

export interface StrokeData {
  x: number;
  y: number;
  color: string;
  brushSize: number;
  tool: Tool;
}

export interface RoomJoinedData {
  roomId: string;
  userCount: number;
}

export interface CanvasStateResponseData {
  targetSocketId: string;
  dataUrl: string;
}

export interface CanvasStateData {
  dataUrl: string;
}

export interface RequestCanvasStateData {
  requesterSocketId: string;
}

// Client → Server events
export interface ClientToServerEvents {
  "join-room": (data: { roomId: string }) => void;
  "stroke-start": (data: StrokeData) => void;
  "stroke-move": (data: StrokeData) => void;
  "stroke-end": () => void;
  "clear-canvas": () => void;
  "canvas-state-response": (data: CanvasStateResponseData) => void;
}

// Server → Client events
export interface ServerToClientEvents {
  "room-joined": (data: RoomJoinedData) => void;
  "stroke-start": (data: StrokeData) => void;
  "stroke-move": (data: StrokeData) => void;
  "stroke-end": () => void;
  "clear-canvas": () => void;
  "request-canvas-state": (data: RequestCanvasStateData) => void;
  "canvas-state": (data: CanvasStateData) => void;
}
