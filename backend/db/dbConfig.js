// import "dotenv/config";
// import mysql from "mysql2/promise";

// // 1. Log the variables to verify they are coming from .env
// console.log("--- DB Config Load ---");
// console.log("Host:", process.env.DB_HOST);
// console.log("User:", process.env.DB_USER);
// console.log("DB Name:", process.env.DB_DATABASE);
// // console.log("Password:", process.env.DB_PASSWORD); // Hidden for security

// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// });

// // 2. Export the pool
// export default db;

import "dotenv/config";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export default db;

// import "dotenv/config";
// import mysql from "mysql2/promise";

// const db = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// });
// console.log({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB.USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// });
// export default db;
