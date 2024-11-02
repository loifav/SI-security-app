import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const Protected: React.FC = () => {
  const { isLoggedIn, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div>
      <h2>Protected Page</h2>
      {isLoggedIn ? (
        <>
          <p>Welcome, {username}!</p>
          <p>You have access to this protected content.</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>You do not have access. Please log in.</p>
      )}
    </div>
  );
};

export default Protected;
