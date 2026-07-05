import { ChevronDown } from "lucide-react";
import styles from "./ChatHeader.module.css";

function ChatHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span>ChatGPT</span>
        <ChevronDown size={16} />
      </div>
      <div className={styles.right}>
        <div className={styles.avatar}>IT</div>
      </div>
    </header>
  );
}
export default ChatHeader; 