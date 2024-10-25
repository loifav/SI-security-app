// App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Protected from "./ProtectedPage";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./AuthContext"; // Ensure you have this for context

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<Protected />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
