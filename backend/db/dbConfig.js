// import "dotenv/config";
// import mysql from "mysql2/promise";

// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// });

// export default db;

if (process.env.NODE_ENV !== "production") {
  import("dotenv/config");
}import mysql from "mysql2/promise";
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT), // 👈 IMPORTANT
  ssl: {
    rejectUnauthorized: false, // 👈 REQUIRED for Aiven
  },
  waitForConnections: true,
  connectionLimit: 10,
});

export default db;