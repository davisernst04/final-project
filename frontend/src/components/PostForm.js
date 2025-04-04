import { useState } from "react";
import api from "../utils/api";

import { getImageUrl } from "../utils/getImageUrl";
const PostForm = ({ channelId, existingPost, onCancel, onSuccess }) => {
  const [content, setContent] = useState(existingPost?.content || "");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("channel_id", channelId);
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      if (existingPost) {
        await api.put(`/api/posts/${existingPost.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/posts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setContent("");
      setImage(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error saving post:", err);
      setError(err.response?.data?.message || "Error saving post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">
          {existingPost ? "Edit Post" : "Create Post"}
        </h5>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="content" className="form-label">
              Content
            </label>
            <textarea
              id="content"
              className="form-control"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="image" className="form-label">
              Image (optional)
            </label>
            <input
              id="image"
              type="file"
              className="form-control"
              onChange={(e) => setImage(e.target.files[0])}
            />
            {existingPost?.image_url && !image && (
              <div className="mt-2">
                <p className="text-muted">
                  Current image will be kept if no new image is selected
                </p>
                <img
                  src={getImageUrl(existingPost.image_url)}
                  alt="Current post"
                  style={{ maxWidth: "200px" }}
                  className="img-thumbnail"
                />
              </div>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : existingPost ? "Update" : "Submit"}
            </button>

            {onCancel && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
