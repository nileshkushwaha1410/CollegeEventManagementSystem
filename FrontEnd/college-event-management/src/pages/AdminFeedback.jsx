
import { Link, Navigate } from "react-router-dom";
import { useEvents } from "../context/EventContext";
import "./AdminFeedback.css";

function readFeedback() {
  try {
    const data = JSON.parse(
      localStorage.getItem("eventFeedback") || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function AdminFeedback() {
  const { events } = useEvents();

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
  } catch {
    currentUser = null;
  }

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const feedback = readFeedback();

  const averageRating =
    feedback.length > 0
      ? feedback.reduce(
          (total, item) => total + Number(item.rating || 0),
          0
        ) / feedback.length
      : 0;

  const eventSummaries = events.map((event) => {
    const eventFeedback = feedback.filter(
      (item) => String(item.eventId) === String(event.id)
    );

    const average =
      eventFeedback.length > 0
        ? eventFeedback.reduce(
            (total, item) => total + Number(item.rating || 0),
            0
          ) / eventFeedback.length
        : 0;

    return {
      id: event.id,
      title: event.title,
      count: eventFeedback.length,
      average,
    };
  });

  const sortedFeedback = [...feedback].sort(
    (a, b) =>
      new Date(b.submittedAt || 0) -
      new Date(a.submittedAt || 0)
  );

  function downloadFeedbackCsv() {
    if (feedback.length === 0) {
      alert("There is no feedback to export yet.");
      return;
    }

    const headers = [
      "eventTitle",
      "studentName",
      "studentEmail",
      "rating",
      "comment",
      "submittedAt",
    ];

    const escapeCsv = (value) => {
      let text = value == null ? "" : String(value);

      if (/^[\t\r ]*[=+\-@]/.test(text)) {
        text = "'" + text;
      }

      return `"${text.replace(/"/g, '""')}"`;
    };

    const csv = [
      headers.map(escapeCsv).join(","),
      ...feedback.map((item) =>
        headers.map((key) => escapeCsv(item[key])).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "event-feedback-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="admin-feedback-page">
      <header className="admin-feedback-header">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Event Feedback Report</h1>
          <p>Review student ratings and comments for college events.</p>
        </div>

        <Link to="/admin-dashboard" className="login-button">
          Back to Dashboard
        </Link>
      </header>

      <section className="admin-feedback-stats">
        <article className="admin-feedback-stat">
          <span>Total Feedback</span>
          <strong>{feedback.length}</strong>
        </article>

        <article className="admin-feedback-stat">
          <span>Overall Average Rating</span>
          <strong>
            {feedback.length > 0
              ? `${averageRating.toFixed(1)} / 5`
              : "N/A"}
          </strong>
        </article>

        <article className="admin-feedback-stat">
          <span>Events With Feedback</span>
          <strong>
            {eventSummaries.filter((item) => item.count > 0).length}
          </strong>
        </article>
      </section>

      <section className="admin-feedback-section">
        <div className="admin-feedback-section-heading">
          <h2>Event-wise Ratings</h2>

          <button
            type="button"
            className="login-button"
            onClick={downloadFeedbackCsv}
          >
            Export Feedback CSV
          </button>
        </div>

        {eventSummaries.length === 0 ? (
          <p>No events are available yet.</p>
        ) : (
          <div className="admin-feedback-table-wrap">
            <table className="admin-feedback-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Feedback Count</th>
                  <th>Average Rating</th>
                </tr>
              </thead>

              <tbody>
                {eventSummaries.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.count}</td>
                    <td>
                      {item.count > 0
                        ? `${item.average.toFixed(1)} / 5 ★`
                        : "No ratings yet"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-feedback-section">
        <h2>Student Comments</h2>

        {sortedFeedback.length === 0 ? (
          <p>No student feedback has been submitted yet.</p>
        ) : (
          <div className="admin-feedback-list">
            {sortedFeedback.map((item, index) => (
              <article
                className="admin-feedback-comment"
                key={item.id || `${item.eventId}-${item.studentId}-${index}`}
              >
                <div className="admin-feedback-comment-heading">
                  <div>
                    <h3>{item.eventTitle || "Event"}</h3>
                    <p>{item.studentName || "Student"}</p>
                    {item.studentEmail && <p>{item.studentEmail}</p>}
                  </div>

                  <strong>
                    {"★".repeat(
                      Math.max(0, Math.min(5, Number(item.rating) || 0))
                    )}
                    {"☆".repeat(
                      5 -
                        Math.max(
                          0,
                          Math.min(5, Number(item.rating) || 0)
                        )
                    )}
                    {" "}
                    ({item.rating}/5)
                  </strong>
                </div>

                <p className="admin-feedback-comment-text">
                  {item.comment || "No comment provided."}
                </p>

                <small>
                  Submitted:{" "}
                  {item.submittedAt
                    ? new Date(item.submittedAt).toLocaleString()
                    : "Date unavailable"}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="admin-feedback-footer">
        <Link to="/admin-analytics">Analytics &amp; Reports</Link>
        {" · "}
        <Link to="/">Home</Link>
      </footer>
    </main>
  );
}

export default AdminFeedback;
