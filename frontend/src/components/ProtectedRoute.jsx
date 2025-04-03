// components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, isAdmin = false }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin && (!user || user.email !== "admin@admin.com")) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
