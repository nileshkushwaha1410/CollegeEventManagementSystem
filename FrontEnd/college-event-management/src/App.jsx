
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import MyRegistrations from "./pages/MyRegistrations";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminAttendance from "./pages/AdminAttendance";
import StudentScanAttendance from "./pages/StudentScanAttendance";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import StudentNotifications from "./pages/StudentNotifications";
import StudentProfile from "./pages/StudentProfile";
import StudentEventReminders from "./pages/StudentEventReminders";
import EventFeedback from "./pages/EventFeedback";
import AdminFeedback from "./pages/AdminFeedback";
import "./responsive.css";
import AdminRegistrations from "./pages/AdminRegistrations";

import { EventProvider } from "./context/EventContext";

import { useState } from "react";
import WelcomeScreen from "./components/WelcomeScreen";
import AdminCollegeApprovals from "./pages/AdminCollegeApprovals";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  return (
    <BrowserRouter>
      <EventProvider>
        {showWelcome && (
    <WelcomeScreen onEnter={() => setShowWelcome(false)} />
  )}
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Home />} />

          {/* Event details */}
          <Route
            path="/events/:id"
            element={<EventDetails />}
          />

          {/* Login and signup */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student registrations */}
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute>
                <MyRegistrations />
              </ProtectedRoute>
            }
          />

          {/* Admin dashboard */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

           <Route
  path="/admin-college-approvals"
  element={<AdminCollegeApprovals />}
/>

          {/* Student dashboard */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          
<Route
  path="/admin-dashboard"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/student-dashboard"
  element={
    <ProtectedRoute requiredRole="student">
      <StudentDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin-attendance"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminAttendance />
    </ProtectedRoute>
  }
/>

  <Route
  path="/scan-attendance"
  element={
    <ProtectedRoute requiredRole="student">
      <StudentScanAttendance />
    </ProtectedRoute>
  }
/>
  <Route
  path="/admin-analytics"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminAnalytics />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin-announcements"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminAnnouncements />
    </ProtectedRoute>
  }
/>
<Route
  path="/student-notifications"
  element={
    <ProtectedRoute requiredRole="student">
      <StudentNotifications />
    </ProtectedRoute>
  }
/>

<Route
  path="/student-profile"
  element={
    <ProtectedRoute requiredRole="student">
      <StudentProfile />
    </ProtectedRoute>
  }
/>

<Route
  path="/event-reminders"
  element={
    <ProtectedRoute requiredRole="student">
      <StudentEventReminders />
    </ProtectedRoute>
  }
/>

<Route
  path="/events/:id/feedback"
  element={
    <ProtectedRoute requiredRole="student">
      <EventFeedback />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin-feedback"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminFeedback />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin-registrations"
  element={<AdminRegistrations />}
/>

        </Routes>
      </EventProvider>
    </BrowserRouter>
  );
}

export default App;

