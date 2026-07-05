import {
  createConversationService,
  getRecentConversationRows,
} from "../service/chat.service.js";

export async function creatConversationController(req, res) {
  try {
    const { question } = req.body;

    // Validate question
    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      
      });
    }

    const result = await createConversationService(question.trim());

    return res.status(200).json({
      success: true,
      message: "Conversation posted successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Create Conversation Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

export async function getConversationController(req, res) {
  try {
    const result = await getRecentConversationRows(100);

    return res.status(200).json({
      success: true,
      message: "Conversations fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Get Conversation Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}



















// import { createConversationService,getRecentConversationRows} from "../service/chat.service.js";

// // async function main() {
// //   const response = await geminiClient.models.generateContent({
// //     model: "gemini-3-flash-preview",
// //     contents: "Explain how AI works in a few words",
// //   });
// //   console.log(response.text);
// // }
// // main();

// export async function creatConversationController(req,res){
//     try{
//         const{question}=req.body;
//         // console.log(req.body);

//         const result=await createConversationService(question);
//         res.status(200).json({
//             success:true,
//             message:"conversation posted successfully.",

//             data:result,
//         });
//     }catch(error){
//         throw error;
//     }

//     // console.log(req.body);
//     // throw new Error ("something went wrong try again later")
//     // res.send("create conversation api");
// }

// export async function getConversationController(req,res){

//     try {
//         const result = await getRecentConversationRows(100);
//         res.status(200).json({
//           success: true,
//           message: "Conversations fetched successfully.",
//           data: result,
//         });
//     } catch (error) {
//       throw error;
//     }
// }
