// components/ChannelForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api"; // Import the api utility instead of axios
import { useAuth } from "../context/AuthContext";

const ChannelForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { channelId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    // If channelId is provided, we're editing an existing channel
    if (channelId) {
      setIsEditing(true);
      fetchChannel();
    }
  }, [channelId]);

  const fetchChannel = async () => {
    try {
      const response = await api.get(`/api/channels/${channelId}`);
      const channel = response.data;
      setName(channel.name);
      setDescription(channel.description);
    } catch (err) {
      console.error("Error fetching channel:", err);
      setError("Failed to load channel data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const channelData = {
        name,
        description,
        created_by: user.id,
      };

      if (isEditing) {
        await api.put(`/api/channels/${channelId}`, channelData);
      } else {
        await api.post("/api/channels", channelData);
      }
      navigate("/channels");
    } catch (err) {
      console.error("Error saving channel:", err);
      setError("Failed to save channel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4">
      <h2>{isEditing ? "Edit Channel" : "Create New Channel"}</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Channel Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? "Saving..."
              : isEditing
                ? "Update Channel"
                : "Create Channel"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/channels")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChannelForm;
