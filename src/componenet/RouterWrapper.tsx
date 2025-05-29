"use client";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../app/login/page';
import Dashboard from '../app/Dashboard/page';
import ProtectedRoute from '../componenet/ProtectedRoute';
import Home from '../app/page';

export default function RouterWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
