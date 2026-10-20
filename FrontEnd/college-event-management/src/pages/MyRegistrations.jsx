
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "../context/EventContext";

const API_URL = "http://localhost:5000/api/registrations";

function readCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

function MyRegistrations() {
  const { events } = useEvents();
  const currentUser = readCurrentUser();
  const token = localStorage.getItem("authToken");

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRegistrations() {
      if (
        !currentUser ||
        currentUser.role !== "student" ||
        !token
      ) {
        setRegistrations([]);
        setError("Please log in with your student account to view registrations.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load your registrations."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        if (!cancelled) {
          // Show active registrations only.
          setRegistrations(
            data.filter(
              (record) => record.status === "registered"
            )
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Could not load registrations. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRegistrations();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.role, token]);

  const registeredEvents = registrations
    .map((record) => {
      // The backend populates the event details.
      const populatedEvent =
        record.event && typeof record.event === "object"
          ? record.event
          : null;

      const eventId =
        populatedEvent?._id ||
        populatedEvent?.id ||
        record.event;

      const event =
        events.find(
          (item) => String(item.id) === String(eventId)
        ) || populatedEvent;

      if (!event) return null;

      return {
        ...event,
        id: event._id || event.id,
        registrationId: record._id,
        registeredAt: record.registeredAt,
      };
    })
    .filter(Boolean);

  return (
    <main className="my-registrations-page">
      <div className="registrations-header">
        <span className="eyebrow">YOUR CAMPUS ACTIVITIES</span>

        <h1>My Registrations</h1>

        <p>
          Keep track of the college events you have registered for.
        </p>

        <span className="registration-count">
          {registeredEvents.length} registered event(s)
        </span>
      </div>

      {loading ? (
        <div className="no-registrations">
          <p>Loading your registrations...</p>
        </div>
      ) : error ? (
        <div className="no-registrations">
          <h2>Unable to load registrations</h2>
          <p>{error}</p>
          <Link to="/login" className="primary-button">
            Go to Login
          </Link>
        </div>
      ) : registeredEvents.length > 0 ? (
        <div className="registered-events-grid">
          {registeredEvents.map((event) => (
            <article
              className="registered-event-card"
              key={event.registrationId}
            >
              <span className="category">
                {event.category || "Other"}
              </span>

              <h2>{event.title}</h2>

              <p>{event.description}</p>

              <div className="registered-event-info">
                <span>📅 {event.date
                  ? String(event.date).slice(0, 10)
                  : "Date not specified"}
                </span>

                <span>
                  📍 {event.location || event.venue || "Not specified"}
                </span>
              </div>

              <Link
                to={`/events/${event.id}`}
                className="event-details-button"
              >
                View Details →
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="no-registrations">
          <h2>No registrations yet</h2>

          <p>
            You haven't registered for any events. Explore the
            upcoming college events and find something exciting!
          </p>

          <Link to="/" className="primary-button">
            Explore Events →
          </Link>
        </div>
      )}

      <div className="registrations-footer-link">
        <Link to="/">← Back to Home</Link>
      </div>
    </main>
  );
}

export default MyRegistrations;
