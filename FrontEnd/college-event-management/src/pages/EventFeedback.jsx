
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useEvents } from "../context/EventContext";
import "./EventFeedback.css";

const FEEDBACK_KEY = "eventFeedback";
const REGISTRATION_KEY = "eventRegistrations";

function readStorage(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

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

  const isRegistered =
    currentUser?.id != null &&
    readStorage(REGISTRATION_KEY).some(
      (record) =>
        record &&
        typeof record === "object" &&
        String(record.eventId) === String(id) &&
        String(record.studentId) === String(currentUser.id)
    );

  const existingFeedback = readStorage(FEEDBACK_KEY).find(
    (record) =>
      record &&
      String(record.eventId) === String(id) &&
      String(record.studentId) === String(currentUser?.id)
  );

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

  function handleSubmit(eventObject) {
    eventObject.preventDefault();
    setMessage("");

    if (!isRegistered) {
      setMessage("Please register for this event before submitting feedback.");
      return;
    }

    if (currentUser.id == null) {
      setMessage("Your student ID is missing. Please log in again.");
      return;
    }

    // Read the latest saved data before submitting.
    const registrations = readStorage(REGISTRATION_KEY);
    const stillRegistered = registrations.some(
      (record) =>
        record &&
        typeof record === "object" &&
        String(record.eventId) === String(id) &&
        String(record.studentId) === String(currentUser.id)
    );

    if (!stillRegistered) {
      setMessage("You must be registered for this event to give feedback.");
      return;
    }

    const feedbackList = readStorage(FEEDBACK_KEY);

    const alreadySubmitted = feedbackList.some(
      (record) =>
        record &&
        String(record.eventId) === String(id) &&
        String(record.studentId) === String(currentUser.id)
    );

    if (alreadySubmitted) {
      setMessage("You have already submitted feedback for this event.");
      return;
    }

    const trimmedComment = comment.trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setMessage("Please select a rating from 1 to 5.");
      return;
    }

    if (!trimmedComment) {
      setMessage("Please enter your feedback before submitting.");
      return;
    }

    const newFeedback = {
      id: `feedback-${Date.now()}`,
      eventId: String(id),
      eventTitle: event.title,
      studentId: String(currentUser.id),
      studentName: currentUser.name || "Student",
      studentEmail: currentUser.email || "",
      rating,
      comment: trimmedComment,
      submittedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        FEEDBACK_KEY,
        JSON.stringify([...feedbackList, newFeedback])
      );

      setComment("");
      setMessage("Thank you! Your feedback has been submitted.");
    } catch (error) {
      console.error("Could not save feedback:", error);
      setMessage("Feedback could not be saved. Please try again.");
    }
  }

  return (
    <main className="feedback-page">
      <section className="feedback-card">
        <Link to={`/events/${event.id}`} className="feedback-back-link">
          ← Back to Event
        </Link>

        <span className="eyebrow">STUDENT FEEDBACK</span>
        <h1>{event.title}</h1>
        <p>Share your experience to help improve future college events.</p>

        {!isRegistered ? (
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

            <button type="submit" className="feedback-button">
              Submit Feedback
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
