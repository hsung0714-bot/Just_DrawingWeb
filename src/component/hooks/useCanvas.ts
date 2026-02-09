import { useEffect, useRef } from "react";
import type { Tool } from "../types";
import type { StrokeData } from "../socket-types";

interface SocketCallbacks {
  onStrokeStart?: (data: StrokeData) => void;
  onStrokeMove?: (data: StrokeData) => void;
  onStrokeEnd?: () => void;
}

export function useCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  color: string,
  brushSize: number,
  tool: Tool,
  saveToHistory: () => void,
  socketCallbacks?: SocketCallbacks,
) {
  const isDrawing = useRef(false);

  // Canvas initialization
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = 900;
    canvas.height = 600;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    saveToHistory();
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mouse drawing events
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const startDrawing = (e: MouseEvent) => {
      isDrawing.current = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      socketCallbacks?.onStrokeStart?.({ x, y, color, brushSize, tool });
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing.current) return;
      const { x, y } = getPos(e);
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineTo(x, y);
      ctx.stroke();
      socketCallbacks?.onStrokeMove?.({ x, y, color, brushSize, tool });
    };

    const stopDrawing = () => {
      if (isDrawing.current) {
        isDrawing.current = false;
        saveToHistory();
        socketCallbacks?.onStrokeEnd?.();
      }
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
    };
  }, [canvasRef, color, brushSize, tool, saveToHistory, socketCallbacks]);
}
