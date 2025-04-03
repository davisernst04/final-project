// components/ChannelView.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Post from "./Post";

function ChannelView() {
  const { channelId } = useParams();
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [channelId]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/channels/${channelId}/posts`,
      );
      setPosts(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch posts.");
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const user_id = JSON.parse(localStorage.getItem("user")).id;
      let imageBase64 = "";

      if (newPostImage) {
        // Convert the image file to a Base64 string
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(newPostImage);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      }

      const postData = {
        user_id,
        channel_id: channelId,
        content: newPostContent,
        image_url: imageBase64, // Include the Base64 string; if no image, it can be an empty string
      };

      const response = await axios.post(
        "http://localhost:8080/api/posts",
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessage(response.data.message);
      setNewPostContent("");
      setNewPostImage(null);
      fetchPosts();
    } catch (err) {
      console.error(err);
      setError("Failed to create post.");
    }
  };

  return (
    <div>
      <h2>Channel Posts</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      <form onSubmit={handleCreatePost}>
        <textarea
          placeholder="Post Content"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          required
        />
        <input
          type="file"
          onChange={(e) => setNewPostImage(e.target.files[0])}
        />
        <button type="submit">Create Post</button>
      </form>
      {posts.map((post) => (
        <Post key={post.id} post={post} fetchPosts={fetchPosts} />
      ))}
    </div>
  );
}

export default ChannelView;
