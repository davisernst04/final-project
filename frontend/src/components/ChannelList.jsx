// components/ChannelList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ChannelList() {
  const [channels, setChannels] = useState([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/channels");
      setChannels(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch channels.");
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const created_by = JSON.parse(localStorage.getItem("user")).id;
      const response = await axios.post(
        "http://localhost:8080/api/channels",
        {
          name: newChannelName,
          description: newChannelDescription,
          created_by,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessage(response.data.message);
      setNewChannelName("");
      setNewChannelDescription("");
      fetchChannels();
    } catch (err) {
      console.error(err);
      setError("Failed to create channel.");
    }
  };

  return (
    <div>
      <h2>Channels</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      <ul>
        {channels.map((channel) => (
          <li key={channel.id}>
            <Link to={`/channels/${channel.id}`}>{channel.name}</Link> -{" "}
            {channel.description}
          </li>
        ))}
      </ul>
      <form onSubmit={handleCreateChannel}>
        <input
          type="text"
          placeholder="Channel Name"
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newChannelDescription}
          onChange={(e) => setNewChannelDescription(e.target.value)}
        />
        <button type="submit">Create Channel</button>
      </form>
    </div>
  );
}

export default ChannelList;
