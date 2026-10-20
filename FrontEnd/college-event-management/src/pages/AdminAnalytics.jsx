
import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useEvents } from "../context/EventContext";
import { exportCsv } from "../utils/exportCsv";

function readStorage(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function AdminAnalytics() {
  const { events } = useEvents();

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
  } catch {
    currentUser = null;
  }

  const registrations = useMemo(
    () => readStorage("eventRegistrations"),
    []
  );

  const attendance = useMemo(
    () => readStorage("eventAttendance"),
    []
  );

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  // Support student-specific registration records when available.
  // A legacy string entry contains only an event ID, not a student.
  const studentRegistrations = registrations.filter(
    (item) =>
      item &&
      typeof item === "object" &&
      item.eventId != null &&
      (item.studentId != null || item.userId != null)
  );

  const hasStudentRegistrationData = studentRegistrations.length > 0;

  const totalRegistrations = hasStudentRegistrationData
    ? studentRegistrations.length
    : registrations.length;

  const totalAttendance = attendance.filter(
    (record) =>
      record &&
      record.eventId != null &&
      record.studentId != null
  ).length;

  const attendanceRate = hasStudentRegistrationData
    ? Math.min(
        100,
        (totalAttendance / totalRegistrations) * 100
      )
    : null;

  const categoryStats = Object.entries(
    events.reduce((result, event) => {
      const category = event.category || "Other";
      result[category] = (result[category] || 0) + 1;
      return result;
    }, {})
  )
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const maxCategoryCount = Math.max(
    1,
    ...categoryStats.map((item) => item.count)
  );

    
  const eventReports = events.map((event) => {
    const eventRegistrations = hasStudentRegistrationData
      ? studentRegistrations.filter(
          (record) => String(record.eventId) === String(event.id)
        ).length
      : registrations.filter(
          (id) => String(id) === String(event.id)
        ).length;

    const eventAttendance = attendance.filter(
      (record) =>
        String(record.eventId) === String(event.id) &&
        record.studentId != null
    );

    const eventRate =
      hasStudentRegistrationData && eventRegistrations > 0
        ? Math.min(
            100,
            (eventAttendance.length / eventRegistrations) * 100
          )
        : null;

    return {
      ...event,
      registrationCount: eventRegistrations,
      attendanceCount: eventAttendance.length,
      attendanceRate: eventRate,
    };
  });

  // Read saved event feedback without changing existing analytics.
  const feedback = useMemo(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("eventFeedback") || "[]"
      );
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }, []);

  const averageFeedbackRating =
    feedback.length > 0
      ? feedback.reduce(
          (total, item) => total + Number(item.rating || 0),
          0
        ) / feedback.length
      : null;

  const feedbackEventReports = events.map((event) => {
    const eventFeedback = feedback.filter(
      (item) => String(item.eventId) === String(event.id)
    );

    const average =
      eventFeedback.length > 0
        ? eventFeedback.reduce(
            (total, item) => total + Number(item.rating || 0),
            0
          ) / eventFeedback.length
        : null;

    return {
      id: event.id,
      title: event.title,
      feedbackCount: eventFeedback.length,
      averageRating: average,
    };
  });

  const highestRatedEvent = [...feedbackEventReports]
    .filter((event) => event.averageRating !== null)
    .sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return b.feedbackCount - a.feedbackCount;
    })[0];


    // Prepare registration records for CSV export.
  const registrationExportRows = registrations.map((item) => {
    // Older records may contain only an event ID.
    if (typeof item !== "object" || item === null) {
      const event = events.find(
        (event) => String(event.id) === String(item)
      );

      return {
        eventId: item,
        eventTitle: event?.title || "Unknown event",
        recordType: "Legacy event-ID entry",
        studentId: "",
        studentEmail: "",
      };
    }

    const event = events.find(
      (event) => String(event.id) === String(item.eventId)
    );

    return {
      ...item,
      eventTitle: event?.title || "Unknown event",
    };
  });

  // Prepare attendance records for CSV export.
  const attendanceExportRows = attendance.map((record) => {
    const event = events.find(
      (event) => String(event.id) === String(record.eventId)
    );

    return {
      ...record,
      eventTitle: event?.title || "Unknown event",
    };
  });

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Analytics &amp; Reports</h1>
          <p>
            Review event activity, registrations, and recorded attendance.
          </p>
        </div>

        <Link
          to="/admin-dashboard"
          className="login-button"
        >
          Back to Dashboard
        </Link>
      </header>

      {/* Summary cards */}
      <section className="dashboard-stats">
        <article className="dashboard-stat-card">
          <h3>Total Events</h3>
          <p>{events.length}</p>
        </article>

        <article className="dashboard-stat-card">
          <h3>Total Registrations</h3>
          <p>{totalRegistrations}</p>
          <small>
            {hasStudentRegistrationData
              ? "Student registration records"
              : "Saved event-ID entries; not a student total"}
          </small>
        </article>

        <article className="dashboard-stat-card">
          <h3>Recorded Attendance</h3>
          <p>{totalAttendance}</p>
          <small>Unique attendance entries saved</small>
        </article>

        <article className="dashboard-stat-card">
          <h3>Attendance Rate</h3>
          <p>
            {attendanceRate === null
              ? "N/A"
              : `${attendanceRate.toFixed(1)}%`}
          </p>
          <small>
            {attendanceRate === null
              ? "Requires student-specific registration records"
              : "Based on saved registration and attendance records"}
          </small>
        </article>
      </section>

      
  <section className="dashboard-stats">
    <article className="dashboard-stat-card">
      <h3>Total Feedback</h3>
      <p>{feedback.length}</p>
      <small>Saved student submissions</small>
    </article>

    <article className="dashboard-stat-card">
      <h3>Average Rating</h3>
      <p>
        {averageFeedbackRating === null
          ? "N/A"
          : `${averageFeedbackRating.toFixed(1)} / 5`}
      </p>
      <small>Across submitted feedback</small>
    </article>

    <article className="dashboard-stat-card">
      <h3>Highest-Rated Event</h3>
      <p>
        {highestRatedEvent
          ? `${highestRatedEvent.averageRating.toFixed(1)} / 5`
          : "N/A"}
      </p>
      <small>
        {highestRatedEvent
          ? highestRatedEvent.title
          : "No feedback received yet"}
      </small>
    </article>
  </section>


      {/* Category report */}
      <section className="dashboard-section">
        <div className="student-section-heading">
          <h2>Category-wise Event Statistics</h2>
        </div>

        {categoryStats.length === 0 ? (
          <p>No events are available for reporting yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {categoryStats.map((item) => (
              <div key={item.category}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <strong>{item.category}</strong>
                  <span>
                    {item.count} event{item.count === 1 ? "" : "s"}
                  </span>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "12px",
                    background: "#e5e7eb",
                    borderRadius: "20px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${
                        (item.count / maxCategoryCount) * 100
                      }%`,
                      height: "100%",
                      background: "#4f46e5",
                      borderRadius: "20px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Event-wise report */}
      <section className="dashboard-section">
  <div
    className="student-section-heading"
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px",
    }}
  >
    <h2>Event-wise Reports</h2>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      <button
        type="button"
        className="login-button"
        onClick={() =>
          exportCsv(
            "event-registrations.csv",
            registrationExportRows
          )
        }
      >
        Export Registrations CSV
      </button>

      <button
        type="button"
        className="login-button"
        onClick={() =>
          exportCsv(
            "event-attendance.csv",
            attendanceExportRows
          )
        }
      >
        Export Attendance CSV
      </button>
    </div>
  </div>

        {eventReports.length === 0 ? (
          <p>No events are available for reporting yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr>
                  <th style={{ padding: "12px" }}>Event</th>
                  <th style={{ padding: "12px" }}>Category</th>
                  <th style={{ padding: "12px" }}>Registrations</th>
                  <th style={{ padding: "12px" }}>Attendance</th>
                  <th style={{ padding: "12px" }}>Attendance Rate</th>
                </tr>
              </thead>

              <tbody>
                {eventReports.map((event) => (
                  <tr key={event.id}>
                    <td style={{ padding: "12px" }}>
                      <strong>{event.title}</strong>
                      <br />
                      <small>{event.date}</small>
                    </td>

                    <td style={{ padding: "12px" }}>
                      {event.category || "Other"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {event.registrationCount}
                      {!hasStudentRegistrationData &&
                        event.registrationCount > 0 &&
                        " (legacy entry)"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {event.attendanceCount}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {event.attendanceRate === null
                        ? "N/A"
                        : `${event.attendanceRate.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ marginTop: "16px", fontSize: "14px" }}>
          Note: Legacy registration entries identify events, not individual
          students. Their counts cannot be used to calculate a reliable
          student attendance rate.
        </p>
      </section>

        
  <section className="dashboard-section">
    <div className="student-section-heading">
      <h2>Event Feedback Ratings</h2>
    </div>

    {feedbackEventReports.length === 0 ? (
      <p>No events are available for feedback reporting yet.</p>
    ) : (
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: "12px" }}>Event</th>
              <th style={{ padding: "12px" }}>Feedback Count</th>
              <th style={{ padding: "12px" }}>Average Rating</th>
            </tr>
          </thead>

          <tbody>
            {feedbackEventReports.map((event) => (
              <tr key={event.id}>
                <td style={{ padding: "12px" }}>
                  {event.title}
                </td>
                <td style={{ padding: "12px" }}>
                  {event.feedbackCount}
                </td>
                <td style={{ padding: "12px" }}>
                  {event.averageRating === null
                    ? "No ratings yet"
                    : `${event.averageRating.toFixed(1)} / 5`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>


      <footer className="dashboard-footer">
        <Link to="/admin-attendance">QR Attendance</Link>
        {" · "}
        <Link to="/">Home</Link>
      </footer>
    </main>
  );
}

export default AdminAnalytics;
