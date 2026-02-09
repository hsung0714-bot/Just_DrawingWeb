import { useCallback, useRef, useState } from "react";
import styles from "./Drawing.module.css";
import type { Tool } from "./types";
import { useHistory } from "./hooks/useHistory";
import { useCanvas } from "./hooks/useCanvas";
import { useKeyboard } from "./hooks/useKeyboard";
import Header from "./ui/Header";
import Toolbar from "./ui/Toolbar";

const Drawing = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<Tool>("pen");

  const { saveToHistory, undo, redo, historyIndex, historyLength } =
    useHistory(canvasRef);

  useCanvas(canvasRef, color, brushSize, tool, saveToHistory);
  useKeyboard(undo, redo);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, [saveToHistory]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current!;
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  return (
    <div className={styles.container}>
      <Header onDownload={downloadCanvas} />
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
