// components/Post.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Reply from "./Reply";
import Rating from "./Rating";

function Post({ post, fetchPosts }) {
  const [replies, setReplies] = useState([]);
  const [newReplyContent, setNewReplyContent] = useState("");
  const [newReplyImage, setNewReplyImage] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchReplies();
  }, [post.id]);

  const fetchReplies = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/replies?post_id=${post.id}`,
      );
      setReplies(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch replies.");
    }
  };

  const handleCreateReply = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const user_id = JSON.parse(localStorage.getItem("user")).id;

      // If there's an image, convert it to a Base64 string.
      let imageBase64 = "";
      if (newReplyImage) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(newReplyImage);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      }

      const replyData = {
        user_id,
        post_id: post.id,
        content: newReplyContent,
        image_url: imageBase64,
      };

      const response = await axios.post(
        "http://localhost:8080/api/replies",
        replyData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setMessage(response.data.message);
      setNewReplyContent("");
      setNewReplyImage(null);
      fetchReplies();
      fetchPosts();
    } catch (err) {
      console.error(err);
      setError("Failed to create reply.");
    }
  };

  return (
    <div>
      <h3>{post.content}</h3>
      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post Image"
          style={{ maxWidth: "300px" }}
        />
      )}
      <Rating postId={post.id} replyId={null} fetchPosts={fetchPosts} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      <form onSubmit={handleCreateReply}>
        <textarea
          placeholder="Reply Content"
          value={newReplyContent}
          onChange={(e) => setNewReplyContent(e.target.value)}
          required
        />
        <input
          type="file"
          onChange={(e) => setNewReplyImage(e.target.files[0])}
        />
        <button type="submit">Reply</button>
      </form>
      {replies.map((reply) => (
        <Reply
          key={reply.id}
          reply={reply}
          fetchReplies={fetchReplies}
          fetchPosts={fetchPosts}
        />
      ))}
    </div>
  );
}

export default Post;
