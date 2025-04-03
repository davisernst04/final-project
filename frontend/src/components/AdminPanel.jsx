// components/AdminPanel.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const usersResponse = await axios.get(
        "http://localhost:8080/api/admin/users",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const channelsResponse = await axios.get(
        "http://localhost:8080/api/admin/channels",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const postsResponse = await axios.get(
        "http://localhost:8080/api/admin/posts",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const repliesResponse = await axios.get(
        "http://localhost:8080/api/admin/replies",
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUsers(usersResponse.data);
      setChannels(channelsResponse.data);
      setPosts(postsResponse.data);
      setReplies(repliesResponse.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch admin data.");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("User deleted successfully.");
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to delete user.");
    }
  };

  const handleDeleteChannel = async (channelId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8080/api/admin/channels/${channelId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessage("Channel deleted successfully.");
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to delete channel.");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Post deleted successfully.");
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to delete post.");
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/admin/replies/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Reply deleted successfully.");
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to delete reply.");
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <h3>Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email}) -{" "}
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Channels</h3>
      <ul>
        {channels.map((channel) => (
          <li key={channel.id}>
            {channel.name} -{" "}
            <button onClick={() => handleDeleteChannel(channel.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h3>Posts</h3>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            {post.content.substring(0, 50)}... -{" "}
            <button onClick={() => handleDeletePost(post.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Replies</h3>
      <ul>
        {replies.map((reply) => (
          <li key={reply.id}>
            {reply.content.substring(0, 50)}... -{" "}
            <button onClick={() => handleDeleteReply(reply.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanel;
