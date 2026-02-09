import styles from "../Drawing.module.css";
import { COLORS } from "../types";
import type { Tool } from "../types";

interface ToolbarProps {
  tool: Tool;
  color: string;
  brushSize: number;
  historyIndex: number;
  historyLength: number;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

const Toolbar = ({
  tool,
  color,
  brushSize,
  historyIndex,
  historyLength,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onUndo,
  onRedo,
  onClear,
}: ToolbarProps) => (
  <aside className={styles.toolbar}>
    <div className={styles.toolSection}>
      <span className={styles.sectionLabel}>도구</span>
      <div className={styles.toolGroup}>
        <button
          className={`${styles.toolBtn} ${tool === "pen" ? styles.active : ""}`}
          onClick={() => onToolChange("pen")}
          title="펜"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
        </button>
        <button
          className={`${styles.toolBtn} ${tool === "eraser" ? styles.active : ""}`}
          onClick={() => onToolChange("eraser")}
          title="지우개"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L14.6 1.6c.8-.8 2-.8 2.8 0L21.4 5.6c.8.8.8 2 0 2.8L10 20" />
            <path d="M6 12l5 5" />
          </svg>
        </button>
      </div>
    </div>

    <div className={styles.toolSection}>
      <span className={styles.sectionLabel}>색상</span>
      <div className={styles.colorPalette}>
        {COLORS.map((c) => (
          <button
            key={c}
            className={`${styles.colorBtn} ${color === c ? styles.activeColor : ""}`}
            style={{ backgroundColor: c }}
            onClick={() => {
              onColorChange(c);
              onToolChange("pen");
            }}
            title={c}
          />
        ))}
        <label className={styles.colorBtn} style={{ background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }} title="커스텀 색상">
          <input
            type="color"
            value={color}
            onChange={(e) => {
              onColorChange(e.target.value);
              onToolChange("pen");
            }}
            className={styles.hiddenInput}
          />
        </label>
      </div>
    </div>

    <div className={styles.toolSection}>
      <span className={styles.sectionLabel}>크기 ({brushSize}px)</span>
      <input
        type="range"
        min="1"
        max="50"
        value={brushSize}
        onChange={(e) => onBrushSizeChange(Number(e.target.value))}
        className={styles.slider}
      />
      <div className={styles.brushPreview}>
        <span
          className={styles.brushDot}
          style={{
            width: Math.min(brushSize, 40),
            height: Math.min(brushSize, 40),
            backgroundColor: tool === "eraser" ? "#ccc" : color,
          }}
        />
      </div>
    </div>

    <div className={styles.toolSection}>
      <span className={styles.sectionLabel}>작업</span>
      <div className={styles.toolGroup}>
        <button
          className={styles.toolBtn}
          onClick={onUndo}
          disabled={historyIndex <= 0}
          title="실행 취소 (Ctrl+Z)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 14 4 9 9 4" />
            <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
          </svg>
        </button>
        <button
          className={styles.toolBtn}
          onClick={onRedo}
          disabled={historyIndex >= historyLength - 1}
          title="다시 실행 (Ctrl+Shift+Z)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 14 20 9 15 4" />
            <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
          </svg>
        </button>
      </div>
      <button className={styles.clearBtn} onClick={onClear}>
        전체 지우기
      </button>
    </div>
  </aside>
);

export default Toolbar;
