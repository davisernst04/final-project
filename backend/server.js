const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const app = express();

const HOST = "0.0.0.0";
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

const pool = mysql.createPool({
  host: "database",
  user: "root",
  password: "admin",
  database: "project",
  port: 3306,
});

const db = pool.promise();

db.getConnection()
  .then((connection) => {
    console.log("Connected to MySQL database");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  });

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
