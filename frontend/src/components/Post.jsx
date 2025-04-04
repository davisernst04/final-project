import { useState, useEffect } from "react";
import Reply from "./Reply";
import Rating from "./Rating";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

function Post({ post, fetchPosts, onEdit, onDelete }) {
  const [replies, setReplies] = useState([]);
  const [newReplyContent, setNewReplyContent] = useState("");
  const [newReplyImage, setNewReplyImage] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [postUser, setPostUser] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchReplies();
    fetchPostUser();
  }, [post.id]);

  const fetchPostUser = async () => {
    try {
      const response = await api.get(`/api/users/${post.user_id}`);
      setPostUser(response.data);
    } catch (err) {
      console.error("Error fetching post user:", err);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await api.get(`/api/replies`, {
        params: { post_id: post.id },
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
    setLoading(true);

    try {
      if (!user) {
        setError("You must be logged in to reply");
        return;
      }

      // If there's an image, convert it to a Base64 string.
      let imageBase64 = "";
      if (newReplyImage) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(newReplyImage);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      }

      const replyData = {
        user_id: user.id,
        post_id: post.id,
        content: newReplyContent,
        image_url: imageBase64,
      };

      const response = await api.post("/api/replies", replyData);
      setMessage(response.data.message);
      setNewReplyContent("");
      setNewReplyImage(null);
      fetchReplies();
      if (fetchPosts) fetchPosts();
    } catch (err) {
      console.error(err);
      setError("Failed to create reply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        {postUser && (
          <div className="d-flex align-items-center mb-2">
            <strong>{postUser.name}</strong>
            {postUser.classification && (
              <span
                className={`badge ms-2 bg-${getClassificationColor(postUser.classification)}`}
              >
                {postUser.classification}
              </span>
            )}
          </div>
        )}
        <h5 className="card-title">{post.content}</h5>
        {post.image_url && (
          <img
            src={post.image_url || "/placeholder.svg"}
            alt="Post Image"
            className="img-fluid mb-3"
            style={{ maxWidth: "100%", maxHeight: "400px" }}
          />
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Rating postId={post.id} replyId={null} fetchPosts={fetchPosts} />

          <div>
            {onEdit && (
              <button
                className="btn btn-sm btn-secondary me-2"
                onClick={onEdit}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button className="btn btn-sm btn-danger" onClick={onDelete}>
                Delete
              </button>
            )}
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <form onSubmit={handleCreateReply} className="mb-3">
          <div className="mb-3">
            <label htmlFor={`reply-${post.id}`} className="form-label">
              Reply to this post:
            </label>
            <textarea
              id={`reply-${post.id}`}
              className="form-control"
              placeholder="Write your reply here..."
              value={newReplyContent}
              onChange={(e) => setNewReplyContent(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor={`image-${post.id}`} className="form-label">
              Add an image (optional):
            </label>
            <input
              id={`image-${post.id}`}
              type="file"
              className="form-control"
              onChange={(e) => setNewReplyImage(e.target.files[0])}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Reply"}
          </button>
        </form>

        <div className="mt-4">
          <h6>Replies ({replies.length})</h6>
          {replies.length === 0 ? (
            <p className="text-muted">No replies yet.</p>
          ) : (
            replies.map((reply) => (
              <Reply
                key={reply.id}
                reply={reply}
                fetchReplies={fetchReplies}
                fetchPosts={fetchPosts}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get badge color based on classification
function getClassificationColor(classification) {
  switch (classification) {
    case "beginner":
      return "success";
    case "intermediate":
      return "primary";
    case "expert":
      return "danger";
    default:
      return "secondary";
  }
}

export default Post;
