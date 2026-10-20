
import { Link, Navigate } from "react-router-dom";
import { useEvents } from "../context/EventContext";
import { getAnnouncements } from "../utils/announcements";
import { useState } from "react";

import {
  getReadAnnouncementIds,
  getUnreadAnnouncementCount,
} from "../utils/notificationReadStatus";

function StudentDashboard() {
    const announcements = getAnnouncements();

const [readAnnouncementIds] = useState(() => {
  try {
    const user = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

    return getReadAnnouncementIds(user?.id);
  } catch {
    return [];
  }
});

const unreadAnnouncementCount = getUnreadAnnouncementCount(
  (() => {
    try {
      return JSON.parse(
        localStorage.getItem("currentUser") || "null"
      )?.id;
    } catch {
      return null;
    }
  })(),
  announcements
);
    const { events } = useEvents();
  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
  } catch {
    currentUser = null;
  }

  // Only logged-in student accounts can access this page.
  if (!currentUser || currentUser.role !== "student") {
    return <Navigate to="/login" replace />;
  }

   let registrationRecords = [];

try {
  const saved = JSON.parse(
    localStorage.getItem("eventRegistrations") || "[]"
  );

  if (Array.isArray(saved)) {
    registrationRecords = saved;
  }
} catch {
  registrationRecords = [];
}

const registeredEvents = events.filter((event) =>
  registrationRecords.some(
    (record) =>
      record &&
      typeof record === "object" &&
      String(record.eventId) === String(event.id) &&
      currentUser.id != null &&
      String(record.studentId) === String(currentUser.id)
  )
);

  const today = new Date();
today.setHours(0, 0, 0, 0);


const upcomingEvents = events.filter((event) => {
  if (!event.date) return false;

  // Supports both "October 20, 2026" and "2026-10-20"
  const eventDate = new Date(event.date);

  if (Number.isNaN(eventDate.getTime())) return false;

  // Compare calendar dates without time-of-day issues
  eventDate.setHours(0, 0, 0, 0);

  const todayDate = new Date(today);
  todayDate.setHours(0, 0, 0, 0);

  return eventDate >= todayDate;
});

const pastEvents = events.filter((event) => {
  if (!event.date) return false;

  const eventDate = new Date(event.date);

  if (Number.isNaN(eventDate.getTime())) return false;

  eventDate.setHours(0, 0, 0, 0);

  const todayDate = new Date(today);
  todayDate.setHours(0, 0, 0, 0);

  return eventDate < todayDate;
});


  function handleLogout() {
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">STUDENT PORTAL</p>
          <h1>Student Dashboard</h1>
          <p>Welcome back, {currentUser.name}!</p>
          <p>{currentUser.email}</p>
        </div>

        <button onClick={handleLogout} className="login-button">
          Logout
        </button>
      </header>


  <main className="dashboard-page">

    {/* Dashboard header */}
    <header className="dashboard-header">
      {/* Keep your existing welcome message and logout button */}
    </header>

    {/* MOVE your existing Quick Links section here */}
 <section className="student-quick-links">
  <h2>Quick Links</h2>

  <Link to="/">Browse All Events</Link>

  <Link to="/my-registrations">
    Manage My Registrations
  </Link>

  <Link to="/scan-attendance" className="login-button">
    Scan Event QR
  </Link>

   <Link to="/student-notifications">
  View Notifications & Announcements
</Link>

     <Link to="/student-notifications" className="dashboard-notifications-link">
  Notifications & Announcements
  <span className="notification-count">
  {unreadAnnouncementCount}
</span>
</Link>

<Link to="/student-profile">
  My Profile
</Link>

<Link to="/event-reminders">
  Event Reminders
</Link>

</section>



    {/* Dashboard statistics */}
    <section className="dashboard-stats">
      {/* Keep all your existing statistics */}
    </section>

    {/* Keep your existing upcoming and past events sections */}

  </main>


      <section className="dashboard-stats">
        <article className="dashboard-stat-card">
          <h3>Available Events</h3>
          <p>{events.length}</p>
        </article>

        <article className="dashboard-stat-card">
          <h3>My Registrations</h3>
          <p>{registeredEvents.length}</p>
        </article>

        <article className="dashboard-stat-card">
  <h3>Upcoming Events</h3>
  <p>{upcomingEvents.length}</p>
</article>

          <article className="dashboard-stat-card">
    <h3>Past Events</h3>
    <p>{pastEvents.length}</p>
  </article>

      </section>

      
<section className="dashboard-section">
  <div className="student-section-heading">
    <h2>Upcoming Events</h2>
    <span>{upcomingEvents.length} events</span>
  </div>

  {upcomingEvents.length === 0 ? (
    <div className="student-empty-state">
      <h3>No upcoming events available.</h3>
      <p>Check back later for new campus events.</p>
      <Link to="/">Browse All Events</Link>
    </div>
  ) : (
    <div className="dashboard-event-list">
      {upcomingEvents.map((event) => (
        <article
          className="dashboard-event-card"
          key={event.id}
        >
          <div>
            <h3>{event.icon} {event.title}</h3>
            <p>{event.category}</p>
            <p>Date: {event.date}</p>
            <p>Venue: {event.venue}</p>
            <p>{event.description}</p>
          </div>

          <Link to={`/events/${event.id}`}>
            View Event
          </Link>
        </article>
      ))}
    </div>
  )}
</section>


      <section className="dashboard-section">
        <div className="student-section-heading">
          <h2>My Registered Events</h2>
          <Link to="/my-registrations">
            View All Registrations
          </Link>
        </div>

        {registeredEvents.length === 0 ? (
          <div className="student-empty-state">
            <h3>You haven't registered for any events yet.</h3>
            <p>Explore campus events and find something you enjoy!</p>
            <Link to="/">Browse Events</Link>
          </div>
        ) : (
          <div className="dashboard-event-list">
            {registeredEvents.map((event) => (
              <article
                className="dashboard-event-card"
                key={event.id}
              >
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.category}</p>
                  <p>Date: {event.date}</p>
                  <p>Venue: {event.venue}</p>
                </div>

                <Link to={`/events/${event.id}`}>
                  View Event
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      
<section className="dashboard-section">
  <div className="student-section-heading">
    <h2>Past Events</h2>
    <span>{pastEvents.length} events</span>
  </div>

  {pastEvents.length === 0 ? (
    <div className="student-empty-state">
      <h3>No past events yet.</h3>
      <p>Events will appear here after their dates have passed.</p>
    </div>
  ) : (
    <div className="dashboard-event-list">
      {pastEvents.map((event) => (
        <article
          className="dashboard-event-card"
          key={event.id}
        >
          <div>
            <h3>{event.icon} {event.title}</h3>
            <p>{event.category}</p>
            <p>Date: {event.date}</p>
            <p>Venue: {event.venue}</p>
          </div>

          <Link to={`/events/${event.id}`}>
            View Event
          </Link>
        </article>
      ))}
    </div>
  )}
</section>


   

      <footer className="dashboard-footer">
        <Link to="/">Home</Link>
      </footer>
    </main>
  );
}

export default StudentDashboard;
