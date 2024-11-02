import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn === null) {
    return <div>Loading...</div>;
  }

  return isLoggedIn ? (
    children ? (
      <>{children}</>
    ) : (
      <Outlet />
    )
  ) : (
    <Navigate to="/" />
  );
};

export default ProtectedRoute;
