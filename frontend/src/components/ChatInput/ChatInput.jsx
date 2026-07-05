import { useState } from "react";
import { Plus, ArrowUp, Mic } from "lucide-react";
import styles from "./ChatInput.module.css";

function ChatInput({ handleSubmit, isLoading }) {
  const [input, setInput] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();

    const cleanInput = input.trim();
    if (!cleanInput || isLoading) return;

    console.log("Submitted message:", cleanInput);

    handleSubmit(cleanInput);

    setInput("");
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={submitHandler}>
        {/* Plus icon */}
        <button type="button" className={styles.iconBtn}>
          <Plus size={20} />
        </button>

        {/* Input */}
        <input
          type="text"
          className={styles.input}
          placeholder="Ask anything"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />

        {/* Submit / Mic */}
        {input.trim() ? (
          <button type="submit" className={styles.submitBtn}>
            <ArrowUp size={18} />
          </button>
        ) : (
          <button type="button" className={styles.micBtnBare}>
            <Mic size={20} />
          </button>
        )}
      </form>
    </div>
  );
}

export default ChatInput;

// import { useState } from 'react';
// import { Plus, ArrowUp, Mic } from 'lucide-react';
// import styles from './ChatInput.module.css';

// function ChatInput({handleSubmit}) {
//   const [input, setInput] = useState('');

// //   const submitHandler = (e) => {
// //     e.preventDefault();
// //     if (!input.trim()) return;

// //     console.log("Submitted message:", input);
// //     setInput("");
// //   };

// const submitHandler = (e) => {
//   e.preventDefault();
//   if (!input.trim()) return;

//   console.log("Submitted message:", input);

//   // --- FIX: Call the prop function and pass the input data ---
//   handleSubmit(input);

//   setInput("");
// };

//   return (
//     <div className={styles.container}>
//       <form className={styles.form} onSubmit={submitHandler}>

//         {/* Muted Plus icon on the left */}
//         <button type="button" className={styles.iconBtn}>
//           <Plus size={20} />
//         </button>

//         {/* Text Input area */}
//         <input
//           type="text"
//           className={styles.input}
//           placeholder="Ask anything"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//         />

//         {/* Dynamic state engine */}
//         {input.trim() ? (
//           /* When writing: Solid white circle with dark up-arrow */
//           <button type="submit" className={styles.submitBtn}>
//             <ArrowUp size={18} />
//           </button>
//         ) : (
//           /* When empty: Minimalist icon with NO background matching image_34ac10.png */
//           <button type="button" className={styles.micBtnBare}>
//             <Mic size={20} />
//           </button>
//         )}

//       </form>
//     </div>
//   );
// }

// export default ChatInput;
