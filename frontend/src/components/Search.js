import { useState } from "react";
import api from "../utils/api";

const Search = () => {
  const [query, setQuery] = useState("");
  const [advanced, setAdvanced] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.length < 3 && !advanced) {
      setError(
        "Query must be at least 3 characters long or select an advanced search option.",
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      let response;

      if (advanced === "userMostPosts") {
        response = await api.get("/api/search/user-most-posts");
        setResults([response.data]);
      } else if (advanced === "userHighestRating") {
        response = await api.get("/api/search/user-highest-rating");
        setResults([response.data]);
      } else if (advanced === "userLowestRating") {
        response = await api.get("/api/search/user-lowest-rating");
        setResults([response.data]);
      } else if (advanced === "userLeastPosts") {
        response = await api.get("/api/search/user-least-posts");
        setResults([response.data]);
      } else {
        let endpoint = "/api/search/advanced";
        endpoint += query.includes("@") ? `?email=${query}` : `?q=${query}`;
        response = await api.get(endpoint);
        setResults(response.data.posts || []);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Search Posts & Users</h2>
      <form onSubmit={handleSearch} className="mb-3">
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter search text or user email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <small className="form-text text-muted">
            Search for posts by content or find a user by email
          </small>
        </div>

        <div className="mb-3">
          <label className="form-label">Advanced Search Options:</label>
          <select
            value={advanced}
            onChange={(e) => setAdvanced(e.target.value)}
            className="form-select"
          >
            <option value="">--None--</option>
            <option value="userMostPosts">User with Most Posts</option>
            <option value="userLeastPosts">User with Least Posts</option>
            <option value="userHighestRating">User with Highest Rating</option>
            <option value="userLowestRating">User with Lowest Rating</option>
          </select>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      <div>
        {results.length > 0 ? (
          <div className="search-results">
            <h3>Results</h3>
            {results.map((result, index) => (
              <div key={result.id || index} className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">
                    {result.name || `User ${result.id}`}
                    {result.email && `(${result.email})`}
                    {result.classification && (
                      <span
                        className={`badge ms-2 bg-${getClassificationColor(result.classification)}`}
                      >
                        {result.classification}
                      </span>
                    )}
                  </h5>
                  {result.postCount !== undefined && (
                    <p className="card-text">Posts: {result.postCount}</p>
                  )}
                  {result.ratingScore !== undefined && (
                    <p className="card-text">
                      Rating Score: {result.ratingScore}
                    </p>
                  )}
                  {result.content && (
                    <p className="card-text">{result.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

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

export default Search;
