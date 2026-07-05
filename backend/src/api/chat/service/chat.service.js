import db from "../../../../db/dbConfig.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv"
dotenv.config()
// Fixed: Changed retired model string to a current, active model
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System instructions initialized globally on the model
const model = genAI.getGenerativeModel({
  model: GEMINI_MODEL,
  systemInstruction: `You are an expert software engineering assistant. Your primary role is to help developers write, debug, and understand code.

# Core Objectives
- Provide accurate, practical, and efficient programming solutions.
- Explain technical concepts clearly and concisely.

# Constraints & Boundaries
- STRICTLY limit your answers to software engineering, programming, computer science, and IT-related topics.
- If a user asks about non-programming topics (e.g., travel, health, finance, legal, lifestyle), you MUST politely decline and steer the conversation back to programming.
- Do not write harmful, malicious, or unethical code.

# Tone & Style
- Be professional, helpful, and direct.
- Keep responses concise; avoid unnecessary fluff.
- Use Markdown formatting for readability.
- Always wrap code snippets in appropriate language-specific code blocks.`,
});

console.log(" CURRENT ACTIVE MODEL BEING USED:", GEMINI_MODEL);

// Get recent chat history

export const getRecentConversationRows = async (limit = 5) => {
  const normalizedLimit = Number.parseInt(limit, 10);

  const safeLimit =
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 5 : normalizedLimit;

  const [rows] = await db.execute(
    `SELECT id, role, content, created_at
     FROM conversations
     ORDER BY id DESC
     LIMIT ${safeLimit}`
  );

  return rows.reverse();
};
// export const getRecentConversationRows = async (limit = 5) => {
//   const normalizedLimit = Number.parseInt(limit, 10);

//   const safeLimit =
//     Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 5 : normalizedLimit;

//   const [rows] = await db.execute(
//     `SELECT id, role, content, created_at
//      FROM conversations
//      ORDER BY id DESC
//      LIMIT ?`,
//     [safeLimit],
//   );

//   return rows.reverse();
// };

// Swapped out startChat for a robust stateless generateContent call
const generateAssistantAnswer = async ({ historyRows, question }) => {
  try {
    // 1. Map existing DB history rows to SDK format
    const contents = historyRows.map((row) => ({
      role: row.role === "assistant" ? "model" : "user",
      parts: [{ text: String(row.content || "") }],
    }));

    // 2. Append the current question right to the end of the history array
    contents.push({
      role: "user",
      parts: [{ text: String(question || "") }],
    });

    // 3. Request the response using the unified contents array
    const result = await model.generateContent({
      contents: contents,
    });

    const response = await result.response;
    const textAnswer = response.text().trim();

    if (!textAnswer) {
      throw new Error("The model returned an empty answer");
    }

    // Dynamic token parsing from metadata
    const totalTokens = response.usageMetadata?.totalTokenCount || 0;
    console.log(response);

    return {
      text: textAnswer,
      totalTokens: totalTokens,
    };
  } catch (apiError) {
    // This console error will now show you the real issue if something else breaks!
    console.error(" GEMINI API CRASHED:", apiError);
    return {
      text: "AI service error. Please try again later.",
      totalTokens: 0,
    };
  }
};

// Get message by ID
const getMessageById = async (messageId) => {
  const [rows] = await db.execute(
    `SELECT id, role, content, token_count, created_at
     FROM conversations
     WHERE id = ?
     LIMIT 1`,
    [messageId],
  );

  if (!rows[0]) return null;

  return {
    id: rows[0].id,
    role: rows[0].role,
    content: rows[0].content,
    tokenCount: Number(rows[0].token_count || 0),
    createdAt: rows[0].created_at,
  };
};

// Main service
export async function createConversationService(question) {
  try {
    if (!question || !question.trim()) {
      const error = new Error("Question is required");
      error.status = 400;
      throw error;
    }

    // 1. Grab history BEFORE we insert the current question
    const historyRows = await getRecentConversationRows(5);

    // 2. Save user message to database
    const [userInsertResult] = await db.execute(
      `INSERT INTO conversations (content, role)
       VALUES (?, ?)`,
      [question, "user"],
    );

    // 3. Get AI response using the history and current question
    const { text, totalTokens } = await generateAssistantAnswer({
      historyRows,
      question,
    });

    // 4. Save assistant response to database
    const [assistantInsertResult] = await db.execute(
      `INSERT INTO conversations (role, content, token_count)
       VALUES (?, ?, ?)`,
      ["assistant", text, totalTokens],
    );

    const userConversation = await getMessageById(userInsertResult.insertId);
    const assistantConversation = await getMessageById(
      assistantInsertResult.insertId,
    );

    return {
      userConversation,
      assistantConversation,
    };
  } catch (error) {
    console.error(" Service Error:", error);
    throw error;
  }
}









// import db from "../../../../db/dbConfig.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Fixed: Changed retired model string to a current, active model
// const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Integrated: Added systemInstruction directly to the model configuration
// const model = genAI.getGenerativeModel({
//   model: GEMINI_MODEL,
//   systemInstruction: `You are an expert software engineering assistant. Your primary role is to help developers write, debug, and understand code.

// # Core Objectives
// - Provide accurate, practical, and efficient programming solutions.
// - Explain technical concepts clearly and concisely.

// # Constraints & Boundaries
// - STRICTLY limit your answers to software engineering, programming, computer science, and IT-related topics.
// - If a user asks about non-programming topics (e.g., travel, health, finance, legal, lifestyle), you MUST politely decline and steer the conversation back to programming.
// - Do not write harmful, malicious, or unethical code.

// # Tone & Style
// - Be professional, helpful, and direct.
// - Keep responses concise; avoid unnecessary fluff.
// - Use Markdown formatting for readability.
// - Always wrap code snippets in appropriate language-specific code blocks.`,
// });

// console.log(" CURRENT ACTIVE MODEL BEING USED:", GEMINI_MODEL);

// // Get recent chat history
// export const getRecentConversationRows = async (limit = 5) => {
//   const normalizedLimit = Number.parseInt(limit, 10);

//   const safeLimit =
//     Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 5 : normalizedLimit;

//   const [rows] = await db.execute(
//     `SELECT id, role, content, created_at
//      FROM conversations
//      ORDER BY id DESC
//      LIMIT ?`,
//     [safeLimit],
//   );

//   return rows.reverse();
// };

// // Fixed: Rewritten using the official model.startChat SDK approach from your image's logic
// const generateAssistantAnswer = async ({ historyRows, question }) => {
//   try {
//     // Format history for the official Google Generative AI SDK
//     const formattedHistory = historyRows.map((row) => ({
//       role: row.role === "assistant" ? "model" : "user",
//       parts: [{ text: String(row.content || "") }],
//     }));

//     // Start a multi-turn chat session passing the formatted history
//     const chat = model.startChat({
//       history: formattedHistory,
//     });

//     // Send the new user question
//     const result = await chat.sendMessage(String(question || ""));
//     const response = await result.response;
//     const textAnswer = response.text().trim();

//     if (!textAnswer) {
//       throw new Error("The model returned an empty answer");
//     }

//     // Attempting to extract token metadata if provided by the SDK response
//     const totalTokens = response.usageMetadata?.totalTokenCount || 0;

//     return {
//       text: textAnswer,
//       totalTokens: totalTokens,
//     };
//   } catch (apiError) {
//     console.error("🔥 GEMINI ERROR:", apiError);
//     return {
//       text: "AI service error. Please try again later.",
//       totalTokens: 0,
//     };
//   }
// };

// // Get message by ID
// const getMessageById = async (messageId) => {
//   const [rows] = await db.execute(
//     `SELECT id, role, content, token_count, created_at
//      FROM conversations
//      WHERE id = ?
//      LIMIT 1`,
//     [messageId],
//   );

//   if (!rows[0]) return null;

//   return {
//     id: rows[0].id,
//     role: rows[0].role,
//     content: rows[0].content,
//     tokenCount: Number(rows[0].token_count || 0),
//     createdAt: rows[0].created_at,
//   };
// };

// // Main service
// export async function createConversationService(question) {
//   try {
//     if (!question || !question.trim()) {
//       const error = new Error("Question is required");
//       error.status = 400;
//       throw error;
//     }

//     // 1. Grab history BEFORE we insert the current question
//     const historyRows = await getRecentConversationRows(5);

//     // 2. Save user message to database
//     const [userInsertResult] = await db.execute(
//       `INSERT INTO conversations (content, role)
//        VALUES (?, ?)`,
//       [question, "user"],
//     );

//     // 3. Get AI response using the history and current question
//     const { text, totalTokens } = await generateAssistantAnswer({
//       historyRows,
//       question,
//     });

//     // 4. Save assistant response to database
//     const [assistantInsertResult] = await db.execute(
//       `INSERT INTO conversations (role, content, token_count)
//        VALUES (?, ?, ?)`,
//       ["assistant", text, totalTokens],
//     );

//     const userConversation = await getMessageById(userInsertResult.insertId);
//     const assistantConversation = await getMessageById(
//       assistantInsertResult.insertId,
//     );

//     return {
//       userConversation,
//       assistantConversation,
//     };
//   } catch (error) {
//     console.error(" Service Error:", error);
//     throw error;
//   }
// }

// import db from "../../../../db/dbConfig.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Fixed: Changed retired model string to a current, active model
// const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const model = genAI.getGenerativeModel({
//   model: GEMINI_MODEL,
// });
// console.log(" CURRENT ACTIVE MODEL BEING USED:", GEMINI_MODEL);

// // Get recent chat history
// export const getRecentConversationRows = async (limit = 5) => {
//   const normalizedLimit = Number.parseInt(limit, 10);

//   const safeLimit =
//     Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 5 : normalizedLimit;

//   const [rows] = await db.execute(
//     `SELECT id, role, content, created_at
//      FROM conversations
//      ORDER BY id DESC
//      LIMIT ?`,
//     [safeLimit],
//   );

//   return rows.reverse();
// };

// // Generate AI response
// const generateAssistantAnswer = async ({ historyRows, question }) => {
//   try {
//     const contents = historyRows.map((row) => ({
//       role: row.role === "assistant" ? "model" : "user",
//       parts: [{ text: String(row.content || "") }],
//     }));

//     contents.push({
//       role: "user",
//       parts: [{ text: String(question || "") }],
//     });

//     const result = await model.generateContent({
//       contents,
//     });

//     const response = await result.response;
//     const textAnswer = response.text();

//     return {
//       text: textAnswer,
//       totalTokens: 0,
//     };
//   } catch (apiError) {
//     console.error("🔥 GEMINI ERROR:", apiError);

//     // Re-throwing the error or checking its properties can help your UI distinguish
//     // between a structural failure and a normal response.
//     return {
//       text: "AI service error. Please try again later.",
//       totalTokens: 0,
//     };
//   }
// };

// // Get message by ID
// const getMessageById = async (messageId) => {
//   const [rows] = await db.execute(
//     `SELECT id, role, content, token_count, created_at
//      FROM conversations
//      WHERE id = ?
//      LIMIT 1`,
//     [messageId],
//   );

//   if (!rows[0]) return null;

//   return {
//     id: rows[0].id,
//     role: rows[0].role,
//     content: rows[0].content,
//     tokenCount: Number(rows[0].token_count || 0),
//     createdAt: rows[0].created_at,
//   };
// };

// // Main service
// export async function createConversationService(question) {
//   try {
//     if (!question || !question.trim()) {
//       const error = new Error("Question is required");
//       error.status = 400;
//       throw error;
//     }

//     // 1. Grab history BEFORE we insert the current question
//     // (Prevents the current question from duplicating in historyRows)
//     const historyRows = await getRecentConversationRows(5);

//     // 2. Save user message to database
//     const [userInsertResult] = await db.execute(
//       `INSERT INTO conversations (content, role)
//        VALUES (?, ?)`,
//       [question, "user"],
//     );

//     // 3. Get AI response using the history and current question
//     const { text, totalTokens } = await generateAssistantAnswer({
//       historyRows,
//       question,
//     });

//     // 4. Save assistant response to database
//     const [assistantInsertResult] = await db.execute(
//       `INSERT INTO conversations (role, content, token_count)
//        VALUES (?, ?, ?)`,
//       ["assistant", text, totalTokens],
//     );

//     const userConversation = await getMessageById(userInsertResult.insertId);
//     const assistantConversation = await getMessageById(
//       assistantInsertResult.insertId,
//     );

//     return {
//       userConversation,
//       assistantConversation,
//     };
//   } catch (error) {
//     console.error(" Service Error:", error);
//     throw error;
//   }
// }

// import db from "../../../../db/dbConfig.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const model = genAI.getGenerativeModel({
//   model: GEMINI_MODEL,
// });

// // Get recent chat history
// export const getRecentConversationRows = async (limit = 5) => {
//   const normalizedLimit = Number.parseInt(limit, 10);

//   const safeLimit =
//     Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 5 : normalizedLimit;

//   const [rows] = await db.execute(
//     `SELECT id, role, content, created_at
//      FROM conversations
//      ORDER BY id DESC
//      LIMIT ?`,
//     [safeLimit],
//   );

//   return rows.reverse();
// };

// // Generate AI response
// const generateAssistantAnswer = async ({ historyRows, question }) => {
//   try {
//     const contents = historyRows.map((row) => ({
//       role: row.role === "assistant" ? "model" : "user",
//       parts: [{ text: String(row.content || "") }],
//     }));

//     contents.push({
//       role: "user",
//       parts: [{ text: String(question || "") }],
//     });

//     const result = await model.generateContent({
//       contents,
//     });

//     const response = await result.response;
//     const textAnswer = response.text();

//     return {
//       text: textAnswer,
//       totalTokens: 0,
//     };
//   } catch (apiError) {
//     console.error("🔥 GEMINI ERROR:", apiError);

//     return {
//       text: "AI service error. Please try again later.",
//       totalTokens: 0,
//     };
//   }
// };

// // Get message by ID
// const getMessageById = async (messageId) => {
//   const [rows] = await db.execute(
//     `SELECT id, role, content, token_count, created_at
//      FROM conversations
//      WHERE id = ?
//      LIMIT 1`,
//     [messageId],
//   );

//   if (!rows[0]) return null;

//   return {
//     id: rows[0].id,
//     role: rows[0].role,
//     content: rows[0].content,
//     tokenCount: Number(rows[0].token_count || 0),
//     createdAt: rows[0].created_at,
//   };
// };

// // Main service
// export async function createConversationService(question) {
//   try {
//     if (!question || !question.trim()) {
//       const error = new Error("Question is required");
//       error.status = 400;
//       throw error;
//     }

//     const historyRows = await getRecentConversationRows(5);

//     // Save user message
//     const [userInsertResult] = await db.execute(
//       `INSERT INTO conversations (content, role)
//        VALUES (?, ?)`,
//       [question, "user"],
//     );

//     // Get AI response
//     const { text, totalTokens } = await generateAssistantAnswer({
//       historyRows,
//       question,
//     });

//     // Save assistant message
//     const [assistantInsertResult] = await db.execute(
//       `INSERT INTO conversations (role, content, token_count)
//        VALUES (?, ?, ?)`,
//       ["assistant", text, totalTokens],
//     );

//     const userConversation = await getMessageById(userInsertResult.insertId);

//     const assistantConversation = await getMessageById(
//       assistantInsertResult.insertId,
//     );

//     return {
//       userConversation,
//       assistantConversation,
//     };
//   } catch (error) {
//     console.error("❌ Service Error:", error);
//     throw error;
//   }
// }

// import db from "../../../../db/dbConfig.js";
// import { GoogleGenAI } from "@google/genai";

// const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro"; // FIXED MODEL

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// // Get recent chat history
// export const getRecentConversationRows = async (limit = 5) => {
//   const normalizedLimit = Number.parseInt(limit, 10);

//   const safeLimit =
//     Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 5 : normalizedLimit;

//   const [rows] = await db.execute(
//     `SELECT id, role, content, created_at
//      FROM conversations
//      ORDER BY id DESC
//      LIMIT ?`,
//     [safeLimit],
//   );

//   return rows.reverse();
// };

// // Generate AI response
// const generateAssistantAnswer = async ({ historyRows, question }) => {
//   try {
//     const contents = historyRows.map((row) => ({
//       role: row.role === "assistant" ? "model" : "user",
//       parts: [{ text: String(row.content || "") }],
//     }));

//     contents.push({
//       role: "user",
//       parts: [{ text: String(question || "") }],
//     });

//     const response = await ai.models.generateContent({
//       model: GEMINI_MODEL,
//       contents,
//       config: {
//         maxOutputTokens: 1024,
//         systemInstruction: `
// You are a helpful assistant.
// You must answer the user in Amharic.
//         `,
//       },
//     });

//     console.log("Gemini RAW RESPONSE:", response);

//     const textAnswer =
//       response?.text ||
//       response?.candidates?.[0]?.content?.parts?.[0]?.text ||
//       "No response from AI.";

//     const tokenCount = response?.usageMetadata?.totalTokenCount || 0;

//     return {
//       text: textAnswer,
//       totalTokens: tokenCount,
//     };
//   } catch (apiError) {
//     console.error("🔥 FULL GEMINI ERROR:");
//     console.error(apiError); // IMPORTANT: do NOT hide real error

//     return {
//       text: "AI service error. Please try again later.",
//       totalTokens: 0,
//     };
//   }
// };

// // Get message by ID
// const getMessageById = async (messageId) => {
//   const [rows] = await db.execute(
//     `SELECT id, role, content, token_count, created_at
//      FROM conversations
//      WHERE id = ?
//      LIMIT 1`,
//     [messageId],
//   );

//   if (!rows[0]) return null;

//   return {
//     id: rows[0].id,
//     role: rows[0].role,
//     content: rows[0].content,
//     tokenCount: Number(rows[0].token_count || 0),
//     createdAt: rows[0].created_at,
//   };
// };

// // Main service
// export async function createConversationService(question) {
//   try {
//     if (!question || !question.trim()) {
//       const error = new Error("Question is required");
//       error.status = 400;
//       throw error;
//     }

//     const historyRows = await getRecentConversationRows(5);

//     // Save user message
//     const [userInsertResult] = await db.execute(
//       `INSERT INTO conversations (content, role)
//        VALUES (?, ?)`,
//       [question, "user"],
//     );

//     // Get AI response
//     const { text, totalTokens } = await generateAssistantAnswer({
//       historyRows,
//       question,
//     });

//     // Save assistant message
//     const [assistantInsertResult] = await db.execute(
//       `INSERT INTO conversations (role, content, token_count)
//        VALUES (?, ?, ?)`,
//       ["assistant", text, totalTokens],
//     );

//     const userConversation = await getMessageById(userInsertResult.insertId);

//     const assistantConversation = await getMessageById(
//       assistantInsertResult.insertId,
//     );

//     return {
//       userConversation,
//       assistantConversation,
//     };
//   } catch (error) {
//     console.error("❌ Service Error:", error);
//     throw error;
//   }
// }

// import db from "../../../../db/dbConfig.js";
// import { GoogleGenAI } from "@google/genai";

// const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// export const getRecentConversationRows = async (limit = 5) => {
//   const normalizedLimit = Number.parseInt(limit, 10);

//   const safeLimit =
//     Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 5 : normalizedLimit;

//   const [rows] = await db.execute(
//     `SELECT id, role, content, created_at
//      FROM conversations
//      ORDER BY id DESC
//      LIMIT ?`,
//     [safeLimit],
//   );

//   return rows.reverse();
// };

// const generateAssistantAnswer = async ({ historyRows, question }) => {
//   try {
//     const contents = historyRows.map((row) => ({
//       role: row.role === "assistant" ? "model" : "user",
//       parts: [{ text: row.content }],
//     }));

//     // Add current question
//     contents.push({
//       role: "user",
//       parts: [{ text: question }],
//     });

//     const response = await ai.models.generateContent({
//       model: GEMINI_MODEL,
//       contents,
//       config: {
//         maxOutputTokens: 1024,
//         systemInstruction: `
// You are a helpful assistant.
// You should answer the user questions in Amharic.
//         `,
//       },
//     });

//     console.log("Gemini API raw response:", response);

//     const textAnswer =
//       response.text ||
//       response.candidates?.[0]?.content?.parts?.[0]?.text ||
//       "No response text found.";

//     const tokenCount = response.usageMetadata?.totalTokenCount || 0;

//     return {
//       text: textAnswer,
//       totalTokens: tokenCount,
//     };
//   } catch (apiError) {
//     console.error("Gemini API Connection Error:", apiError.message);

//     return {
//       text: "Sorry, I am having trouble connecting to the AI service right now.",
//       totalTokens: 0,
//     };
//   }
// };

// const getMessageById = async (messageId) => {
//   const [rows] = await db.execute(
//     `SELECT id, role, content, token_count, created_at
//      FROM conversations
//      WHERE id = ?
//      LIMIT 1`,
//     [messageId],
//   );

//   if (!rows[0]) return null;

//   return {
//     id: rows[0].id,
//     role: rows[0].role,
//     content: rows[0].content,
//     tokenCount: Number(rows[0].token_count || 0),
//     createdAt: rows[0].created_at,
//   };
// };

// export async function createConversationService(question) {
//   try {
//     if (!question || !question.trim()) {
//       const error = new Error("Question is required");
//       error.status = 400;
//       throw error;
//     }

//     const historyRows = await getRecentConversationRows(5);

//     // Save user message
//     const [userInsertResult] = await db.execute(
//       `INSERT INTO conversations (content, role)
//        VALUES (?, ?)`,
//       [question, "user"],
//     );

//     // Generate AI response
//     const { text, totalTokens } = await generateAssistantAnswer({
//       historyRows,
//       question,
//     });

//     // Save assistant message
//     const [assistantInsertResult] = await db.execute(
//       `INSERT INTO conversations
//        (role, content, token_count)
//        VALUES (?, ?, ?)`,
//       ["assistant", text, totalTokens],
//     );

//     const userConversation = await getMessageById(userInsertResult.insertId);

//     const assistantConversation = await getMessageById(
//       assistantInsertResult.insertId,
//     );

//     return {
//       userConversation,
//       assistantConversation,
//     };
//   } catch (error) {
//     console.error("Error inside createConversationService:", error);

//     throw error;
//   }
// }

// import db from "../../../../db/dbConfig.js";
// import { GoogleGenAI } from "@google/genai";

// const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

// const geminiClient = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// export const getRecentConversationRows = async (limit = 5) => {
//   const normalizedLimit = Number.parseInt(limit, 10);
//   const safeLimit =
//     Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 5 : normalizedLimit;

//   const [rows] = await db.execute(
//     `SELECT id, role, content, created_at
//      FROM conversations
//      ORDER BY id DESC
//      LIMIT ?`,
//     [safeLimit],
//   );

//   return rows.reverse();
// };

// const generateAssistantAnswer = async ({ historyRows, question }) => {
//   const formattedHistory = historyRows.map((row) => ({
//     role: row.role === "assistant" ? "model" : "user",
//     parts: [{ text: row.content }],
//   }));

//   const chat = geminiClient.chats.create({
//     model: GEMINI_MODEL,
//     config: {
//       maxOutputTokens: 1024,
//     },
//     history: formattedHistory,
//   });

//   const result = await chat.sendMessage({
//     message: question,
//   });

//   console.log(result);

//   // FIX: Return both the text and token count as an object
//   return {
//     text: result.text,
//     totalTokens: result.usageMetadata?.totalTokenCount || 0,
//   };
// };

// const getMessageById = async (messageId) => {
//   const [rows] = await db.execute(
//     "SELECT id, role, content, token_count, created_at FROM conversations WHERE id = ? LIMIT 1",
//     [messageId],
//   );

//   if (!rows[0]) return null;

//   return {
//     id: rows[0].id,
//     role: rows[0].role,
//     content: rows[0].content,
//     tokenCount: Number(rows[0].token_count || 0),
//     createdAt: rows[0].created_at,
//   };
// };

// export async function createConversationService(question) {
//   try {
//     if (!question || !question.trim()) {
//       const error = new Error("Question is required");
//       error.status = 400;
//       throw error;
//     }

//     const historyRows = await getRecentConversationRows(5);

//     // FIX: Capture the user insert result so we can access userInsertResult.insertId
//     const [userInsertResult] = await db.execute(
//       `INSERT INTO conversations (content, role)
//        VALUES (?, ?)`,
//       [question, "user"],
//     );

//     // Now destructuring works perfectly because generateAssistantAnswer returns an object
//     const { text, totalTokens } = await generateAssistantAnswer({
//       historyRows,
//       question,
//     });

//     const [createAssistantMessageResult] = await db.execute(
//       "INSERT INTO conversations (role, content, token_count) VALUES (?, ?, ?)",
//       ["assistant", text, totalTokens],
//     );

//     // FIX: Using userInsertResult instead of the non-existent 'result' variable
//     const userConversation = await getMessageById(userInsertResult.insertId);
//     const assistantConversation = await getMessageById(
//       createAssistantMessageResult.insertId,
//     );

//     return {
//       userConversation,
//       assistantConversation,
//     };
//   } catch (error) {
//     console.error("Error in createConversationService:", error);
//     throw error;
//   }
// }

// import db from "../../../../db/dbConfig.js";
// import { GoogleGenAI } from "@google/genai";

// const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

// const geminiClient = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

//  export const getRecentConversationRows = async (limit = 5) => {
//   const normalizedLimit = Number.parseInt(limit, 10);

//   const safeLimit =
//     Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 5 : normalizedLimit;

//   const [rows] = await db.execute(
//     `SELECT id, role, content, created_at
//      FROM conversations
//      ORDER BY id DESC
//      LIMIT ?`,
//     [safeLimit],
//   );

//   return rows.reverse();
// };

// const generateAssistantAnswer = async ({ historyRows, question }) => {
//   // format history
//   const formattedHistory = historyRows.map((row) => ({
//     role: row.role === "assistant" ? "model" : "user",
//     parts: [{ text: row.content }],
//   }));

//   /*
//     Sample history format:

//     [
//       {
//         role: "user",
//         parts: [{ text: "Hello" }],
//       },
//       {
//         role: "model",
//         parts: [{ text: "Hi there!" }],
//       },
//     ]
//   */

//   const chat = geminiClient.chats.create({
//     model: GEMINI_MODEL,
//     config:{
//         maxOutputTokens:1024,
//     },
//     history: formattedHistory,
//   });

//   const result = await chat.sendMessage({
//     message: question,
//   });

//   console.log(result);

//   return result.text;
// };

// const getMessageById = async (messageId) => {
//   const [rows] = await db.execute(
//     "SELECT id, role, content, token_count, created_at FROM conversations WHERE id = ? LIMIT 1",
//     [messageId],
//   );

//   if (!rows[0]) return null;

//   return {
//     id: rows[0].id,
//     role: rows[0].role,
//     content: rows[0].content,
//     tokenCount: Number(rows[0].token_count || 0),
//     createdAt: rows[0].created_at,
//   };
// };

// export async function createConversationService(question) {
//   try {
//     // validation
//     if (!question || !question.trim()) {
//       const error = new Error("Question is required");
//       error.status = 400;
//       throw error;
//     }

//     // get recent messages
//     const historyRows = await getRecentConversationRows(5);

//     // save user message
//     await db.execute(
//       `INSERT INTO conversations (content, role)
//        VALUES (?, ?)`,
//       [question, "user"],
//     );

//     // generate AI answer
//     const {text,totalTokens} = await generateAssistantAnswer({
//       historyRows,
//       question,
//     });

//     const [createAssistantMessageResult] = await db.execute(
//       "INSERT INTO conversations (role, content, token_count) VALUES (?, ?, ?)",
//       ["assistant", text, totalTokens],
//     );

//     const userConversation = await getMessageById(result.insertId);
//     const assistantConversation = await getMessageById(
//       createAssistantMessageResult.insertId,
//     );

//     return {
//       userConversation,
//       assistantConversation,
//     };

//     // save assistant message
//     // await db.execute(
//     //   `INSERT INTO conversations (content, role)
//     //    VALUES (?, ?)`,
//     //   [assistantAnswer, "assistant"],
//     // );

//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

// *********************
// *********************
// import db from "../../../../db/dbConfig.js";
// import { GoogleGenAI } from "@google/genai";

// const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

// const geminiClient = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// /**
//  * Get recent conversations
//  */
// export const getRecentConversationRows = async (limit = 5) => {
//   const normalizedLimit = Number.parseInt(limit, 10);

//   const safeLimit =
//     Number.isNaN(normalizedLimit) || normalizedLimit <= 0 ? 5 : normalizedLimit;

//   const [rows] = await db.execute(
//     `SELECT id, role, content, created_at
//      FROM conversations
//      ORDER BY id DESC
//      LIMIT ?`,
//     [safeLimit],
//   );

//   return rows.reverse();
// };

// /**
//  * Generate AI answer
//  */
// const generateAssistantAnswer = async ({ historyRows, question }) => {
//   // Format conversation history
//   const formattedHistory = historyRows.map((row) => ({
//     role: row.role === "assistant" ? "model" : "user",
//     parts: [{ text: row.content }],
//   }));

//   const chat = geminiClient.chats.create({
//     model: GEMINI_MODEL,
//     config: {
//       maxOutputTokens: 1024,
//     },
//     history: formattedHistory,
//   });

//   const result = await chat.sendMessage({
//     message: question,
//   });

//   console.log(result);

//   return {
//     text: result.text,
//     totalTokens: result.usageMetadata?.totalTokenCount || 0,
//   };
// };

// /**
//  * Get single message by ID
//  */
// const getMessageById = async (messageId) => {
//   const [rows] = await db.execute(
//     `SELECT id, role, content, token_count, created_at
//      FROM conversations
//      WHERE id = ?
//      LIMIT 1`,
//     [messageId],
//   );

//   if (!rows[0]) return null;

//   return {
//     id: rows[0].id,
//     role: rows[0].role,
//     content: rows[0].content,
//     tokenCount: Number(rows[0].token_count || 0),
//     createdAt: rows[0].created_at,
//   };
// };

// /**
//  * Create conversation
//  */
// export async function createConversationService(question) {
//   try {
//     // Validation
//     if (!question || !question.trim()) {
//       const error = new Error("Question is required");
//       error.status = 400;
//       throw error;
//     }

//     // Get recent messages
//     const historyRows = await getRecentConversationRows(5);

//     // Save user message
//     const [userInsertResult] = await db.execute(
//       `INSERT INTO conversations (content, role)
//        VALUES (?, ?)`,
//       [question, "user"],
//     );

//     // Generate AI answer
//     const { text, totalTokens } = await generateAssistantAnswer({
//       historyRows,
//       question,
//     });

//     // Save assistant message
//     const [assistantInsertResult] = await db.execute(
//       `INSERT INTO conversations (role, content, token_count)
//        VALUES (?, ?, ?)`,
//       ["assistant", text, totalTokens],
//     );

//     // Fetch saved rows
//     const userConversation = await getMessageById(userInsertResult.insertId);

//     const assistantConversation = await getMessageById(
//       assistantInsertResult.insertId,
//     );

//     return {
//       userConversation,
//       assistantConversation,
//     };
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

// $$$$$$$$$$$$$$$$$$$$$$

// CREATE TABLE conversations (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   role VARCHAR(20),
//   content TEXT,
//   token_count INT DEFAULT 0,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
// $$$$$$$$$$$$$$$$$$$$$$$
// ******************
// ******************
// export async function createConversationService(question) {
//   try {
//     //validation
//     if (!question.trim()){
//         const error= new error("question is requried");
//         error.status=400;
//         throw error;
//     }
//     return `chat saved to db with question:${question}`;
//   } catch (error) {
//     throw error;
//   }
// }
