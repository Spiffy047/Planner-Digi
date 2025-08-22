import React from "react";
import { Navigate } from "react-router-dom";

// Replace with real auth check later
const isAuthenticated = () => {
  return !!localStorage.getItem("user"); 
};

export default function AuthRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}
