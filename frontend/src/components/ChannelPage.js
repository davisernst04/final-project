import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PostForm from "./PostForm";
import api from "../utils/api";
import Post from "./Post";

const ChannelPage = () => {
  const { channelId } = useParams();
  const [channel, setChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const channelRes = await api
          .get(`/api/channels/${channelId}`)
          .catch((err) => {
            if (err.response && err.response.status === 404) {
              throw new Error(
                "Channel not found. It may have been deleted or you may have entered an invalid URL.",
              );
            }
            throw err;
          });

        setChannel(channelRes.data);

        const postsRes = await api.get(`/api/channels/${channelId}/posts`);
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Error fetching channel data:", err);
        setError(
          err.message || "Failed to load channel data. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [channelId]);

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/api/channels/${channelId}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  if (loading) {
    return <div className="text-center my-5">Loading channel...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h4>Error</h4>
        <p>{error}</p>
        <button
          className="btn btn-primary mt-2"
          onClick={() => (window.location.href = "/channels")}
        >
          Return to Channels List
        </button>
      </div>
    );
  }

  return (
    <div>
      {channel && (
        <div className="mb-4">
          <h2>{channel.name}</h2>
          <p className="text-muted">{channel.description}</p>
        </div>
      )}

      <PostForm channelId={channelId} onSuccess={fetchPosts} />

      <h3 className="mt-4">Posts</h3>

      {posts.length === 0 ? (
        <div className="alert alert-info">
          No posts in this channel yet. Be the first to post!
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <Post key={post.id} post={post} fetchPosts={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChannelPage;
