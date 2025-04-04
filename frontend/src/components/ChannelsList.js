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

  if (loading) {
    return <div className="text-center my-5">Loading channels...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Channels</h2>
        {user && (
          <Link to="/create-channel" className="btn btn-primary">
            Create Channel
          </Link>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {channels.length === 0 ? (
        <div className="alert alert-info">
          No channels available.{" "}
          {user && <Link to="/create-channel">Create your first channel</Link>}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChannelsList;
