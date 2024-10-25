// AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/get_csrf_token",
          {
            withCredentials: true,
          }
        );
        setCsrfToken(response.data.csrf_token);
      } catch (err) {
        setError("Failed to fetch CSRF token.");
      }
    };

    fetchCsrfToken();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/login",
        { username, password },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setIsLoggedIn(true);
        setError(null);
      }
    } catch (error: any) {
      setError(error.response ? error.response.data.msg : "An error occurred.");
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/logout",
        {},
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setIsLoggedIn(false);
        setError(null);
      }
    } catch (error: any) {
      setError(
        error.response
          ? error.response.data.msg
          : "An error occurred during logout."
      );
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};
