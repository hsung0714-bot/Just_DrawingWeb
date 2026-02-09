import { useCallback, useRef, useState } from "react";

export function useHistory(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef({ history, historyIndex });
  historyRef.current = { history, historyIndex };

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { historyIndex: idx } = historyRef.current;
    setHistory((prev) => {
      const newHistory = prev.slice(0, idx + 1);
      newHistory.push(imageData);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [canvasRef]);

  const undo = useCallback(() => {
    const { history, historyIndex } = historyRef.current;
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  }, [canvasRef]);

  const redo = useCallback(() => {
    const { history, historyIndex } = historyRef.current;
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  }, [canvasRef]);

  return { saveToHistory, undo, redo, historyIndex, historyLength: history.length };
}
