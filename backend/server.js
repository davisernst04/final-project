const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const app = express();

const HOST = "0.0.0.0";
const PORT = 8080;

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
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  try {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, password_hash],
    );
    res.json({ message: "Account created", userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- CHANNELS ENDPOINTS -----
// Create a channel
app.post("/api/channels", async (req, res) => {
  const { name, description, created_by } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO channels (name, description, created_by) VALUES (?, ?, ?)",
      [name, description, created_by],
    );
    res.json({ message: "Channel created", channelId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all channels
app.get("/api/channels", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM channels");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- POSTS & REPLIES ENDPOINTS -----
// Create a post in a channel
app.post("/api/posts", async (req, res) => {
  const { user_id, channel_id, content, image_url } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO posts (user_id, channel_id, content, image_url) VALUES (?, ?, ?, ?)",
      [user_id, channel_id, content, image_url],
    );
    res.json({ message: "Post created", postId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get posts in a channel
app.get("/api/channels/:channelId/posts", async (req, res) => {
  const { channelId } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM posts WHERE channel_id = ?", [
      channelId,
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a reply to a post (or to another reply if parent_reply_id is provided)
app.post("/api/replies", async (req, res) => {
  const { user_id, post_id, parent_reply_id, content, image_url } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO replies (user_id, post_id, parent_reply_id, content, image_url) VALUES (?, ?, ?, ?, ?)",
      [user_id, post_id, parent_reply_id || null, content, image_url],
    );
    res.json({ message: "Reply created", replyId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a rating to a post or reply
app.post("/api/ratings", async (req, res) => {
  const { user_id, post_id, reply_id, rating } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO ratings (user_id, post_id, reply_id, rating) VALUES (?, ?, ?, ?)",
      [user_id, post_id || null, reply_id || null, rating],
    );
    res.json({ message: "Rating submitted", ratingId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- SEARCH ENDPOINT (Example) -----
// Search posts by content
app.get("/api/search/posts", async (req, res) => {
  const { q } = req.query;
  try {
    const [rows] = await db.query(
      "SELECT * FROM posts WHERE MATCH(content) AGAINST(? IN NATURAL LANGUAGE MODE)",
      [q],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
