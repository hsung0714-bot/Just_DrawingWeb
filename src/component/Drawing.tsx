import { useCallback, useMemo, useRef, useState } from "react";
import styles from "./Drawing.module.css";
import type { Tool } from "./types";
import { useHistory } from "./hooks/useHistory";
import { useCanvas } from "./hooks/useCanvas";
import { useKeyboard } from "./hooks/useKeyboard";
import { useSocket } from "./hooks/useSocket";
import Header from "./ui/Header";
import Toolbar from "./ui/Toolbar";
import RoomJoin from "./ui/RoomJoin";

const Drawing = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<Tool>("pen");
  const [roomId, setRoomId] = useState<string | null>(null);

  const { saveToHistory, undo, redo, historyIndex, historyLength } =
    useHistory(canvasRef);

  const { isConnected, userCount, emitStrokeStart, emitStrokeMove, emitStrokeEnd, emitClearCanvas } =
    useSocket({ roomId, canvasRef, saveToHistory });

  const socketCallbacks = useMemo(() => ({
    onStrokeStart: emitStrokeStart,
    onStrokeMove: emitStrokeMove,
    onStrokeEnd: emitStrokeEnd,
  }), [emitStrokeStart, emitStrokeMove, emitStrokeEnd]);

  useCanvas(canvasRef, color, brushSize, tool, saveToHistory, socketCallbacks);
  useKeyboard(undo, redo);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
    emitClearCanvas();
  }, [saveToHistory, emitClearCanvas]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current!;
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  if (!roomId) {
    return (
      <div className={styles.container}>
        <RoomJoin onJoin={setRoomId} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header
        onDownload={downloadCanvas}
        roomId={roomId}
        isConnected={isConnected}
        userCount={userCount}
      />
      <div className={styles.workspace}>
        <Toolbar
          tool={tool}
          color={color}
          brushSize={brushSize}
          historyIndex={historyIndex}
          historyLength={historyLength}
          onToolChange={setTool}
          onColorChange={setColor}
          onBrushSizeChange={setBrushSize}
          onUndo={undo}
          onRedo={redo}
          onClear={clearCanvas}
        />
        <main className={styles.canvasArea}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            style={{ cursor: tool === "eraser" ? "cell" : "url(/cursor-small.png) 16 16, crosshair" }}
          />
        </main>
      </div>
    </div>
  );
};

export default Drawing;
