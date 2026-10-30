import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useEvents } from "../context/EventContext";

// Supports both "2026-10-20" and "October 20, 2026".
function parseEventDate(value) {
  if (!value) return null;

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

// Converts an event date into the format required by input type="date".
function toDateInputValue(value) {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = parseEventDate(value);

  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatEventDate(value) {
  const date = parseEventDate(value);

  if (!date) return "Date not available";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function AdminDashboard() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [registrationsCount, setRegistrationsCount] = useState(0);

  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
const [selectedCategory, setSelectedCategory] = useState("All");

  const [formData, setFormData] = useState({
    title: "",
    category: "Technical",
    date: "",
    venue: "",
    description: "",
  });

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
  } catch {
    currentUser = null;
  }

  const token = localStorage.getItem("authToken");

useEffect(() => {
  let cancelled = false;

  async function loadRegistrationsCount() {
    if (!currentUser || currentUser.role !== "admin" || !token) {
      setRegistrationsCount(0);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/registrations/admin/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not load registrations");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid registrations response");
      }

      if (!cancelled) {
        setRegistrationsCount(data.length);
      }
    } catch (error) {
      console.error("Failed to load registration count:", error);

      if (!cancelled) {
        setRegistrationsCount(0);
      }
    }
  }

  loadRegistrationsCount();

  return () => {
    cancelled = true;
  };
}, [currentUser?.role, token]);

  // Only logged-in admin accounts can access this page.
  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }



  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((event) => {
    const date = parseEventDate(event.date);

    if (!date) return false;

    date.setHours(0, 0, 0, 0);
    return date >= today;
  });

  const pastEvents = events.filter((event) => {
    const date = parseEventDate(event.date);

    if (!date) return false;

    date.setHours(0, 0, 0, 0);
    return date < today;
  });

  const eventCategories = new Set(
    events.map((event) => event.category).filter(Boolean)
  ).size;

  const availableCategories = [
  "All",
  ...new Set(events.map((event) => event.category).filter(Boolean)),
];

const filteredEvents = events.filter((event) => {
  const search = searchTerm.trim().toLowerCase();

  const matchesSearch = [
    event.title,
    event.category,
    event.venue,
    event.description,
  ].some((value) =>
    String(value || "").toLowerCase().includes(search)
  );

  const matchesCategory =
    selectedCategory === "All" ||
    event.category === selectedCategory;

  return matchesSearch && matchesCategory;
});

  function resetForm() {
    setFormData({
      title: "",
      category: "Technical",
      date: "",
      venue: "",
      description: "",
    });

    setEditingEventId(null);
    setShowEventForm(false);
  }

  function handleLogout() {
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  }

  function handleCreateEvent(e) {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.date ||
      !formData.venue.trim()
    ) {
      return;
    }

    const eventData = {
      ...formData,
      title: formData.title.trim(),
      venue: formData.venue.trim(),
      description: formData.description.trim(),
    };

    if (editingEventId !== null) {
      updateEvent(editingEventId, eventData);
    } else {
      addEvent(eventData);
    }

    resetForm();
  }

  function handleEditEvent(event) {
    setFormData({
      title: event.title || "",
      category: event.category || "Technical",
      date: toDateInputValue(event.date),
      venue: event.venue || "",
      description: event.description || "",
    });

    setEditingEventId(event.id);
    setShowEventForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteEvent(event) {
    const confirmed = window.confirm(
      `Do you want to delete "${event.title}"?`
    );

    if (confirmed) {
      deleteEvent(event.id);
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">COLLEGE EVENT MANAGEMENT</p>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {currentUser.name}!</p>
        </div>

        <button onClick={handleLogout} className="login-button">
          Logout
        </button>
      </header>

      
{/* Admin Quick Navigation */}
<section className="dashboard-section">
  <div className="student-section-heading">
    <h2>Admin Quick Links</h2>
    <span>Manage your college events</span>
  </div>

  <div className="admin-quick-links">
   

<a
  href="#event-management"
  className="admin-quick-link"
  onClick={() => {
    console.log("Opening Event Management section");
  }}
>
  <span className="admin-link-icon">📅</span>
  <span>Event Management</span>
</a>



    <Link to="/admin-analytics" className="admin-quick-link">
      <span className="admin-link-icon">📊</span>
      <span>Analytics &amp; Reports</span>
    </Link>

    <Link
  to="/admin-college-approvals"
  className="admin-quick-link"
>
  <span className="admin-link-icon">🏫</span>
  <span>College Account Approvals</span>
</Link>

    <Link to="/admin-feedback" className="admin-quick-link">
      <span className="admin-link-icon">⭐</span>
      <span>Feedback Reports</span>
    </Link>

    <Link to="/admin-attendance" className="admin-quick-link">
      <span className="admin-link-icon">📷</span>
      <span>QR Attendance</span>
    </Link>

    <Link to="/admin-announcements" className="admin-quick-link">
      <span className="admin-link-icon">📢</span>
      <span>Announcements</span>
    </Link>

    <Link to="/" className="admin-quick-link">
      <span className="admin-link-icon">🏠</span>
      <span>Home Page</span>
    </Link>

     <Link to="/admin-registrations" className="admin-quick-link">
  <span className="admin-link-icon">👥</span>
  <span>Student Registrations</span>
</Link>

  </div>
</section>


      {/* Dashboard statistics */}
      <section className="dashboard-stats">
        <article className="dashboard-stat-card">
          <h3>Total Events</h3>
          <p>{events.length}</p>
        </article>

        <article className="dashboard-stat-card">
  <h3>Total Registrations</h3>
  <p>{registrationsCount}</p>
</article>

        <article className="dashboard-stat-card">
          <h3>Event Categories</h3>
          <p>{eventCategories}</p>
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

      {/* Event creation and editing */}
      <section
  id="event-management"
  className="dashboard-section"
>
        <div className="student-section-heading">
          <h2>
            {editingEventId !== null ? "Edit Event" : "Manage Events"}
          </h2>

          <button
            type="button"
            className="auth-submit-button"
            onClick={() => {
              if (showEventForm) {
                resetForm();
              } else {
                setShowEventForm(true);
              }
            }}
          >
            {showEventForm ? "Close Form" : "+ Create Event"}
          </button>
        </div>

        {showEventForm && (
          <form className="auth-form" onSubmit={handleCreateEvent}>
            <label htmlFor="event-title">Event Title</label>
            <input
              id="event-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter event title"
              required
            />

            <label htmlFor="event-category">Category</label>
            <select
              id="event-category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option>Technical</option>
              <option>Cultural</option>
              <option>Sports</option>
              <option>Entrepreneurship</option>
              <option>Workshop</option>
              <option>Other</option>
            </select>

            <label htmlFor="event-date">Date</label>
            <input
              id="event-date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />

            <label htmlFor="event-venue">Venue</label>
            <input
              id="event-venue"
              value={formData.venue}
              onChange={(e) =>
                setFormData({ ...formData, venue: e.target.value })
              }
              placeholder="Enter event venue"
              required
            />

            <label htmlFor="event-description">Description</label>
            <textarea
              id="event-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Describe the event"
              rows={4}
            />

            <button type="submit" className="auth-submit-button">
              {editingEventId !== null ? "Update Event" : "Save Event"}
            </button>

            <button
              type="button"
              className="auth-submit-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          </form>
        )}
      </section>

      {/* Event list */}
      <section className="dashboard-section">
        <div className="student-section-heading">
          <h2>Available Events</h2>
          <span>{events.length} events</span>
        </div>

        {events.length === 0 ? (
          <div className="student-empty-state">
            <h3>No events available yet.</h3>
            <p>Create an event using the button above.</p>
          </div>
        ) : (
          <div className="dashboard-event-list">
            {events.map((event) => (
              <article className="dashboard-event-card" key={event.id}>
                <div>
                  <h3>
                    {event.icon ? `${event.icon} ` : ""}
                    {event.title}
                  </h3>
                  <p>Category: {event.category}</p>
                  <p>Date: {formatEventDate(event.date)}</p>
                  <p>Venue: {event.venue}</p>
                  <p>{event.description}</p>
                </div>

                <div className="event-actions">
                  <Link to={`/events/${event.id}`}>
                    View Event
                  </Link>

                  <button
                    type="button"
                    className="auth-submit-button"
                    onClick={() => handleEditEvent(event)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="auth-submit-button"
                    onClick={() => handleDeleteEvent(event)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      
<footer className="dashboard-footer">
  <Link to="/">Home</Link>
  {" · "}
  <Link to="/my-registrations">My Registrations</Link>
  {" · "}
  <Link to="/admin-attendance">QR Attendance</Link>
  {" · "}
  <Link to="/admin-analytics" className="login-button">
    Analytics &amp; Reports
  </Link>
<Link to="/admin-feedback" className="login-button">
  Event Feedback Report
</Link>

</footer>

    </main>
  );
}

export default AdminDashboard;
