// components/Search.js
import React, { useState } from "react";
import axios from "axios";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `http://localhost:8080/api/search/posts?q=${query}`,
      );
      setResults(response.data);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  return (
    <div>
      <h2>Search</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
        />
        <button type="submit">Search</button>
      </form>
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.content}</li>
        ))}
      </ul>
    </div>
  );
}

export default Search;
