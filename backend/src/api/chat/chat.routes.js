import express from "express";

const chatRouter=express.Router();

import {creatConversationController,getConversationController,} from "./controller/chat.controller.js"

//api/chat/conversations

// chatRouter.post("/conversation",(req,res)=>{
//     res.send("conversation api post");
// });

chatRouter.post("/conversation", creatConversationController);

// chatRouter.get("/conversation", (req, res) => {
//   res.send("conversation api get");
// });


chatRouter.get("/conversation", getConversationController);

export default chatRouter;
