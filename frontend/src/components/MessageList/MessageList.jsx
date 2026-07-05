import ChatMessage from "../ChatMessage/ChatMessage";
import styles from "./MessageList.module.css";
import { Bot } from "lucide-react";

function MessageList({ lastMessageRef, isLoading, conversations }) {
  return (
    <div className={styles.messages}>
      {conversations.length === 0 ? (
        <div className={styles.empty}>What are you working on?</div>
      ) : (
        conversations.map((msg, index) => {
          const isLast = index === conversations.length - 1;

          return (
            <div key={msg.id} ref={isLast ? lastMessageRef : null}>
              <ChatMessage role={msg.role} content={msg.content} />
            </div>
          );
        })
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingAvatar}>
            <Bot size={18} color="white" />
          </div>

          <div className={styles.loading}>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageList;

// import ChatMessage from "../ChatMessage/ChatMessage";
// import styles from "./MessageList.module.css";
// import {Bot} from "lucide-react";

// function MessageList({lastMessageRef, isLoading, conversations }) {
//   return (
//     <div className={styles.messages}>
//       {conversations.length === 0 ? (
//         <div className={styles.empty}>What are you working on?</div>
//       ) : (
//         conversations.map((msg) => (
//           <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
//         ))
//       )}

//       {isLoading && (<div>{isLoading && (
//   <div className={styles.loadingContainer}>
//     <div className={styles.loadingAvatar}>
//       <Bot size={18} color='white' />
//     </div>
//     <div className={styles.loading}>
//       <div className={styles.loadingDot}></div>
//       <div className={styles.loadingDot}></div>
//       <div className={styles.loadingDot}></div>
//     </div>
//   </div>
// )}</div>)}
// <div ref={lastMessageRef}></div>
//     </div>
//   );
// }

// export default MessageList;
