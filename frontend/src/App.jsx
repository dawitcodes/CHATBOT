import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import ChatHeader from "./components/ChatHeader/ChatHeader.jsx";
import MessageList from "./components/MessageList/MessageList.jsx";
import ChatInput from "./components/ChatInput/ChatInput.jsx";
const BASE_URL = import.meta.env.VITE_API_URL;

function App() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastMessageRef = useRef(null);

  async function fetchConversations() {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/chat/conversation`,
      );

      setConversations(data.data || []);
    } catch (error) {
      console.log("Fetch error:", error.message);
    }
  }

  async function handleSubmit(question) {
    if (!question?.trim()) return;

    const cleanQuestion = question.trim();

    // 1. Optimistic UI (user message)
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: cleanQuestion,
    };

    setConversations((prev) => [...prev, userMessage]);

    try {
      setIsLoading(true);

      // 2. Send to backend
      const { data } = await axios.post(
        `${BASE_URL}/api/chat/conversation`,
        {
          question: cleanQuestion,
        },
      );

      const result = data?.data;

      if (!result) {
        throw new Error("No response from server");
      }

      // 3. AI message
      const aiMessage = {
        id: result.assistantConversation?.id || Date.now() + 1,
        role: "assistant",
        content: result.assistantConversation?.content || "No response from AI",
      };

      // 4. Replace last user message with DB version + add AI reply
      setConversations((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== userMessage.id);

        const savedUserMessage = {
          id: result.userConversation?.id || userMessage.id,
          role: "user",
          content: result.userConversation?.content || cleanQuestion,
        };

        return [...withoutTemp, savedUserMessage, aiMessage];
      });
    } catch (error) {
      console.log("Send error:", error.message);

      setConversations((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: "⚠️ Failed to get response from AI",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [conversations, isLoading]);

  return (
    <div className="app">
      <Sidebar />
      <main className="chat">
        <ChatHeader />
        <MessageList
          lastMessageRef={lastMessageRef}
          isLoading={isLoading}
          conversations={conversations}
        />
        <ChatInput isLoading={isLoading} handleSubmit={handleSubmit} />
      </main>
    </div>
  );
}

export default App;









// import Sidebar from "./components/Sidebar/Sidebar.jsx";
// import ChatHeader from "./components/ChatHeader/ChatHeader.jsx";
// import MessageList from "./components/MessageList/MessageList.jsx";
// import { useState, useEffect,useRef } from "react";
// import axios from "axios";
// import ChatInput from "./components/ChatInput/ChatInput.jsx";
// import { useRef } from "react";

// function App() {
//   const [conversations, setConversations] = useState([]);
//   // FIX 1: Defined the missing loading state variable here
//   const [isLoading, setIsLoading] = useState(false);
//   const lastMessageRef=useRef(null);

//   async function fetchConversations() {
//     try {
//       const { data } = await axios.get(
//         "http://localhost:3888/api/chat/conversation",
//       );
//       setConversations(data.data || data);
//     } catch (error) {
//       console.log(error.message);
//     }
//   }

//   async function handleSubmit(question) {
//     if (!question.trim()) return;

//     // 1. Immediately show the user's question on screen right away
//     const tempQuestion = {
//       id: Date.now(),
//       question: question.trim(),
//       content: question.trim(),
//       role: "user",
//     };
//     setConversations((prev) => [...prev, tempQuestion]);

//     try {
//       // FIX 2: Fixed the typo from 'setIsLoadind' to 'setIsLoading'
//       setIsLoading(true);

//       // 2. Post to the backend
//       const { data } = await axios.post(
//         "http://localhost:3888/api/chat/conversation",
//         {
//           question: question.trim(),
//         },
//       );

//       console.log("Response from server:", data);

//       // 3. FORCE state update: If your backend returns the new conversation entries,
//       // extract the assistant reply and push it into state directly.
//       if (data && data.data && data.data.assistantConversation) {
//         const aiReply = {
//           id: data.data.assistantConversation.id || Date.now() + 1,
//           content: data.data.assistantConversation.content,
//           role: "assistant",
//         };

//         // Remove the temporary user message and sync with exact DB values
//         setConversations((prev) => {
//           // Remove our temporary user message so we don't have duplicates
//           const filtered = prev.filter((msg) => msg.id !== tempQuestion.id);

//           // Reconstruct the user message with its real database ID
//           const realUserMsg = {
//             id: data.data.userConversation.id,
//             content: data.data.userConversation.content,
//             role: "user",
//           };

//           return [...filtered, realUserMsg, aiReply];
//         });
//       } else {
//         // Fallback: If your backend returns everything, just re-fetch the entire log
//         await fetchConversations();
//       }
//       setConversations((prev) => [...prev, data?.data?.assistantConversation]);
//     } catch (error) {
//       console.log("Error sending message:", error.message);
//     } finally {
//       // FIX 3: Fixed the typo from 'setIsLoadind' to 'setIsLoading'
//       setIsLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchConversations();
//   }, []);

//   useEffect(() => {
//     lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [conversations, isLoading]);

//   return (
//     <div className="app">
//       <Sidebar />
//       <main className="chat">
//         <ChatHeader />
//         <MessageList lastMessageRef={lastMessageRef} isLoading={isLoading} conversations={conversations} />
//         {/* FIX 4: Fixed typo from 'isLOading' to 'isLoading' */}
//         <ChatInput isLoading={isLoading} handleSubmit={handleSubmit} />
//       </main>
//     </div>
//   );
// }

// export default App;

// import Sidebar from "./components/Sidebar/Sidebar.jsx";
// import ChatHeader from "./components/ChatHeader/ChatHeader.jsx";
// import MessageList from "./components/MessageList/MessageList.jsx";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import ChatInput from "./components/ChatInput/ChatInput.jsx";

// function App() {
//   const [conversations, setConversations] = useState([]);
//   async function fetchConversations() {
//     try {
//       const { data } = await axios.get(
//         "http://localhost:3888/api/chat/conversation",
//       );
//       // axios returns the response in data.data if your backend sends { data: [...] }
//       // otherwise, just use setConversations(data)
//       setConversations(data.data || data);
//     } catch (error) {
//       console.log(error.message);
//     }
//   }

//   async function handleSubmit(question) {
//     if (!question.trim()) {
//       return;
//     }

//     // console.log(question);
//     try {
//       const { data } = await axios.post(
//         "http://localhost:3888/api/chat/conversation",
//         {
//           question: question.trim(),
//         },
//       );
//       console.log(data.data);
//     } catch (error) {
//       console.log(error.message);
//     }
//   }

//   useEffect(() => {
//     fetchConversations();
//   }, []);

//   // fetchConversations();
//   return (
//     <div className="app">
//       <Sidebar />
//       <main className="chat">
//         <ChatHeader />
//         {/* messageList */}
//         <MessageList conversations={conversations} />
//         {/* ChatInput */}
//         <ChatInput handleSubmit={handleSubmit} />
//       </main>
//     </div>
//   );
// }

// export default App;

// ******************
// ******************
// import Sidebar from "./components/Sidebar/Sidebar"
// import ChatHeader from "./components/ChatHeader/ChatHeader";
// function App() {
//   return (
//     <div>
//       {/* sidebar */}
//       <div className="app">
//         <Sidebar/>

//       </div>

//       <main className="main">
//         {/* chatHeader */}
//         <ChatHeader/>

//         {/* messageList */}

//         {/* chatInput */}
//       </main>
//     </div>
//   )
// }

// export default App
// import Sidebar from "./components/Sidebar/Sidebar";
// import ChatHeader from "./components/ChatHeader/ChatHeader";

// function App() {
//   return (
//     /* This main div must wrap EVERYTHING */
//     <div className="app-container">
//       <Sidebar />

//       <main className="main">
//         {/* chatHeader */}
//         <ChatHeader />

//         {/* messageList */}
//         <div className="messages">{/* Messages will go here */}</div>

//         {/* chatInput */}
//         <div className="input-area">{/* Input will go here */}</div>
//       </main>
//     </div>
//   );
// }

// export default App;
