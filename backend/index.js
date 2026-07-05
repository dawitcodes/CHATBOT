

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import db from "./db/dbConfig.js";
import mainRouter from "./src/api/main.route.js";
import cors from "cors";
import { errorHandler } from "./src/middleware/error-handler.js";

// app.post("api/chat/conversations",(req,res)=>{res.send("post method")})
//  app.get("api/chat/conversations",(req,res)=>{res.send("get method")})
const app = express();

app.use(cors({
  origin: "*"  
}))
// http://localhost:5173
app.use(express.json());

// app.use(express.urlencoded({ extended: true }));
app.use("/api",mainRouter);
app.use(errorHandler);

async function startServer() {
  try {
    // Establishing database connection
    const connection = await db.getConnection();
    connection.release();
    console.log("Db connected");
const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) throw err;

  console.log(`Server is running on port ${PORT}`);
});
    // Starting the Express server
  } catch (error) {
    // Catching any errors during connection or startup
    console.error("Error starting server:", error.message);
  }
}

startServer();
