
import { Link, Navigate } from "react-router-dom";
import { useEvents } from "../context/EventContext";
import "./StudentEventReminders.css";

function parseEventDate(value) {
  if (!value) return null;

  const text = String(value).trim();
  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoDate) {
    const date = new Date(
      Number(isoDate[1]),
      Number(isoDate[2]) - 1,
      Number(isoDate[3])
    );

    if (
      date.getFullYear() === Number(isoDate[1]) &&
      date.getMonth() === Number(isoDate[2]) - 1 &&
      date.getDate() === Number(isoDate[3])
    ) {
      return date;
    }

    return null;
  }

  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  );
}

function getDayNumber(date) {
  return Math.floor(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ) / 86400000
  );
}

function getRegisteredEventIds(currentUser) {
  const registeredIds = new Set();

  try {
    const records = JSON.parse(
      localStorage.getItem("eventRegistrations") || "[]"
    );

    if (!Array.isArray(records)) {
      return registeredIds;
    }

    records.forEach((record) => {
      // Support the older format containing event IDs.
      if (typeof record === "string" || typeof record === "number") {
        registeredIds.add(String(record));
        return;
      }

      if (!record || typeof record !== "object") {
        return;
      }

      // Newer registration records belong to a specific student.
      const sameStudentId =
        currentUser.id != null &&
        record.studentId != null &&
        String(record.studentId) === String(currentUser.id);

      const sameStudentEmail =
        currentUser.email &&
        record.studentEmail &&
        String(record.studentEmail).toLowerCase() ===
          String(currentUser.email).toLowerCase();

      if (sameStudentId || sameStudentEmail) {
        const eventId = record.eventId ?? record.event?.id;

        if (eventId != null) {
          registeredIds.add(String(eventId));
        }
      }
    });
  } catch (error) {
    console.error("Could not load event registrations:", error);
  }

  return registeredIds;
}

function StudentEventReminders() {
  const { events } = useEvents();

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
  } catch {
    currentUser = null;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "student") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  const registeredIds = getRegisteredEventIds(currentUser);
  const today = new Date();
  const todayNumber = getDayNumber(today);
  const eventList = Array.isArray(events) ? events : [];

  const reminders = eventList
    .filter((event) => registeredIds.has(String(event.id)))
    .map((event) => {
      const eventDate = parseEventDate(event.date);

      if (!eventDate) {
        return null;
      }

      const daysLeft = getDayNumber(eventDate) - todayNumber;

      if (daysLeft < 0) {
        return null;
      }

      return {
        ...event,
        reminderDate: eventDate,
        daysLeft,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  function getReminderLabel(daysLeft) {
    if (daysLeft === 0) return "Happening Today";
    if (daysLeft === 1) return "Happening Tomorrow";
    return `In ${daysLeft} days`;
  }

  return (
    <main className="event-reminders-page">
      <section className="event-reminders-container">
        <header className="event-reminders-header">
          <p className="event-reminders-eyebrow">
            STUDENT PORTAL
          </p>

          <h1>My Event Reminders</h1>

          <p>
            Stay updated on upcoming events you have registered for.
          </p>

          <div className="reminders-count">
            {reminders.length} upcoming{" "}
            {reminders.length === 1 ? "event" : "events"}
          </div>
        </header>

        {reminders.length === 0 ? (
          <section className="reminders-empty">
            <h2>No upcoming events</h2>
            <p>
              You have no upcoming registered events right now.
              Explore events and register to see reminders here.
            </p>

            <Link to="/" className="reminders-primary-link">
              Explore Events
            </Link>
          </section>
        ) : (
          <div className="reminders-list">
            {reminders.map((event) => (
              <article
                className="reminder-card"
                key={event.id}
              >
                <div className="reminder-card-top">
                  <span
                    className={
                      event.daysLeft <= 1
                        ? "reminder-badge urgent"
                        : "reminder-badge"
                    }
                  >
                    {getReminderLabel(event.daysLeft)}
                  </span>

                  <span className="reminder-category">
                    {event.category || "College Event"}
                  </span>
                </div>

                <h2>{event.title || "Untitled Event"}</h2>

                <p className="reminder-date">
                  <strong>Date:</strong>{" "}
                  {event.reminderDate.toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>

                <p className="reminder-venue">
                  <strong>Venue:</strong>{" "}
                  {event.venue || event.location || "To be announced"}
                </p>

                <div className="reminder-card-actions">
                  <Link
                    to={`/events/${event.id}`}
                    className="reminders-primary-link"
                  >
                    View Event
                  </Link>

                  <Link
                    to="/my-registrations"
                    className="reminders-secondary-link"
                  >
                    My Registrations
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <Link
          to="/student-dashboard"
          className="reminders-back-link"
        >
          ← Back to Student Dashboard
        </Link>
      </section>
    </main>
  );
}

export default StudentEventReminders;
