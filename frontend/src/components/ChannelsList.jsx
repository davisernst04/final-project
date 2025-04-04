import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const ChannelsList = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/channels");
        setChannels(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching channels:", err);
        setError("Failed to load channels. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  const handleDelete = async (channelId) => {
    try {
      await api.delete(`/api/admin/channels/${channelId}`);
      setChannels(channels.filter((c) => c.id !== channelId));
    } catch (err) {
      console.error("Error deleting channel:", err);
      setError("Failed to delete channel. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center my-5">Loading channels...</div>;
  }

  return (
    <div>
      <h2>Channels</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {channels.length === 0 ? (
        <div className="alert alert-info">
          No channels available.{" "}
          {user?.role === "admin" && (
            <Link to="/create-channel">Create a channel</Link>
          )}
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {channels.map((channel) => (
            <div key={channel.id} className="col">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">
                    <Link to={`/channels/${channel.id}`}>{channel.name}</Link>
                  </h5>
                  <p className="card-text">{channel.description}</p>
                  {user?.role === "admin" && (
                    <div className="mt-2">
                      <Link
                        to={`/channels/${channel.id}/edit`}
                        className="btn btn-sm btn-warning me-2"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(channel.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {user?.role === "admin" && (
        <div className="mt-4">
          <Link to="/create-channel" className="btn btn-primary">
            Create New Channel
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChannelsList;
