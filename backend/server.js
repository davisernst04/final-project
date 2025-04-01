const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 8080;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "mysql",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "example",
  database: process.env.MYSQL_DATABASE || "testdb",
});

// Simple route to test DB connection
app.get("/api/data", (req, res) => {
  pool.query("SELECT NOW() as now", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ currentTime: results[0].now });
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
