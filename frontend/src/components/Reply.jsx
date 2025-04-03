// components/Reply.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Rating from "./Rating";

function Reply({ reply, fetchReplies, fetchPosts }) {
  const [replies, setReplies] = useState([]);
  const [newReplyContent, setNewReplyContent] = useState("");
  const [newReplyImage, setNewReplyImage] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchNestedReplies();
  }, [reply.id]);

  const fetchNestedReplies = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/replies", {
        params: { parent_reply_id: reply.id },
      });
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

      // Convert file to Base64 if an image is provided.
      let imageBase64 = "";
      if (newReplyImage) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(newReplyImage);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      }

      // Build the JSON payload.
      const replyData = {
        user_id,
        post_id: reply.post_id,
        parent_reply_id: reply.id,
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
      fetchNestedReplies();
      fetchReplies();
      fetchPosts();
    } catch (err) {
      console.error(err);
      setError("Failed to create reply.");
    }
  };

  return (
    <div style={{ marginLeft: "20px" }}>
      <p>{reply.content}</p>
      {reply.image_url && (
        <img
          src={reply.image_url}
          alt="Reply Image"
          style={{ maxWidth: "200px" }}
        />
      )}
      <Rating
        postId={null}
        replyId={reply.id}
        fetchReplies={fetchReplies}
        fetchPosts={fetchPosts}
      />
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
      {replies.map((nestedReply) => (
        <Reply
          key={nestedReply.id}
          reply={nestedReply}
          fetchReplies={fetchReplies}
          fetchPosts={fetchPosts}
        />
      ))}
    </div>
  );
}

export default Reply;
