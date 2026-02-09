import styles from "../Drawing.module.css";

interface HeaderProps {
  onDownload: () => void;
  roomId?: string;
  isConnected?: boolean;
  userCount?: number;
}

const Header = ({ onDownload, roomId, isConnected, userCount }: HeaderProps) => (
  <header className={styles.header}>
    <h1 className={styles.title}>Shinhyeon Young's Community Drawing Canvas</h1>
    <div className={styles.headerActions}>
      {roomId && (
        <div className={styles.connectionBadge}>
          <span
            className={`${styles.statusDot} ${isConnected ? styles.statusOnline : styles.statusOffline}`}
          />
          <span className={styles.badgeText}>
            {roomId} · {userCount ?? 0}명
          </span>
        </div>
      )}
      <button className={styles.headerBtn} onClick={onDownload}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        저장
      </button>
    </div>
  </header>
);

export default Header;
