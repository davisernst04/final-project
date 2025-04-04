import { useState, useEffect } from "react";
import api from "../utils/api";
import Rating from "./Rating";
import { useAuth } from "../context/AuthContext";

function Reply({ reply, fetchReplies, fetchPosts }) {
  const [replies, setReplies] = useState([]);
  const [newReplyContent, setNewReplyContent] = useState("");
  const [newReplyImage, setNewReplyImage] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { user } = useAuth();
  const [postUser, setPostUser] = useState(null);

  useEffect(() => {
    fetchNestedReplies();
  }, [reply.id]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/api/users/${reply.user_id}`);
        setPostUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [reply.user_id]);

  const fetchNestedReplies = async () => {
    try {
      const response = await api.get("/api/replies", {
        params: { parent_reply_id: reply.id },
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

      // Convert file to Base64 if an image is provided.
      let imageBase64 = "";
      if (newReplyImage) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(newReplyImage);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      }

      // Build the JSON payload.
      const replyData = {
        user_id: user.id,
        post_id: reply.post_id,
        parent_reply_id: reply.id,
        content: newReplyContent,
        image_url: imageBase64,
      };

      const response = await api.post("/api/replies", replyData);

      setMessage(response.data.message);
      setNewReplyContent("");
      setNewReplyImage(null);
      setShowReplyForm(false);
      fetchNestedReplies();
      if (fetchReplies) fetchReplies();
      if (fetchPosts) fetchPosts();
    } catch (err) {
      console.error(err);
      setError("Failed to create reply.");
    } finally {
      setLoading(false);
    }
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case "Admin":
        return "danger";
      case "Moderator":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <div className="ms-3 mt-3 p-2 border-start">
      {postUser && (
        <div className="d-flex align-items-center mb-2">
          <small className="text-muted">
            <strong>{postUser.name}</strong>
            {postUser.classification && (
              <span
                className={`badge ms-2 bg-${getClassificationColor(postUser.classification)}`}
              >
                {postUser.classification}
              </span>
            )}
          </small>
        </div>
      )}
      <p className="mb-2">{reply.content}</p>
      {reply.image_url && (
        <img
          src={reply.image_url || "/placeholder.svg"}
          alt="Reply Image"
          className="img-fluid mb-2"
          style={{ maxWidth: "100%", maxHeight: "300px" }}
        />
      )}

      <div className="d-flex justify-content-between align-items-center mb-2">
        <Rating
          postId={null}
          replyId={reply.id}
          fetchReplies={fetchReplies}
          fetchPosts={fetchPosts}
        />

        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          {showReplyForm ? "Cancel" : "Reply"}
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {message && <div className="alert alert-success py-2">{message}</div>}

      {showReplyForm && (
        <form onSubmit={handleCreateReply} className="mb-3">
          <div className="mb-2">
            <textarea
              className="form-control"
              placeholder="Write your reply here..."
              value={newReplyContent}
              onChange={(e) => setNewReplyContent(e.target.value)}
              required
            />
          </div>

          <div className="mb-2">
            <input
              type="file"
              className="form-control"
              onChange={(e) => setNewReplyImage(e.target.files[0])}
            />
          </div>

          <button
            type="submit"
            className="btn btn-sm btn-primary"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Reply"}
          </button>
        </form>
      )}

      {replies.length > 0 && (
        <div className="mt-3">
          {replies.map((nestedReply) => (
            <Reply
              key={nestedReply.id}
              reply={nestedReply}
              fetchReplies={fetchReplies}
              fetchPosts={fetchPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Reply;
