import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ChannelsPage = () => {
  const [channels, setChannels] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/channels")
      .then((res) => setChannels(res.data))
      .catch((err) => console.error(err));
  }, []);

  const createChannel = () => {
    // For demonstration; in a real app include user ID and token
    axios
      .post("http://localhost:8080/api/channels", {
        name,
        description,
        created_by: 1,
      })
      .then(() => window.location.reload())
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h1>Channels</h1>
      <ul>
        {channels.map((channel) => (
          <li key={channel.id}>
            <Link to={`/channels/${channel.id}`}>{channel.name}</Link>
          </li>
        ))}
      </ul>
      <h2>Create Channel</h2>
      <input
        type="text"
        placeholder="Channel Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={createChannel}>Create</button>
    </div>
  );
};

export default ChannelsPage;
