const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

const HOST = "0.0.0.0";
const PORT = 8080;

app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(cors());
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
// Updated registration endpoint
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );

    // Set content-type header explicitly
    res.setHeader("Content-Type", "application/json");
    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    // Set content-type header explicitly
    res.setHeader("Content-Type", "application/json");
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Login User
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = users[0];

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1h" },
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      stack: error.stack, // Remove in production
    });
  }
});

// Middleware to Protect Routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied, token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_secret_key",
    (err, user) => {
      if (err)
        return res.status(403).json({ message: "Invalid or expired token" });

      req.user = user;
      next();
    },
  );
};

// ✅ Protected Route Example
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "You have access to this protected route!",
    user: req.user,
  });
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
  const { channel_id, content, image_url } = req.body;
  const user_id = req.body.user_id;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO posts (user_id, channel_id, content, image_url) VALUES (?, ?, ?, ?)",
      [user_id, channel_id, content, image_url],
    );
    res.json({ message: "Post created", postId: result.insertId });
  } catch (err) {
    console.error("Error creating post:", err);
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

// Add this GET endpoint in your server.js
// In your server.js (or wherever your routes are defined)
app.get("/api/replies", async (req, res) => {
  const { post_id, parent_reply_id } = req.query;

  // Ensure that at least one of post_id or parent_reply_id is provided.
  if (!post_id && !parent_reply_id) {
    return res
      .status(400)
      .json({ error: "Either post_id or parent_reply_id is required" });
  }

  try {
    let query = "SELECT * FROM replies";
    const params = [];

    // Add conditions based on the provided parameters
    if (post_id && parent_reply_id) {
      query += " WHERE post_id = ? AND parent_reply_id = ?";
      params.push(post_id, parent_reply_id);
    } else if (post_id) {
      query += " WHERE post_id = ?";
      params.push(post_id);
    } else if (parent_reply_id) {
      query += " WHERE parent_reply_id = ?";
      params.push(parent_reply_id);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example GET endpoint for ratings by post_id or reply_id
// Add or update a rating for a post or reply
app.post("/api/ratings", async (req, res) => {
  const { user_id, post_id, reply_id, rating } = req.body;

  try {
    // Check if the rating value is valid before proceeding
    if (rating !== null && rating !== 0 && rating !== 1) {
      return res
        .status(400)
        .json({
          message:
            "Rating must be '1' for upvote, '0' for downvote, or null to remove rating.",
        });
    }

    // Check if there's an existing rating by this user for this post/reply
    const [existingRatings] = await db.query(
      "SELECT * FROM ratings WHERE user_id = ? AND (post_id = ? OR reply_id = ?)",
      [user_id, post_id || null, reply_id || null],
    );

    if (existingRatings.length > 0) {
      const existingRating = existingRatings[0];

      if (rating === null) {
        // If rating is null, delete the existing rating
        await db.query("DELETE FROM ratings WHERE id = ?", [existingRating.id]);
        return res.json({ message: "Rating removed" });
      }

      // If a rating already exists, update it
      await db.query("UPDATE ratings SET rating = ? WHERE id = ?", [
        rating,
        existingRating.id,
      ]);
      return res.json({ message: "Rating updated" });
    }

    // If no existing rating, insert a new one
    await db.query(
      "INSERT INTO ratings (user_id, post_id, reply_id, rating) VALUES (?, ?, ?, ?)",
      [user_id, post_id || null, reply_id || null, rating],
    );

    res.json({ message: "Rating submitted" });
  } catch (err) {
    console.error("Error handling rating:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get Ratings for a Post or Reply
app.get("/api/ratings", async (req, res) => {
  const { post_id, reply_id } = req.query;
  if (!post_id && !reply_id) {
    return res
      .status(400)
      .json({ message: "post_id or reply_id is required." });
  }
  try {
    const [ratings] = await db.query(
      "SELECT user_id, rating FROM ratings WHERE post_id = ? OR reply_id = ?",
      [post_id || null, reply_id || null],
    );
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Admin middleware
const isAdmin = (req, res, next) => {
  const user = req.user;
  if (!user || user.email !== "admin@admin.com") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// Admin routes (protected by isAdmin middleware)
app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, name, email FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/channels", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [channels] = await db.query("SELECT * FROM channels");
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/posts", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [posts] = await db.query("SELECT * FROM posts");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/replies", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [replies] = await db.query("SELECT * FROM replies");
    res.json(replies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete(
  "/api/admin/users/:userId",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      await db.query("DELETE FROM users WHERE id = ?", [req.params.userId]);
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.delete(
  "/api/admin/channels/:channelId",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      await db.query("DELETE FROM channels WHERE id = ?", [
        req.params.channelId,
      ]);
      res.json({ message: "Channel deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.delete(
  "/api/admin/posts/:postId",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      await db.query("DELETE FROM posts WHERE id = ?", [req.params.postId]);
      res.json({ message: "Post deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.delete(
  "/api/admin/replies/:replyId",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      await db.query("DELETE FROM replies WHERE id = ?", [req.params.replyId]);
      res.json({ message: "Reply deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
