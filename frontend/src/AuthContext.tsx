import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  isLoggedIn: boolean | null;
  loading: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => useContext(AuthContext)!;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Fetch CSRF token
        const csrfResponse = await axios.get(
          "http://localhost:5000/api/get_csrf_token",
          {
            withCredentials: true,
          }
        );
        setCsrfToken(csrfResponse.data.csrf_token);
        console.log("CSRF Token:", csrfResponse.data.csrf_token);

        // Check if user is logged in
        const authResponse = await axios.get(
          "http://localhost:5000/api/check_logged_in",
          {
            withCredentials: true,
          }
        );
        console.log("Auth Check Response:", authResponse.data);
        setIsLoggedIn(authResponse.data.logged_in);

        if (authResponse.data.logged_in) {
          const userResponse = await axios.get(
            "http://localhost:5000/api/get_user",
            {
              withCredentials: true,
            }
          );
          setUsername(userResponse.data.username);
          console.log("Logged in User:", userResponse.data.username);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        setError("Failed to verify login status.");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isLoggedIn) {
      const checkSessionStatus = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/check_logged_in",
            {
              withCredentials: true,
            }
          );
          console.log("Session Check Response:", response.data);
          if (!response.data.logged_in) {
            setIsLoggedIn(false);
            setUsername(null);
            setError(null);
          }
        } catch (err) {
          console.error("Error checking session status:", err);
        }
      };

      intervalId = setInterval(checkSessionStatus, 3000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoggedIn]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/login",
        { username, password },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      console.log("Login Response:", response.data);
      if (response.status === 200) {
        setIsLoggedIn(true);
        setUsername(username);
        setError(null);
      }
    } catch (error: any) {
      setError(
        error.response
          ? error.response.data.msg
          : "An error occurred during login."
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/logout",
        {},
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      console.log("Logout Response:", response.data);
      if (response.status === 200) {
        setIsLoggedIn(false);
        setUsername(null);
        setError(null);
      }
    } catch (error: any) {
      setError(
        error.response
          ? error.response.data.msg
          : "An error occurred during logout."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, loading, username, login, logout, error, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
