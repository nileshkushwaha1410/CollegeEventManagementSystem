
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useEvents } from "../context/EventContext";



function AdminAttendance() {
  
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [qrToken, setQrToken] = useState("");
const [qrError, setQrError] = useState("");
const [qrLoading, setQrLoading] = useState(false);


  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
  } catch {
    currentUser = null;
  }

  const authToken = localStorage.getItem("authToken");

useEffect(() => {
  let cancelled = false;

  async function generateQrToken() {
    setQrToken("");
    setQrError("");

    if (!selectedEventId || !authToken) {
      return;
    }

    setQrLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/registrations/qr/${selectedEventId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not generate QR code.");
      }

      if (!cancelled) {
        setQrToken(data.qrToken);
      }
    } catch (error) {
      if (!cancelled) {
        setQrError(error.message || "Could not generate QR code.");
      }
    } finally {
      if (!cancelled) {
        setQrLoading(false);
      }
    }
  }

  generateQrToken();

  return () => {
    cancelled = true;
  };
}, [selectedEventId, authToken]);

useEffect(() => {
  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        "http://localhost:5000/api/registrations/admin/attendance",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load attendance.");
      }

      setAttendanceRecords(data.records || []);
    } catch (error) {
      console.error("Fetch attendance error:", error);
    }
  };

  fetchAttendance();
}, []);


  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const selectedEvent = events.find(
    (event) => String(event.id) === String(selectedEventId)
  );

  const filteredAttendanceRecords = attendanceRecords.filter(
  (record) =>
    String(record.event?._id) === String(selectedEventId)
);



  // The QR identifies the event; the scanner will verify
  // the logged-in student's registration separately.
  const qrValue = qrToken;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">EVENT MANAGEMENT</span>
          <h1>QR Attendance</h1>
          <p>Generate an event QR code and review attendance.</p>
        </div>

        <Link to="/admin-dashboard" className="login-button">
          Back to Dashboard
        </Link>
      </header>

      <section className="dashboard-section">
        <h2>Select an Event</h2>

        {events.length === 0 ? (
          <p>No events are available. Create an event first.</p>
        ) : (
          <select
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
          >
            <option value="">-- Choose an event --</option>

            {events.map((event) => (
              <option key={event.id} value={String(event.id)}>
                {event.title}
              </option>
            ))}
          </select>
        )}

        {selectedEvent && (
          <div style={{ marginTop: "24px" }}>
            <h3>{selectedEvent.title}</h3>
            <p>Date: {selectedEvent.date}</p>
            <p>
              Venue: {selectedEvent.venue || selectedEvent.location || "Not specified"}
            </p>

            <div
              style={{
                background: "#ffffff",
                padding: "20px",
                display: "inline-block",
                marginTop: "12px",
                borderRadius: "12px",
              }}
            >
              {qrLoading ? (
  <p>Generating secure QR code...</p>
) : qrError ? (
  <p role="alert">{qrError}</p>
) : qrValue ? (
  <QRCodeSVG value={qrValue} size={220} level="H" />
) : (
  <p>Select an event to generate its QR code.</p>
)}
            </div>

            <p>
              Display this QR code for students to scan at the event.
            </p>

            
<h3>
  Attendance Records ({filteredAttendanceRecords.length})
</h3>

{filteredAttendanceRecords.length === 0 ? (
  <p>No attendance recorded for this event yet.</p>
) : (
  <div className="dashboard-event-list">
    {filteredAttendanceRecords.map((record) => (
      <article
        className="dashboard-event-card"
        key={record._id}
      >
        <h3>{record.student?.name || "Unknown student"}</h3>
        <p>{record.student?.email || "No email available"}</p>
        <p>Event: {record.event?.title || "Unknown event"}</p>
        <p>Status: {record.status}</p>
        <p>
          Checked in:{" "}
          {record.updatedAt
            ? new Date(record.updatedAt).toLocaleString()
            : "Not available"}
        </p>
      </article>
    ))}
  </div>
)}


            {attendanceRecords.length === 0 ? (
              <p>No attendance recorded yet.</p>
            ) : (
              <div className="dashboard-event-list">
                {attendanceRecords.map((record) => (
                  <article
                    className="dashboard-event-card"
                    key={record.id}
                  >
                    <h3>{record.studentName}</h3>
                    <p>{record.studentEmail}</p>
                    <p>Status: {record.status}</p>
                    <p>
                      Checked in:{" "}
                      {new Date(record.attendedAt).toLocaleString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminAttendance;
