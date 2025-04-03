import React, { useState, useEffect } from "react";
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

      const response = await axios.get("http://localhost:8080/api/ratings", {
        params,
      });
      const ratings = response.data;

      // Calculate counts and user's rating
      let up = 0;
      let down = 0;
      let currentUserRating = null;
      const userId = JSON.parse(localStorage.getItem("user"))?.id;

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
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      // Determine if the user is removing their vote or changing it
      const finalRating = userRating === newRating ? null : newRating;

      // Optimistically update local state before sending to backend
      setUpvotes((prevUpvotes) => {
        let newUpvotes = prevUpvotes;
        if (userRating === 1) {
          newUpvotes--; // Remove existing upvote
        }
        if (finalRating === 1) {
          newUpvotes++; // Add new upvote
        }
        return newUpvotes;
      });

      setDownvotes((prevDownvotes) => {
        let newDownvotes = prevDownvotes;
        if (userRating === 0) {
          newDownvotes--; // Remove existing downvote
        }
        if (finalRating === 0) {
          newDownvotes++; // Add new downvote
        }
        return newDownvotes;
      });

      // Update user's rating locally
      setUserRating(finalRating);

      // Send request to backend
      await axios.post(
        "http://localhost:8080/api/ratings",
        {
          user_id: user.id,
          post_id: postId || null,
          reply_id: replyId || null,
          rating: finalRating,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Optionally refetch data from backend to ensure consistency
      // fetchRatings(); //Comment this line so it doesnt affect current ratings
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
