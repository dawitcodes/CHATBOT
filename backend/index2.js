// import express from "express";
// import db from "./db/dbConfig";
// const app = express();

// // Logger middleware
// function logger(req, res, next) {
//   const url = req.url;
//   const method = req.method;

//   console.log(method, url);

//   next();
// }

// // Error handler middleware
// function errorHandler(err, req, res, next) {
//   console.log(err.message);

//   res.status(500).send("Internal server error");
// }

// // Apply middleware globally
// app.use(logger);

// // Home route
// app.get("/", (req, res) => {
//   res.send("HELLO WORLD");
// });

// // About route
// app.get("/about", (req, res) => {
//   throw new Error("about router error");
// });

// // Chat route
// app.get("/api/chat", (req, res) => {
//   res.send("HELLO WORLD from chat route");
// });

// // Conversation route
// app.get("/api/conversation", (req, res) => {
//   res.send("HELLO WORLD from conversation route");
// });

// // Error middleware should be last
// app.use(errorHandler);

// // Server
// app.listen(3888, () => {
//   console.log("Server is running on http://localhost:3888");
// });
// import express from "express";

// const app = express();

// function logger(){
//     const url=req.url;
//     const method = req.method;
//     console.log(url, method);
// }

// app.get("/",(req,res)=>{
//     logger(req);
//     res.send("HELLO WORLD")
// })

// app.get("/about",(req,res)=>{
//     logger(req);
//     res.send("HELLO WORLD from about route")
// })

// app.get("/api/chat", (req, res) => {
//     logger(req);
//   res.send("HELLO WORLD from chat route ");
// });

// app.get("/api/conversation", (req, res) => {
//     logger(req);
//   res.send("HELLO WORLD from conversation route");
// });

// app.listen(3888, ()=>{
//     console.log("server is running on port http://localhost:3888");
// })
