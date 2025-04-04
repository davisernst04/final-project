const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const app = express();

const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors({ origin: "http://localhost:3000" }));

// Database pool
const db = mysql.createPool({
  host: process.env.DB_HOST || "database",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_DATABASE || "project",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
app.use(async (req, res, next) => {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log("Database connection successful");
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Database connection error" });
    }
  }
});

app.post("/api/register", async (req, res) => {
  const { name, email, password, classification } = req.body;

  try {
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role, classification) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, "user", classification || "beginner"],
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.get("/api/search/advanced", async (req, res) => {
  const { q, email } = req.query;
  try {
    if (q) {
      const searchTerm = `%${q}%`;
      const [posts] = await db.query(
        "SELECT * FROM posts WHERE content LIKE ?",
        [searchTerm],
      );
      res.json({ posts });
    } else if (email) {
      const [posts] = await db.query(
        "SELECT p.* FROM posts p JOIN users u ON p.user_id = u.id WHERE u.email = ?",
        [email],
      );
      res.json({ posts });
    } else {
      res
        .status(400)
        .json({ message: "Please provide a query string (q) or an email." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/search/user-most-posts", async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT u.*, COUNT(p.id) AS postCount FROM users u LEFT JOIN posts p ON u.id = p.user_id GROUP BY u.id ORDER BY postCount DESC LIMIT 1",
    );
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/search/user-highest-rating", async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT u.*, 
          (IFNULL(r.thumbs_up,0) - IFNULL(r.thumbs_down,0)) AS ratingScore 
       FROM users u
       LEFT JOIN (
         SELECT user_id, 
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS thumbs_up,
                SUM(CASE WHEN rating = 0 THEN 1 ELSE 0 END) AS thumbs_down
         FROM ratings
         GROUP BY user_id
       ) AS r ON u.id = r.user_id
       ORDER BY ratingScore DESC LIMIT 1`,
    );
    res.json(result[0]);
  } catch (error) {
    console.error("User highest rating error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/search/user-least-posts", async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT u.*, COUNT(p.id) AS postCount FROM users u LEFT JOIN posts p ON u.id = p.user_id GROUP BY u.id ORDER BY postCount ASC LIMIT 1",
    );
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/search/user-lowest-rating", async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT u.*, 
          (IFNULL(r.thumbs_up, 0) - IFNULL(r.thumbs_down, 0)) AS ratingScore 
       FROM users u
       LEFT JOIN (
         SELECT user_id, 
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS thumbs_up,
                SUM(CASE WHEN rating = 0 THEN 1 ELSE 0 END) AS thumbs_down
         FROM ratings
         GROUP BY user_id
       ) AS r ON u.id = r.user_id
       ORDER BY ratingScore ASC LIMIT 1`,
    );
    res.json(result[0]);
  } catch (error) {
    console.error("User lowest rating error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/ratings/aggregate", async (req, res) => {
  const { post_id, reply_id } = req.query;
  if (!post_id && !reply_id) {
    return res
      .status(400)
      .json({ message: "post_id or reply_id is required." });
  }
  try {
    let query, params;
    if (post_id) {
      query = `SELECT 
                 SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS thumbs_up,
                 SUM(CASE WHEN rating = 0 THEN 1 ELSE 0 END) AS thumbs_down
               FROM ratings WHERE post_id = ?`;
      params = [post_id];
    } else {
      query = `SELECT 
                 SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS thumbs_up,
                 SUM(CASE WHEN rating = 0 THEN 1 ELSE 0 END) AS thumbs_down
               FROM ratings WHERE reply_id = ?`;
      params = [reply_id];
    }
    const [result] = await db.query(query, params);
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      {
        expiresIn: "1h",
      },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        classification: user.classification,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.get("/api/users/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role, classification FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: err.message });
  }
});

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
    process.env.JWT_SECRET || "your_jwt_secret_key_here",
    (err, user) => {
      if (err)
        return res.status(403).json({ message: "Invalid or expired token" });

      req.user = user;
      next();
    },
  );
};

app.get("/api/protected", authenticateToken, async (req, res) => {
  try {
    // Get the full user data from the database
    const [users] = await db.query(
      "SELECT id, name, email, role, classification FROM users WHERE id = ?",
      [req.user.id],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    res.json({
      message: "You have access to this protected route!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        classification: user.classification || "beginner",
      },
    });
  } catch (error) {
    console.error("Protected route error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/channels", authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id; // Get user ID from authenticated token

  try {
    const [result] = await db.query(
      "INSERT INTO channels (name, description, created_by) VALUES (?, ?, ?)",
      [name, description, userId],
    );

    res.json({
      message: "Channel created successfully",
      channel: {
        id: result.insertId,
        name,
        description,
        created_by: userId,
      },
    });
  } catch (err) {
    console.error("Channel creation error:", err);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

app.get("/api/channels", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM channels");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/channels/:channelId", async (req, res) => {
  const { channelId } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM channels WHERE id = ?", [
      channelId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/channels/:channelId", authenticateToken, async (req, res) => {
  const { channelId } = req.params;
  const { name, description } = req.body;

  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can update channels" });
    }

    const [result] = await db.query(
      "UPDATE channels SET name = ?, description = ? WHERE id = ?",
      [name, description, channelId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.json({ message: "Channel updated successfully" });
  } catch (err) {
    console.error("Error updating channel:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post(
  "/api/posts",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    const { channel_id, content } = req.body;
    const user_id = req.user.id;

    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
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
  },
);

app.use("/uploads", express.static("uploads"));

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

app.post(
  "/api/replies",
  upload.single("image"), // Add multer middleware for file upload
  async (req, res) => {
    const { user_id, post_id, parent_reply_id, content } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Get uploaded file path

    try {
      const [result] = await db.query(
        "INSERT INTO replies (user_id, post_id, parent_reply_id, content, image_url) VALUES (?, ?, ?, ?, ?)",
        [user_id, post_id, parent_reply_id || null, content, image_url],
      );
      res.json({ message: "Reply created", replyId: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.get("/api/replies", async (req, res) => {
  const { post_id, parent_reply_id } = req.query;

  try {
    let query = "SELECT * FROM replies";
    const params = [];

    if (post_id && !parent_reply_id) {
      query += " WHERE post_id = ? AND parent_reply_id IS NULL";
      params.push(post_id);
    } else if (post_id && parent_reply_id) {
      query += " WHERE post_id = ? AND parent_reply_id = ?";
      params.push(post_id, parent_reply_id);
    } else if (parent_reply_id) {
      query += " WHERE parent_reply_id = ?";
      params.push(parent_reply_id);
    } else {
      return res
        .status(400)
        .json({ error: "Either post_id or parent_reply_id is required." });
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ratings", async (req, res) => {
  const { user_id, post_id, reply_id, rating } = req.body;

  if (![0, 1].includes(rating)) {
    return res.status(400).json({ message: "Rating must be 0 or 1" });
  }

  try {
    const [existing] = await db.query(
      post_id
        ? "SELECT * FROM ratings WHERE user_id = ? AND post_id = ?"
        : "SELECT * FROM ratings WHERE user_id = ? AND reply_id = ?",
      [user_id, post_id || reply_id],
    );

    if (existing.length > 0) {
      if (existing[0].rating === rating) {
        await db.query("DELETE FROM ratings WHERE id = ?", [existing[0].id]);
      } else {
        await db.query("UPDATE ratings SET rating = ? WHERE id = ?", [
          rating,
          existing[0].id,
        ]);
      }
    } else {
      await db.query(
        "INSERT INTO ratings (user_id, post_id, reply_id, rating) VALUES (?, ?, ?, ?)",
        [user_id, post_id || null, reply_id || null, rating],
      );
    }

    res.json({ message: "Rating updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.get("/api/search/posts", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3)
      return res.status(400).json({ error: "Query too short" });

    const searchTerm = `+${String(q)}*`;

    const [rows] = await db.query(
      `SELECT *, MATCH(content) AGAINST(? IN BOOLEAN MODE) AS score 
       FROM posts 
       WHERE MATCH(content) AGAINST(? IN BOOLEAN MODE)
       ORDER BY score DESC`,
      [searchTerm, searchTerm],
    );

    res.json(rows);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

const isAdmin = (req, res, next) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
