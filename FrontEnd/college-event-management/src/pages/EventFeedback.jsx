
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useEvents } from "../context/EventContext";
import "./EventFeedback.css";





function readCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

function EventFeedback() {
  const { events } = useEvents();
  const { id } = useParams();
  const currentUser = readCurrentUser();

  const event = events.find(
    (item) => String(item.id) === String(id)
  );

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
const [existingFeedback, setExistingFeedback] = useState(null);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);

 useEffect(() => {
  const fetchFeedbackData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const API_URL =
        "https://college-event-management-system-api.onrender.com/api";

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [registrationResponse, feedbackResponse] = await Promise.all([
        fetch(`${API_URL}/registrations/my`, { headers }),
        fetch(`${API_URL}/feedback/my`, { headers }),
      ]);

      if (!registrationResponse.ok || !feedbackResponse.ok) {
        throw new Error("Unable to load registration or feedback details.");
      }

      const registrationData = await registrationResponse.json();
      const feedbackData = await feedbackResponse.json();

      const registered = registrationData.some((record) => {
        const eventId = record.event?._id || record.event;

        return (
          String(eventId) === String(id) &&
          ["registered", "attended"].includes(record.status)
        );
      });

      const previousFeedback = feedbackData.find((record) => {
        const eventId = record.event?._id || record.event;
        return String(eventId) === String(id);
      });

      setIsRegistered(registered);
      setExistingFeedback(previousFeedback || null);
    } catch (error) {
      console.error("Feedback loading error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchFeedbackData();
}, [id]);

  if (!currentUser || currentUser.role !== "student") {
    return <Navigate to="/login" replace />;
  }

  if (!event) {
    return (
      <main className="feedback-page">
        <section className="feedback-card">
          <h1>Event Not Found</h1>
          <Link to="/">Back to Events</Link>
        </section>
      </main>
    );
  }

const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage("");

  if (!isRegistered) {
    setMessage("You must register for this event before submitting feedback.");
    return;
  }

  if (existingFeedback) {
    setMessage("You have already submitted feedback for this event.");
    return;
  }

  if (rating < 1 || rating > 5) {
    setMessage("Please select a rating between 1 and 5.");
    return;
  }

  const trimmedComment = comment.trim();

  if (!trimmedComment) {
    setMessage("Please write a comment.");
    return;
  }

  try {
    setSubmitting(true);

    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("Please log in again.");
    }

    const response = await fetch(
      `https://college-event-management-system-api.onrender.com/api/feedback/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(rating),
          comment: trimmedComment,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to submit feedback.");
    }

    setExistingFeedback({
      rating: Number(rating),
      comment: trimmedComment,
    });

    setComment("");
    setMessage(data.message || "Feedback submitted successfully!");
  } catch (error) {
    console.error("Feedback submission error:", error);
    setMessage(error.message);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <main className="feedback-page">
      <section className="feedback-card">
        <Link to={`/events/${event.id}`} className="feedback-back-link">
          ← Back to Event
        </Link>

        <span className="eyebrow">STUDENT FEEDBACK</span>
        <h1>{event.title}</h1>
        <p>Share your experience to help improve future college events.</p>

       {loading ? (
  <p>Checking your registration and feedback...</p>
) : message && !isRegistered && !existingFeedback ? (
  <div className="feedback-notice">
    <p>{message}</p>
  </div>
) : !isRegistered ? (

          <div className="feedback-notice">
            <p>You must register for this event before submitting feedback.</p>
            <Link to={`/events/${event.id}`} className="feedback-button">
              View Event and Register
            </Link>
          </div>
        ) : existingFeedback ? (
          <div className="feedback-notice">
            <h2>Feedback Already Submitted</h2>
            <p>Your rating: {"★".repeat(existingFeedback.rating)}{"☆".repeat(5 - existingFeedback.rating)}</p>
            <p>{existingFeedback.comment}</p>
            <p>You can submit feedback only once per event.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="feedback-label">Your Rating</label>

            <div className="feedback-stars" role="group" aria-label="Choose a rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= rating ? "feedback-star selected" : "feedback-star"}
                  onClick={() => setRating(star)}
                  aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                  aria-pressed={rating === star}
                >
                  ★
                </button>
              ))}
            </div>

            <p className="feedback-rating-label">
              {rating} out of 5 stars
            </p>

            <label htmlFor="feedback-comment" className="feedback-label">
              Your Comments
            </label>

            <textarea
              id="feedback-comment"
              value={comment}
              onChange={(eventObject) => setComment(eventObject.target.value)}
              placeholder="What did you like? What could be improved?"
              rows={5}
              maxLength={1000}
              required
            />

            <p className="feedback-character-count">
              {comment.length}/1000 characters
            </p>

           <button type="submit" disabled={submitting || !comment.trim()}>
  {submitting ? "Submitting..." : "Submit Feedback"}
</button>

          </form>
        )}

        {message && (
          <p className="feedback-message" role="status">
            {message}
          </p>
        )}

        <Link to="/student-dashboard" className="feedback-dashboard-link">
          Back to Student Dashboard
        </Link>
      </section>
    </main>
  );
}

export default EventFeedback;
