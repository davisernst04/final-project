import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PostForm from "./PostForm";
import ConfirmationModal from "./ConfirmationModal";
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
        // First, check if the channel exists
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

        // Then fetch posts for this channel
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

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/api/posts/${postId}`);
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post. Please try again.");
    }
  };

  const [editingPost, setEditingPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleEditPost = (post) => {
    setEditingPost(post);
    window.scrollTo(0, 0);
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

      {editingPost ? (
        <PostForm
          channelId={channelId}
          existingPost={editingPost}
          onCancel={() => setEditingPost(null)}
          onSuccess={() => {
            setEditingPost(null);
            fetchPosts();
          }}
        />
      ) : (
        <PostForm channelId={channelId} onSuccess={fetchPosts} />
      )}

      <h3 className="mt-4">Posts</h3>

      {posts.length === 0 ? (
        <div className="alert alert-info">
          No posts in this channel yet. Be the first to post!
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              fetchPosts={fetchPosts}
              onEdit={() => handleEditPost(post)}
              onDelete={() => {
                setSelectedPost(post.id);
                setShowDeleteModal(true);
              }}
            />
          ))}
        </div>
      )}

      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await handleDeletePost(selectedPost);
          setShowDeleteModal(false);
        }}
        message="Are you sure you want to delete this post?"
      />
    </div>
  );
};

export default ChannelPage;
