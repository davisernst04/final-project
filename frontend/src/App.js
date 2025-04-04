// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import ChannelsList from "./components/ChannelsList";
import ChannelPage from "./components/ChannelPage";
import CreateChannel from "./components/CreateChannel";
import LoadingSpinner from "./components/LoadingSpinner";
import LandingPage from "./components/LandingPage";
import Search from "./components/Search";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container mt-4">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/channels" element={<ChannelsList />} />
        <Route path="/channels/:channelId" element={<ChannelPage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/create-channel" element={<CreateChannel />} />
      </Route>
    </Routes>
  );
}

export default App;
