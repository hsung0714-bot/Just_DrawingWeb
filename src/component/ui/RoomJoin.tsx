import { useState } from "react";
import styles from "../Drawing.module.css";

interface RoomJoinProps {
  onJoin: (roomId: string) => void;
}

const RoomJoin = ({ onJoin }: RoomJoinProps) => {
  const [roomInput, setRoomInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = roomInput.trim();
    if (id) {
      onJoin(id);
    }
  };

  const handleQuickJoin = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    onJoin(randomId);
  };

  return (
    <div className={styles.roomOverlay}>
      <div className={styles.roomCard}>
        <h2 className={styles.roomTitle}>방에 참가하기</h2>
        <p className={styles.roomDesc}>
          같은 방 ID를 입력하면 함께 그림을 그릴 수 있습니다.
        </p>
        <form onSubmit={handleSubmit} className={styles.roomForm}>
          <input
            type="text"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="방 ID 입력..."
            className={styles.roomInput}
            autoFocus
          />
          <button type="submit" className={styles.roomBtn} disabled={!roomInput.trim()}>
            입장
          </button>
        </form>
        <div className={styles.roomDivider}>
          <span>또는</span>
        </div>
        <button className={styles.roomQuickBtn} onClick={handleQuickJoin}>
          새 방 만들기
        </button>
      </div>
    </div>
  );
};

export default RoomJoin;
