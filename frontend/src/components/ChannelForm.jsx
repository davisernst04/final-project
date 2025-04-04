// components/ChannelForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // If making API calls
import { useAuth } from "../context/AuthContext"; // For auth-related components

const ChannelForm = ({ existingChannel }) => {
  const [name, setName] = useState(existingChannel?.name || "");
  const [description, setDescription] = useState(
    existingChannel?.description || "",
  );
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const channelData = { name, description };

    try {
      if (existingChannel) {
        await axios.put(`/api/channels/${existingChannel.id}`, channelData);
      } else {
        await axios.post("/api/channels", channelData);
      }
      navigate("/channels");
    } catch (error) {
      console.error("Error saving channel:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3">
      <div className="mb-3">
        <label>Channel Name</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label>Description</label>
        <textarea
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary">
        {existingChannel ? "Update" : "Create"} Channel
      </button>
    </form>
  );
};

export default ChannelForm;
