import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./pages/Navbar";        
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import AuthRoute from "./pages/AuthRoute";  

export default function App() {
  return (
    <>
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <AuthRoute>
                <Goals />
              </AuthRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
