-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  classification VARCHAR(20) DEFAULT 'beginner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create channels table if it doesn't exist
CREATE TABLE IF NOT EXISTS channels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  channel_id INT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  FULLTEXT(content)
);

-- Create replies table if it doesn't exist
CREATE TABLE IF NOT EXISTS replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  parent_reply_id INT,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_reply_id) REFERENCES replies(id) ON DELETE CASCADE
);

-- Create ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT,
  reply_id INT,
  rating TINYINT NOT NULL, -- 0 for downvote, 1 for upvote
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_id) REFERENCES replies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_post_rating (user_id, post_id),
  UNIQUE KEY unique_reply_rating (user_id, reply_id)
);

-- Create admin user if it doesn't exist
INSERT INTO users (name, email, password, role, classification)
SELECT 'Admin', 'admin@example.com', '$2b$10$JqHRBQZQFrB7aKlYHlhcnuWvlMKtKcQYr3/Ow.y5TLxmJJ6e7Wfdy', 'admin', 'expert'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');

-- Create some initial channels if none exist
INSERT INTO channels (name, description, created_by)
SELECT 'JavaScript', 'Discuss JavaScript programming language', 1
WHERE NOT EXISTS (SELECT 1 FROM channels LIMIT 1);

INSERT INTO channels (name, description, created_by)
SELECT 'Python', 'Discuss Python programming language', 1
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE name = 'Python');

INSERT INTO channels (name, description, created_by)
SELECT 'Web Development', 'Discuss web development technologies', 1
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE name = 'Web Development');

