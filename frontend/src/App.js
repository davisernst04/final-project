import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((result) => setData(result.currentTime))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="App">
      <h1>Welcome to My Full-Stack App</h1>
      {data ? <p>Server Time: {data}</p> : <p>Loading...</p>}
    </div>
  );
}

export default App;
