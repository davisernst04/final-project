// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

// 1. Create and export the context
export const AuthContext = createContext();

// 2. Export the provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // First try to get user from localStorage as a fallback
          try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
              setUser(storedUser);
            }
          } catch (e) {
            console.error("Error parsing stored user:", e);
          }

          // Then try to verify with the server
          const res = await api.get("/api/protected");
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error("Auth check error:", error);
          // Only clear if we get a 401 or 403 error (unauthorized)
          if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
          ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    // Store the complete user data including classification
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Export the custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
