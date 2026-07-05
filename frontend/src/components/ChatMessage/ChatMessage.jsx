import { User, Bot } from "lucide-react";
import styles from "./ChatMessage.module.css";
import ReactMarkdown from "react-markdown";

function ChatMessage({ role, content }) {
  return (
    /* Main row: dynamically applies .user or .assistant for alignment */
    <div className={`${styles.message} ${styles[role]}`}>
      {/* Avatar: dynamically applies .user or .assistant for background colors */}
      <div className={`${styles.avatar} ${styles[role]}`}>
        {role === "user" ? (
          <User size={18} color="white" />
        ) : (
          <Bot size={18} color="white" />
        )}
      </div>

      <div className={styles.content}>
        {role === "user" ? (
          /* User messages are rendered as plain text within the bubble */
          content
        ) : (
          /* Assistant messages use Markdown for headers, lists, and bold text */
          <div className={styles.markdownBody}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;

// import { User, Bot } from 'lucide-react';
// import styles from './ChatMessage.module.css';

// function ChatMessage({ role, content }) {
//   return (
//     <div className={styles.chatMessage}>
//       <div className={`${styles.avatar} ${styles[role]}`}>
//         {role === 'user' ? (
//           <User size={18} color="white" />
//         ) : (
//           <Bot size={18} color="white" />
//         )}
//       </div>
//       <div className={styles.content}>
//         {content}
//       </div>
//     </div>
//   );
// }

// export default ChatMessage;
