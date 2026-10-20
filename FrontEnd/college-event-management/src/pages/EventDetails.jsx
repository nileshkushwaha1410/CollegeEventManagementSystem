
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEvents } from "../context/EventContext";

const API_URL = "http://localhost:5000/api/registrations";

function readCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

function EventDetails() {
  const { events } = useEvents();
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = readCurrentUser();
  const token = localStorage.getItem("authToken");

  const event = events.find(
    (item) => String(item.id) === String(id)
  );

  const [registration, setRegistration] = useState(null);
  const [checkingRegistration, setCheckingRegistration] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load this student's registration from the backend.
  useEffect(() => {
    let cancelled = false;

    async function loadRegistration() {
      setRegistration(null);
      setMessage("");
      setError("");

      if (
        !currentUser ||
        currentUser.role !== "student" ||
        !currentUser.id ||
        !token ||
        !event
      ) {
        return;
      }

      setCheckingRegistration(true);

      try {
        const response = await fetch(`${API_URL}/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load your registration."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected registration response.");
        }

        const existingRegistration = data.find((record) => {
          const registeredEventId =
            record.event?._id || record.event?.id || record.event;

          return (
            String(registeredEventId) === String(event.id) &&
            record.status !== "cancelled"
          );
        });

        if (!cancelled) {
          setRegistration(existingRegistration || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load registration status.");
        }
      } finally {
        if (!cancelled) {
          setCheckingRegistration(false);
        }
      }
    }

    loadRegistration();

    return () => {
      cancelled = true;
    };
  }, [id, event?.id, currentUser?.id, currentUser?.role, token]);

  async function handleRegister() {
    if (!currentUser || currentUser.role !== "student") {
      navigate("/login");
      return;
    }

    if (!token) {
      setError("Please log in again to register for an event.");
      return;
    }

    if (!event || !/^[a-f\d]{24}$/i.test(String(event.id))) {
      setError(
        "This event does not have a valid backend ID. Please use an event saved in the backend."
      );
      return;
    }

    setProcessing(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${event.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      setRegistration(data.registration);
      setMessage("Registration successful!");
    } catch (err) {
      setError(err.message || "Could not register for this event.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleCancelRegistration() {
    if (!currentUser || currentUser.role !== "student") {
      navigate("/login");
      return;
    }

    if (!token || !registration?._id) {
      setError("Registration details are missing. Please refresh the page.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel your registration?"
    );

    if (!confirmed) return;

    setProcessing(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/${registration._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Cancellation failed. Please try again."
        );
      }

      setRegistration(null);
      setMessage("Registration cancelled successfully.");
    } catch (err) {
      setError(err.message || "Could not cancel your registration.");
    } finally {
      setProcessing(false);
    }
  }

  if (!event) {
    return (
      <main className="details-page">
        <div className="details-card">
          <h1>Event Not Found</h1>
          <p>Sorry, we could not find this event.</p>
          <Link to="/" className="back-link">
            ← Back to Events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="details-page">
      <Link to="/" className="back-link">
        ← Back to Events
      </Link>

      <section className="details-card">
        <span className="eyebrow">{event.category} EVENT</span>

        <h1>{event.title}</h1>

        <p className="details-description">{event.description}</p>

        <div className="event-information">
          <div className="information-item">
            <span>📅 Date</span>
            <strong>{event.date}</strong>
          </div>

          <div className="information-item">
            <span>📍 Venue</span>
            <strong>
              {event.venue || event.location || "Not specified"}
            </strong>
          </div>

          <div className="information-item">
            <span>🏷️ Category</span>
            <strong>{event.category}</strong>
          </div>
        </div>

        {currentUser?.role === "student" && checkingRegistration && (
          <p>Checking your registration...</p>
        )}

        {currentUser?.role === "student" && (
          registration ? (
            <button
              type="button"
              className="register-button"
              onClick={handleCancelRegistration}
              disabled={processing || checkingRegistration}
            >
              {processing ? "Please wait..." : "Cancel Registration"}
            </button>
          ) : (
            <button
              type="button"
              className="register-button"
              onClick={handleRegister}
              disabled={processing || checkingRegistration}
            >
              {processing
                ? "Please wait..."
                : "Register for Event"}
            </button>
          )
        )}

        {(!currentUser || currentUser.role !== "student") && (
          <button
            type="button"
            className="register-button"
            onClick={() => navigate("/login")}
          >
            Log in to Register
          </button>
        )}

        {message && (
          <p className="registration-success" role="status">
            {message}
          </p>
        )}

        {error && (
          <p role="alert">
            {error}
          </p>
        )}

        {registration && (
          <Link
            to={`/events/${event.id}/feedback`}
            className="primary-button"
          >
            Give Event Feedback
          </Link>
        )}

        <Link to="/" className="primary-button">
          Explore More Events
        </Link>
      </section>
    </main>
  );
}

export default EventDetails;
