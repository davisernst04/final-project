import { useState, useEffect } from "react";
import axios from "axios";

function Rating({ postId, replyId, fetchPosts, fetchReplies }) {
  const [userRating, setUserRating] = useState(null); // null = no rating, 1 = upvote, 0 = downvote
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);

  useEffect(() => {
    fetchRatings();
  }, [postId, replyId]);

  const fetchRatings = async () => {
    try {
      const params = {};
      if (postId) params.post_id = postId;
      if (replyId) params.reply_id = replyId;

      const response = await axios.get("/api/ratings", {
        params,
      });
      const ratings = response.data;

      // Calculate counts and user's rating
      let up = 0;
      let down = 0;
      let currentUserRating = null;
      let userId;
      try {
        const userStr = localStorage.getItem("user");
        userId = userStr ? JSON.parse(userStr)?.id : null;
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        userId = null;
      }

      ratings.forEach((r) => {
        if (r.rating === 1) up++;
        if (r.rating === 0) down++;
        if (r.user_id === userId) currentUserRating = r.rating;
      });

      setUpvotes(up);
      setDownvotes(down);
      setUserRating(currentUserRating);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const handleVote = async (newRating) => {
    try {
      const token = localStorage.getItem("token");
      let user;
      try {
        const userStr = localStorage.getItem("user");
        user = userStr ? JSON.parse(userStr) : null;
        if (!user) return;
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        return;
      }

      await axios.post(
        "/api/ratings",
        {
          user_id: user.id,
          post_id: postId || null,
          reply_id: replyId || null,
          rating: newRating,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Immediately update UI instead of waiting for fetch
      setUserRating((prev) => {
        if (prev === newRating) return null; // Toggle off
        return newRating; // Set new rating
      });

      // Force refresh counts
      await fetchRatings();
      if (fetchPosts) fetchPosts();
      if (fetchReplies) fetchReplies();
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };
  return (
    <div className="rating-buttons">
      <button
        onClick={() => handleVote(1)}
        style={{
          color: userRating === 1 ? "green" : "inherit",
          fontWeight: userRating === 1 ? "bold" : "normal",
        }}
      >
        👍 {upvotes}
      </button>
      <button
        onClick={() => handleVote(0)}
        style={{
          color: userRating === 0 ? "red" : "inherit",
          fontWeight: userRating === 0 ? "bold" : "normal",
        }}
      >
        👎 {downvotes}
      </button>
    </div>
  );
}

export default Rating;
