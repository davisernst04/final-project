import React from "react";
import { Link, Routes, Route, BrowserRouter } from "react-router-dom";
import ChannelList from "./components/ChannelList";
import ChannelView from "./components/ChannelView";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Search from "./components/Search";
import AdminPanel from "./components/AdminPanel";
function App() {
  return (
    <BrowserRouter>
      <div>
        <h1>Programming Issues Tool</h1>
        <nav>
          <Link to="/">Home</Link> | <Link to="/channels">Channels</Link> |{" "}
          <Link to="/signup">Signup</Link> | <Link to="/login">Login</Link> |{" "}
          <Link to="/admin">Admin</Link> | <Link to="/search">Search</Link>
        </nav>
        <Routes>
          <Route
            path="/"
            element={<div>Welcome to the Programming Issues Tool!</div>}
          />
          <Route
            path="/channels"
            element={
              <ProtectedRoute>
                <ChannelList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/channels/:channelId"
            element={
              <ProtectedRoute>
                <ChannelView />
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAdmin={true}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
