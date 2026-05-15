import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("careerflow_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  const register = async (formData) => {
    const { data } = await API.post("/auth/register", formData);

    localStorage.setItem("careerflow_token", data.token);
    localStorage.setItem("careerflow_user", JSON.stringify(data.user));

    setUser(data.user);

    return data;
  };

  const login = async (formData) => {
    const { data } = await API.post("/auth/login", formData);

    localStorage.setItem("careerflow_token", data.token);
    localStorage.setItem("careerflow_user", JSON.stringify(data.user));

    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("careerflow_token");
    localStorage.removeItem("careerflow_user");
    setUser(null);
  };

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem("careerflow_token");

      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await API.get("/auth/me");
      setUser(data.user);
      localStorage.setItem("careerflow_user", JSON.stringify(data.user));
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);