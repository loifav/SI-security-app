import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    // Fetch CSRF token
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/api/get_csrf_token",
          { withCredentials: true }
        );
        setCsrfToken(response.data.csrf_token);
        console.log("Token CSRF:", response.data.csrf_token); // Check if the token is retrieved successfully
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };

    fetchCsrfToken();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate CSRF token before making the request
    if (!csrfToken) {
      console.error("CSRF token not available");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/login",
        { username, password },
        {
          headers: {
            "X-CSRFToken": csrfToken, // Include CSRF token in the request headers
          },
          withCredentials: true, // Enable sending cookies (if required)
        }
      );

      console.log("Login successful:", response.data);
    } catch (error) {
      // Enhanced error handling
      if (axios.isAxiosError(error)) {
        // Axios specific error handling
        console.error("Login failed with status:", error.response?.status);
        console.error("Login failed response data:", error.response?.data);
        alert(`Login failed: ${error.response?.data.msg || "Unknown error"}`);
      } else {
        // Generic error handling
        console.error("Login failed:", error);
        alert("Login failed: Network error");
      }
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
