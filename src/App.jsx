import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/home";
import TeacherLogin from "./pages/Login/TeacherLogin";
import TeacherRegister from "./pages/Register/TeacherRegister";
import StudentLogin from "./pages/Login/StudentLogin";
import StudentRegister from "./pages/Register/StudentRegister";
import TeacherDashboard from "./components/TeacherDashboard/Main";
import StudentDashboard from "./components/StudentDashboard/Main";
import NoteBook from "./components/StudentDashboard/NoteBook/main";
import RecentVisit from "./components/StudentDashboard/RecentVisit";
import SearchPage from "./components/StudentDashboard/SearchPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated (e.g., by checking local storage)
    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/student-login" />;
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<TeacherLogin />} />
      <Route path="/register" element={<TeacherRegister />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-register" element={<StudentRegister />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      
      {/* Protected routes */}
      <Route path="/student-dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
      <Route path="/notebook" element={<PrivateRoute><NoteBook /></PrivateRoute>} />
      <Route path="/recentvisit" element={<PrivateRoute><RecentVisit /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
    </Routes>
  );
}

export default App;